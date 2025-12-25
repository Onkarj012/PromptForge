from langchain_core.tools import tool
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4
from app.db.models import PromptMemory, PromptIteration


@tool
async def search_existing_prompt(
    title: str,
    db: AsyncSession
) -> str:
    """
    Search for an existing prompt by title similarity.
    """
    result = await db.execute(
        select(PromptMemory)
        .where(PromptMemory.title.ilike(f"%{title[:40]}%"))
        .limit(1)
    )

    prompt = result.scalar_one_or_none()

    if not prompt:
        return "NO_PROMPT_EXIST"

    return prompt.id


@tool
async def persist_prompt(
    prompt_id: str | None,
    title: str,
    state: dict,
    db: AsyncSession
) -> str:
    """
    Create or update the latest prompt snapshot.
    """
    if prompt_id:
        result = await db.execute(
            select(PromptMemory).where(PromptMemory.id == prompt_id)
        )
        prompt = result.scalar_one()
        prompt.current_version += 1
        prompt.state = state
    else:
        prompt = PromptMemory(
            id=str(uuid4()),
            title=title,
            current_version=1,
            state=state,
        )
        db.add(prompt)

    await db.commit()
    return "PERSISTED"

@tool
async def persist_iteration(
    run_id: str,
    iteration: int,
    prompt: str,
    critique: dict | None,
    db: AsyncSession
) -> str:
    """
    Persist a single iteration of prompt refinement.
    """
    iter_record = PromptIteration(
        id=str(uuid4()),
        run_id=run_id,
        iteration=iteration,
        prompt=prompt,
        critique=critique
    )
    db.add(iter_record)
    await db.commit()
    return "PERSISTED"
