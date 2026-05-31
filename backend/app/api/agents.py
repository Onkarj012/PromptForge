import json
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.db.models import PromptRun, PromptIteration, PromptMemory
from app.agents.graph import build_prompt_graph


class RefineRequest(BaseModel):
    prompt: str = Field(min_length=10, max_length=20000)
    mode: str = "user_defined"
    creator_model: str = "anthropic/claude-3.5-sonnet"
    critic_model: str = "openai/gpt-4o-mini"
    iterations: int = Field(default=3, ge=1, le=10)
    target_tool: str = "generic"
    project_type: str | None = None
    stack: str | None = None
    steer: str | None = None  # one-tap chip / free-text steer for follow-up passes
    test_inputs: list[str] | None = None  # scenarios to run the candidate prompt on
    test_model: str | None = None  # model used to execute the candidate (defaults to critic)
    assertions: list[dict] | None = None  # deterministic checks on the observed outputs


router = APIRouter(tags=["agents"])


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def _initial_state(request: RefineRequest, run_id: str) -> dict:
    return {
        "original_prompt": request.prompt,
        "current_prompt": request.prompt,
        "critique": None,
        "iteration": 0,
        "max_iterations": request.iterations,
        "creator_model": request.creator_model,
        "critic_model": request.critic_model,
        "target_tool": request.target_tool,
        "project_type": request.project_type,
        "stack": request.stack,
        "steer": request.steer,
        "test_inputs": request.test_inputs,
        "test_model": request.test_model,
        "assertions": request.assertions,
        "test_outputs": [],
        "assertion_results": {},
        "history": [],
        "metadata": {"run_id": run_id},
        "usage": {"input_tokens": 0, "output_tokens": 0, "cost": 0.0},
        "iter_usage": {"input_tokens": 0, "output_tokens": 0, "cost": 0.0},
    }


async def _persist(db: AsyncSession, run: PromptRun, request: RefineRequest, final_state: dict):
    history = final_state.get("history", [])
    usage = final_state.get("usage", {})
    run.final_prompt = final_state.get("current_prompt")
    run.final_score = final_state.get("final_score")
    run.total_cost = round(usage.get("cost", 0.0), 6)
    run.total_tokens = usage.get("input_tokens", 0) + usage.get("output_tokens", 0)
    for h in history:
        db.add(PromptIteration(
            id=str(uuid4()), run_id=run.id, iteration=h["iteration"],
            prompt=h["prompt"], critique=h.get("critique"), score=h.get("score"),
        ))
    db.add(PromptMemory(
        id=str(uuid4()), title=request.prompt[:60], current_version=1,
        state={"final_prompt": run.final_prompt, "final_score": run.final_score, "history": history},
    ))
    await db.commit()


@router.post("/prompt/refine")
async def refine_prompt(request: RefineRequest, db: AsyncSession = Depends(get_db)):
    run_id = str(uuid4())
    run = PromptRun(
        id=run_id, mode=request.mode, creator_model=request.creator_model,
        critic_model=request.critic_model, max_iterations=request.iterations,
        original_prompt=request.prompt,
    )
    db.add(run)
    await db.commit()

    final_state = await build_prompt_graph().ainvoke(_initial_state(request, run_id))
    await _persist(db, run, request, final_state)

    usage = final_state.get("usage", {})
    return {
        "run_id": run_id,
        "final_prompt": final_state["current_prompt"],
        "final_score": final_state.get("final_score"),
        "iterations": final_state["iteration"],
        "iterations_detail": final_state.get("history", []),
        "total_cost": round(usage.get("cost", 0.0), 6),
        "total_tokens": usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
    }


def _sse(event: str, data: dict) -> str:
    return f"data: {json.dumps({'event': event, **data})}\n\n"


@router.post("/prompt/refine/stream")
async def refine_stream(request: RefineRequest, db: AsyncSession = Depends(get_db)):
    """Live SSE: emits 'draft' (creator), 'critique' (critic), 'iteration', then 'done'."""
    run_id = str(uuid4())
    run = PromptRun(
        id=run_id, mode=request.mode, creator_model=request.creator_model,
        critic_model=request.critic_model, max_iterations=request.iterations,
        original_prompt=request.prompt,
    )
    db.add(run)
    await db.commit()

    async def gen():
        yield _sse("start", {"run_id": run_id, "original_prompt": request.prompt})
        final_state: dict = {}
        try:
            async for chunk in build_prompt_graph().astream(_initial_state(request, run_id)):
                for node, st in chunk.items():
                    final_state = st
                    if node == "creator":
                        yield _sse("draft", {"iteration": st.get("iteration", 0) + 1, "prompt": st.get("current_prompt", "")})
                    elif node == "tester":
                        yield _sse("test", {"outputs": st.get("test_outputs", [])})
                    elif node == "asserts":
                        yield _sse("assert", st.get("assertion_results", {}))
                    elif node == "critic":
                        crit = st.get("critique") or {}
                        yield _sse("critique", {"score": crit.get("score"), "critique": crit})
                    elif node == "control":
                        hist = st.get("history", [])
                        if hist:
                            yield _sse("iteration", hist[-1])
            await _persist(db, run, request, final_state)
            usage = final_state.get("usage", {})
            yield _sse("done", {
                "run_id": run_id,
                "final_prompt": final_state.get("current_prompt"),
                "final_score": final_state.get("final_score"),
                "iterations": final_state.get("iteration"),
                "total_cost": round(usage.get("cost", 0.0), 6),
                "total_tokens": usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
            })
        except Exception as e:  # surface errors over the stream
            yield _sse("error", {"message": str(e)[:300]})

    return StreamingResponse(gen(), media_type="text/event-stream")


@router.get("/prompt/runs")
async def list_runs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PromptRun).order_by(PromptRun.created_at.desc()).limit(50))
    return [
        {
            "run_id": r.id, "mode": r.mode, "creator_model": r.creator_model,
            "critic_model": r.critic_model, "original_prompt": r.original_prompt,
            "final_score": r.final_score, "total_cost": r.total_cost,
            "total_tokens": r.total_tokens, "max_iterations": r.max_iterations,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in result.scalars().all()
    ]


@router.get("/prompt/runs/{run_id}")
async def get_run(run_id: str, db: AsyncSession = Depends(get_db)):
    run = (await db.execute(select(PromptRun).where(PromptRun.id == run_id))).scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    iters = (await db.execute(
        select(PromptIteration).where(PromptIteration.run_id == run_id).order_by(PromptIteration.iteration)
    )).scalars().all()
    return {
        "run_id": run.id, "original_prompt": run.original_prompt, "final_prompt": run.final_prompt,
        "final_score": run.final_score, "total_cost": run.total_cost, "total_tokens": run.total_tokens,
        "created_at": run.created_at.isoformat() if run.created_at else None,
        "iterations_detail": [
            {"iteration": i.iteration, "prompt": i.prompt, "critique": i.critique, "score": i.score}
            for i in iters
        ],
    }
