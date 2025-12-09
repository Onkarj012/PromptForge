from typing import Optional
from app.services.llm_service import llm_service
from app.models.schemas import CriticFeedback
import json


class CriticAgent:
    """Agent responsible for evaluating prompts."""
    
    SYSTEM_PROMPT = """You are an expert prompt critic. Evaluate prompts based on:

1. **Clarity** (0-10): Is the prompt unambiguous?
2. **Completeness** (0-10): Are all necessary details included?
3. **Constraints** (0-10): Are limitations clearly specified?
4. **Structure** (0-10): Is it well-organized?

Provide:
- Overall score (0-10)
- List of strengths
- List of issues/weaknesses
- Specific suggestions for improvement

Return your response as JSON with this structure:
{
  "score": 8.5,
  "strengths": ["clear goal", "specific constraints"],
  "issues": ["missing context", "ambiguous term"],
  "suggestions": ["add X", "clarify Y"]
}"""
    
    async def critique_prompt(
        self,
        model: str,
        prompt_to_critique: str,
        domain: Optional[str] = None
    ) -> CriticFeedback:
        """Evaluate a prompt and provide structured feedback."""
        
        user_message = f"Evaluate this prompt:\n\n{prompt_to_critique}"
        
        if domain:
            user_message += f"\n\nDomain context: {domain}"
        
        response = await llm_service.call_model(
            model=model,
            system_prompt=self.SYSTEM_PROMPT,
            user_prompt=user_message
        )
        
        # Parse JSON response
        try:
            # Extract JSON from response (handles markdown code blocks)
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            else:
                json_str = response.strip()
            
            feedback_dict = json.loads(json_str)
            return CriticFeedback(**feedback_dict)
        except Exception as e:
            # Fallback if JSON parsing fails
            return CriticFeedback(
                score=7.0,
                strengths=["Generated prompt"],
                issues=[f"Could not parse critic response: {str(e)}"],
                suggestions=["Manual review recommended"]
            )


critic_agent = CriticAgent()