from typing import Optional
from app.services.llm_service import llm_service


class CreatorAgent:
    """Agent responsible for generating prompts."""
    
    SYSTEM_PROMPT = """You are an expert prompt engineer specializing in creating 
high-quality, detailed prompts for AI models. Your goal is to transform vague user 
ideas into clear, structured, actionable prompts.

When creating prompts, ensure they are:
- Specific and unambiguous
- Include all necessary constraints
- Structured for optimal AI comprehension
- Domain-appropriate (pixel art, code, writing, etc.)

If you receive critic feedback, incorporate all suggestions to improve the prompt."""
    
    async def create_prompt(
        self,
        model: str,
        user_input: str,
        domain: Optional[str] = None,
        previous_attempt: Optional[str] = None,
        critic_feedback: Optional[str] = None
    ) -> str:
        """Generate or refine a prompt."""
        
        user_message = f"User's goal: {user_input}"
        
        if domain:
            user_message += f"\nDomain: {domain}"
        
        if previous_attempt and critic_feedback:
            user_message += f"\n\nPrevious attempt:\n{previous_attempt}"
            user_message += f"\n\nCritic feedback:\n{critic_feedback}"
            user_message += "\n\nPlease improve the prompt based on this feedback."
        else:
            user_message += "\n\nCreate a detailed, professional prompt for this goal."
        
        return await llm_service.call_model(
            model=model,
            system_prompt=self.SYSTEM_PROMPT,
            user_prompt=user_message
        )


creator_agent = CreatorAgent()