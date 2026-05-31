from langchain_openai import ChatOpenAI
from app.config import settings


def get_openrouter_llm(model: str, temperature: float = 0.7, max_tokens: int | None = None):
    kwargs = {}
    if max_tokens:
        kwargs["max_tokens"] = max_tokens
    return ChatOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.OPENROUTER_API_KEY,
        model=model,
        temperature=temperature,
        default_headers={
            "HTTP-Referer": "http://localhost",
            "X-Title": "PromptForge",
        },
        **kwargs,
    )
