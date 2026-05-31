from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from uuid import uuid4
from app.db.models import PromptRun, PromptIteration, PromptMemory
from app.agents.graph import build_prompt_graph


class RefineRequest(BaseModel):
    prompt: str = Field(min_length=10, max_length=20000)
    mode: str = "user_defined"
    creator_model: str
    critic_model: str
    iterations: int = Field(ge=1, le=10)
    target_tool: str = "generic"
    project_type: str | None = None
    stack: str | None = None


router = APIRouter(tags=["agents"])


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


@router.post("/prompt/refine")
async def refine_prompt(request: RefineRequest, db: AsyncSession = Depends(get_db)):
    run_id = str(uuid4())

    run = PromptRun(
        id=run_id,
        mode=request.mode,
        creator_model=request.creator_model,
        critic_model=request.critic_model,
        max_iterations=request.iterations,
        original_prompt=request.prompt,
    )
    db.add(run)
    await db.commit()

    graph = build_prompt_graph()
    initial_state = {
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
        "history": [],
        "metadata": {"run_id": run_id},
        "usage": {"input_tokens": 0, "output_tokens": 0, "cost": 0.0},
        "iter_usage": {"input_tokens": 0, "output_tokens": 0, "cost": 0.0},
    }

    final_state = await graph.ainvoke(initial_state)

    history = final_state.get("history", [])
    usage = final_state.get("usage", {})
    total_cost = round(usage.get("cost", 0.0), 6)
    total_tokens = usage.get("input_tokens", 0) + usage.get("output_tokens", 0)
    final_prompt = final_state["current_prompt"]
    final_score = final_state.get("final_score")

    # Persist iterations + run summary + latest snapshot
    for h in history:
        db.add(PromptIteration(
            id=str(uuid4()),
            run_id=run_id,
            iteration=h["iteration"],
            prompt=h["prompt"],
            critique=h.get("critique"),
            score=h.get("score"),
        ))
    run.final_prompt = final_prompt
    run.final_score = final_score
    run.total_cost = total_cost
    run.total_tokens = total_tokens
    db.add(PromptMemory(
        id=str(uuid4()),
        title=request.prompt[:60],
        current_version=1,
        state={"final_prompt": final_prompt, "final_score": final_score, "history": history},
    ))
    await db.commit()

    return {
        "run_id": run_id,
        "final_prompt": final_prompt,
        "final_score": final_score,
        "iterations": final_state["iteration"],
        "iterations_detail": history,
        "total_cost": total_cost,
        "total_tokens": total_tokens,
    }


@router.get("/prompt/runs")
async def list_runs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PromptRun).order_by(PromptRun.created_at.desc()).limit(50)
    )
    runs = result.scalars().all()
    return [
        {
            "run_id": r.id,
            "mode": r.mode,
            "creator_model": r.creator_model,
            "critic_model": r.critic_model,
            "original_prompt": r.original_prompt,
            "final_score": r.final_score,
            "total_cost": r.total_cost,
            "total_tokens": r.total_tokens,
            "max_iterations": r.max_iterations,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in runs
    ]


@router.get("/prompt/runs/{run_id}")
async def get_run(run_id: str, db: AsyncSession = Depends(get_db)):
    run = (await db.execute(select(PromptRun).where(PromptRun.id == run_id))).scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    iters = (await db.execute(
        select(PromptIteration)
        .where(PromptIteration.run_id == run_id)
        .order_by(PromptIteration.iteration)
    )).scalars().all()
    return {
        "run_id": run.id,
        "original_prompt": run.original_prompt,
        "final_prompt": run.final_prompt,
        "final_score": run.final_score,
        "total_cost": run.total_cost,
        "total_tokens": run.total_tokens,
        "created_at": run.created_at.isoformat() if run.created_at else None,
        "iterations_detail": [
            {"iteration": i.iteration, "prompt": i.prompt, "critique": i.critique, "score": i.score}
            for i in iters
        ],
    }
