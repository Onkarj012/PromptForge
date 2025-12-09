from openai import AsyncOpenAI
from app.core.config import settings
from typing import Optional
import json


class LLMService:
    """Service for interacting with LLM providers through OpenRouter."""
    
    def __init__(self):
        self.client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.openrouter_api_key,
            default_headers={
                "HTTP-Referer": settings.app_url,
                "X-Title": settings.app_name,
            }
        )
    
    async def call_model(
        self,
        model: str,
        system_prompt: str,
        user_prompt: str,
        response_format: Optional[dict] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096
    ) -> str:
        """
        Call any model through OpenRouter.
        
        Args:
            model: OpenRouter model identifier (e.g., "anthropic/claude-3.5-sonnet")
            system_prompt: System instructions for the model
            user_prompt: User's input/question
            response_format: Optional JSON schema for structured output
            temperature:
             Sampling temperature (0-2)
            max_tokens: Maximum tokens to generate
        
        Returns:
            Model's response as string
        """
        try:
            kwargs = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": temperature,
                "max_tokens": max_tokens,
            }
            
            # Add response format if specified (for models that support it)
            if response_format:
                kwargs["response_format"] = response_format
            
            response = await self.client.chat.completions.create(**kwargs)
            return response.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Error calling model {model}: {str(e)}")
    
    async def get_available_models(self) -> list[dict]:
        """
        Fetch available models from OpenRouter.
        Useful for dynamic model selection.
        """
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://openrouter.ai/api/v1/models",
                    headers={
                        "Authorization": f"Bearer {settings.openrouter_api_key}"
                    }
                )
                response.raise_for_status()
                return response.json()["data"]
        except Exception as e:
            raise Exception(f"Error fetching models: {str(e)}")


# Singleton instance
llm_service = LLMService()