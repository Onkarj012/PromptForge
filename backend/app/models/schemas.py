from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime


class PromptRequest(BaseModel):
    """User's initial prompt request."""
    user_input: str = Field(..., min_length=10, max_length=2000)
    domain: Optional[str] = Field(None, description="e.g., pixel_art, code, story")
    mode: Literal["auto", "manual"] = "manual"
    creator_model: Optional[str] = Field(None, description="claude-3-5-sonnet-20241022 or gpt-4o-mini")
    critic_model: Optional[str] = Field(None, description="claude-3-5-sonnet-20241022 or gpt-4o-mini")
    max_iterations: int = Field(3, ge=1, le=5)


class CriticFeedback(BaseModel):
    """Structured critic feedback."""
    score: float = Field(..., ge=0, le=10)
    strengths: list[str]
    issues: list[str]
    suggestions: list[str]


class RefinementIteration(BaseModel):
    """Single iteration of the refinement loop."""
    iteration: int
    prompt: str
    critic_feedback: CriticFeedback
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class RefinementResponse(BaseModel):
    """Complete refinement response."""
    original_input: str
    final_prompt: str
    iterations: list[RefinementIteration]
    total_iterations: int
    final_score: float
    creator_model_used: str
    critic_model_used: str
    total_cost: float
    metadata: dict


class PromptLibraryItem(BaseModel):
    """Stored prompt in library."""
    id: str
    prompt: str
    domain: Optional[str]
    score: float
    creator_model: str
    critic_model: str
    created_at: datetime
    tags: list[str] = []