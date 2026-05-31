import asyncio
import time
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.llm import get_openrouter_llm
from app.agents.cost import extract_usage, estimate_cost
from app.agents.parsing import extract_json
from app.api.agents import get_db
from app.db.models import BenchmarkRun, BenchmarkResult

router = APIRouter(tags=["bench"])

MAX_COMBOS = 36  # models x temperatures x test_inputs guardrail
REGRESSION_THRESHOLD = 1  # a cell "fails" if score drops > 1 vs baseline


class BenchRequest(BaseModel):
    system_prompt: str = Field(min_length=1, max_length=20000)
    test_inputs: list[str] = Field(min_length=1, max_length=12)
    models: list[str] = Field(min_length=1, max_length=6)
    temperatures: list[float] = Field(default=[0.2, 0.7])
    max_tokens: int = Field(default=1024, ge=1, le=8000)
    critic_model: str = "openai/gpt-4o-mini"
    criteria: str | None = None
    baseline_id: str | None = None


async def _score(critic_model: str, system: str, user: str, output: str, criteria: str | None) -> int:
    extra = f" Evaluate specifically against these criteria: {criteria}." if criteria else ""
    prompt = (
        "You are an evaluator. Given a SYSTEM PROMPT, a USER INPUT, and the MODEL RESPONSE it "
        f"produced, score the response 1-10 on how well it fulfills the system prompt's intent.{extra}\n"
        'Return ONLY JSON: {"score": <1-10>}\n\n'
        f"SYSTEM PROMPT:\n{system}\n\nUSER INPUT:\n{user}\n\nMODEL RESPONSE:\n{output[:6000]}"
    )
    try:
        resp = await get_openrouter_llm(critic_model, temperature=0).ainvoke(prompt)
        parsed = extract_json(resp.content)
        return int(parsed.get("score", 0)) if isinstance(parsed, dict) else 0
    except Exception:
        return 0


async def _one(model: str, temperature: float, max_tokens: int, system: str, user: str, critic_model: str, criteria: str | None):
    t0 = time.perf_counter()
    try:
        resp = await get_openrouter_llm(model, temperature=temperature, max_tokens=max_tokens).ainvoke(
            [("system", system), ("user", user)]
        )
    except Exception as e:
        return {"input": user, "output": f"[error] {str(e)[:160]}", "score": 0, "latency_ms": 0, "tokens": 0, "cost": 0.0}
    latency_ms = int((time.perf_counter() - t0) * 1000)
    inp, out = extract_usage(resp)
    score = await _score(critic_model, system, user, resp.content, criteria)
    return {
        "input": user, "output": resp.content, "score": score,
        "latency_ms": latency_ms, "tokens": inp + out, "cost": round(estimate_cost(model, inp, out), 6),
    }


async def _cell(model: str, temperature: float, req: BenchRequest) -> dict:
    runs = await asyncio.gather(*[
        _one(model, temperature, req.max_tokens, req.system_prompt, ti, req.critic_model, req.criteria)
        for ti in req.test_inputs
    ])
    n = len(runs) or 1
    return {
        "model": model,
        "temperature": temperature,
        "score": round(sum(r["score"] for r in runs) / n),
        "latency_ms": round(sum(r["latency_ms"] for r in runs) / n),
        "tokens": sum(r["tokens"] for r in runs),
        "cost": round(sum(r["cost"] for r in runs), 6),
        "outputs": runs,
    }


@router.post("/bench/run")
async def bench_run(request: BenchRequest, db: AsyncSession = Depends(get_db)):
    combos = len(request.models) * len(request.temperatures) * len(request.test_inputs)
    if combos > MAX_COMBOS:
        raise HTTPException(status_code=400, detail=f"{combos} combinations exceeds limit of {MAX_COMBOS}. Reduce models, temperatures, or test inputs.")

    run_id = str(uuid4())
    pairs = [(m, t) for m in request.models for t in request.temperatures]
    cells = await asyncio.gather(*[_cell(m, t, request) for m, t in pairs])
    cells.sort(key=lambda c: c["score"], reverse=True)

    # Optional regression comparison against a saved baseline.
    baseline = None
    if request.baseline_id:
        base_rows = (await db.execute(
            select(BenchmarkResult).where(BenchmarkResult.run_id == request.baseline_id)
        )).scalars().all()
        base_map = {(r.model, round(r.temperature or 0, 2)): r.score or 0 for r in base_rows}
        deltas = []
        for c in cells:
            prev = base_map.get((c["model"], round(c["temperature"], 2)))
            if prev is None:
                continue
            delta = c["score"] - prev
            deltas.append({
                "model": c["model"], "temperature": c["temperature"],
                "baseline": prev, "current": c["score"], "delta": delta,
                "pass": delta >= -REGRESSION_THRESHOLD,
            })
        baseline = {"baseline_id": request.baseline_id, "deltas": deltas, "regressed": any(not d["pass"] for d in deltas)}

    db.add(BenchmarkRun(
        id=run_id, system_prompt=request.system_prompt, test_inputs=request.test_inputs,
        models=request.models, settings={"temperatures": request.temperatures, "max_tokens": request.max_tokens},
        critic_model=request.critic_model, is_baseline=False,
    ))
    for c in cells:
        db.add(BenchmarkResult(
            id=str(uuid4()), run_id=run_id, model=c["model"], temperature=c["temperature"],
            score=c["score"], latency_ms=c["latency_ms"], tokens=c["tokens"], cost=c["cost"], outputs=c["outputs"],
        ))
    await db.commit()

    return {"run_id": run_id, "cells": cells, "baseline": baseline}


@router.post("/bench/runs/{run_id}/baseline")
async def mark_baseline(run_id: str, db: AsyncSession = Depends(get_db)):
    run = (await db.execute(select(BenchmarkRun).where(BenchmarkRun.id == run_id))).scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    run.is_baseline = True
    await db.commit()
    return {"run_id": run_id, "is_baseline": True}


@router.get("/bench/baselines")
async def list_baselines(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(
        select(BenchmarkRun).where(BenchmarkRun.is_baseline.is_(True)).order_by(BenchmarkRun.created_at.desc()).limit(50)
    )).scalars().all()
    return [
        {"run_id": r.id, "label": r.label, "models": r.models, "created_at": r.created_at.isoformat() if r.created_at else None}
        for r in rows
    ]
