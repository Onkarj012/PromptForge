from fastapi import APIRouter, HTTPException
from app.models.schemas import PromptRequest, RefinementResponse
from app.core.agents.orchestrator import orchestrator

router = APIRouter(prefix="/refine", tags=["refinement"])


@router.post("/", response_model=RefinementResponse)
async def refine_prompt(request: PromptRequest) -> RefinementResponse:
    """
    Refine a user prompt through iterative Creator-Critic loop.
    """
    try:
        return await orchestrator.refine_prompt(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))