from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from uuid import uuid4
from app.db.models import PromptRun
from app.agents.graph import build_prompt_graph


class RefineRequest(BaseModel):
    prompt: str
    mode: str
    creator_model: str
    critic_model: str
    iterations: int


router = APIRouter(tags=["agents"])

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


@router.post("/prompt/refine")
async def refine_prompt(
    request: RefineRequest,
    db: AsyncSession = Depends(get_db),
):
    run_id = str(uuid4())

    # 1. Create run record
    run = PromptRun(
        id=run_id,
        mode=request.mode,
        creator_model=request.creator_model,
        critic_model=request.critic_model,
        max_iterations=request.iterations,
    )
    db.add(run)
    await db.commit()

    # 2. Build graph ONCE
    graph = build_prompt_graph()

    # 3. Initial state (ALL keys must exist)
    initial_state = {
        "original_prompt": request.prompt,
        "current_prompt": request.prompt,
        "critique": None,
        "iteration": 0,
        "max_iterations": request.iterations,
        "creator_model": request.creator_model,
        "critic_model": request.critic_model,
        "history": [],
        "metadata": {
            "run_id": run_id,   # 👈 important for persistence nodes
        },
    }

    # 4. Run graph ONCE (LangGraph handles looping)
    final_state = await graph.ainvoke(initial_state)

    return {
        "run_id": run_id,
        "final_prompt": final_state["current_prompt"],
        "iterations": final_state["iteration"],
    }
