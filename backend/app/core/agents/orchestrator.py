from app.core.agents.creator import creator_agent
from app.core.agents.critic import critic_agent
from app.models.schemas import (
    PromptRequest,
    RefinementResponse,
    RefinementIteration,
    CriticFeedback
)
from datetime import datetime


class OrchestratorAgent:
    """Manages the refinement loop between Creator and Critic."""
    
    QUALITY_THRESHOLD = 9.0
    
    # OpenRouter pricing (per 1M tokens, approximate)
    COST_PER_1M_TOKENS = {
        "openai/gpt-4o-mini": 0.15,
        "openai/gpt-4o": 2.50,
        "anthropic/claude-3.5-sonnet": 3.00,
        "anthropic/claude-3-haiku": 0.25,
        "google/gemini-2.0-flash-exp:free": 0.00,  # Free tier
        "google/gemini-pro-1.5": 1.25,
    }
    
    async def refine_prompt(self, request: PromptRequest) -> RefinementResponse:
        """Execute the iterative refinement loop."""
        
        # Set default models if not specified (OpenRouter format)
        creator_model = request.creator_model or "anthropic/claude-3.5-sonnet"
        critic_model = request.critic_model or "openai/gpt-4o-mini"
        
        iterations = []
        current_prompt = None
        critic_feedback = None
        
        for i in range(request.max_iterations):
            # Creator generates/improves prompt
            current_prompt = await creator_agent.create_prompt(
                model=creator_model,
                user_input=request.user_input,
                domain=request.domain,
                previous_attempt=current_prompt if i > 0 else None,
                critic_feedback=self._format_feedback(critic_feedback) if critic_feedback else None
            )
            
            # Critic evaluates prompt
            critic_feedback = await critic_agent.critique_prompt(
                model=critic_model,
                prompt_to_critique=current_prompt,
                domain=request.domain
            )
            
            # Record iteration
            iterations.append(
                RefinementIteration(
                    iteration=i + 1,
                    prompt=current_prompt,
                    critic_feedback=critic_feedback,
                    timestamp=datetime.utcnow()
                )
            )
            
            # Check if quality threshold met
            if critic_feedback.score >= self.QUALITY_THRESHOLD:
                break
        
        # Calculate approximate cost
        total_cost = self._estimate_cost(
            iterations=len(iterations),
            creator_model=creator_model,
            critic_model=critic_model
        )
        
        return RefinementResponse(
            original_input=request.user_input,
            final_prompt=current_prompt,
            iterations=iterations,
            total_iterations=len(iterations),
            final_score=critic_feedback.score,
            creator_model_used=creator_model,
            critic_model_used=critic_model,
            total_cost=total_cost,
            metadata={
                "domain": request.domain,
                "mode": request.mode
            }
        )
    
    def _format_feedback(self, feedback: CriticFeedback) -> str:
        """Format critic feedback for creator."""
        return f"""Score: {feedback.score}/10

Strengths:
{chr(10).join(f"- {s}" for s in feedback.strengths)}

Issues:
{chr(10).join(f"- {i}" for i in feedback.issues)}

Suggestions:
{chr(10).join(f"- {s}" for s in feedback.suggestions)}"""
    
    def _estimate_cost(
        self,
        iterations: int,
        creator_model: str,
        critic_model: str
    ) -> float:
        """Rough cost estimation (assumes ~500 tokens per call)."""
        tokens_per_iteration = 1000  # Conservative estimate
        total_tokens = tokens_per_iteration * iterations * 2  # Creator + Critic
        
        creator_cost = (total_tokens / 1_000_000) * self.COST_PER_1M_TOKENS.get(creator_model, 1.0)
        critic_cost = (total_tokens / 1_000_000) * self.COST_PER_1M_TOKENS.get(critic_model, 1.0)
        
        return round(creator_cost + critic_cost, 4)


orchestrator = OrchestratorAgent()