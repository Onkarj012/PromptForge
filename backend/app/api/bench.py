import asyncio
import json
import time
from uuid import uuid4

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.llm import get_openrouter_llm
from app.agents.cost import extract_usage, estimate_cost
from app.api.agents import get_db
from app.db.models import BenchmarkRun, BenchmarkResult

router = APIRouter(tags=["bench"])


class BenchRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=20000)
    models: list[str] = Field(min_length=1, max_length=6)
    critic_model: str = "openai/gpt-4o-mini"


async def _score_output(critic_model: str, prompt: str, output: str) -> int:
    """Score a model's output quality 1-10 via the evaluator model."""
    eval_prompt = (
        "You are an expert evaluator. Score the RESPONSE to the PROMPT on overall "
        "quality (helpfulness, correctness, structure) from 1-10.\n"
        'Return ONLY JSON: {"score": <1-10>}\n\n'
        f"PROMPT:\n{prompt}\n\nRESPONSE:\n{output[:6000]}"
    )
    try:
        resp = await get_openrouter_llm(critic_model).ainvoke(eval_prompt)
        return int(json.loads(resp.content.strip()).get("score", 0))
    except Exception:
        return 0


async def _run_model(model: str, prompt: str, critic_model: str) -> dict:
    t0 = time.perf_counter()
    try:
        resp = await get_openrouter_llm(model).ainvoke(prompt)
    except Exception as e:
        return {"model": model, "error": str(e)[:200]}
    latency_ms = int((time.perf_counter() - t0) * 1000)
    output = resp.content
    inp, out = extract_usage(resp)
    cost = round(estimate_cost(model, inp, out), 6)
    score = await _score_output(critic_model, prompt, output)
    qpd = round(score / cost, 2) if cost > 0 else None  # quality per dollar
    return {
        "model": model,
        "output": output,
        "score": score,
        "latency_ms": latency_ms,
        "tokens": inp + out,
        "cost": cost,
        "quality_per_dollar": qpd,
    }


@router.post("/bench/run")
async def bench_run(request: BenchRequest, db: AsyncSession = Depends(get_db)):
    run_id = str(uuid4())
    results = await asyncio.gather(
        *[_run_model(m, request.prompt, request.critic_model) for m in request.models]
    )
    ranked = sorted(results, key=lambda r: r.get("score", 0), reverse=True)

    db.add(BenchmarkRun(id=run_id, prompt=request.prompt, critic_model=request.critic_model))
    for r in results:
        if "error" in r:
            continue
        db.add(BenchmarkResult(
            id=str(uuid4()), run_id=run_id, model=r["model"], score=r["score"],
            latency_ms=r["latency_ms"], tokens=r["tokens"], cost=r["cost"], output=r["output"],
        ))
    await db.commit()

    return {"run_id": run_id, "results": ranked}
