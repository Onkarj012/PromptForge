from langchain_openai import ChatOpenAI
from app.config import settings


def get_openrouter_llm(model: str):
    return ChatOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.OPENROUTER_API_KEY,
        model=model,
        temperature=0.7,
        default_headers={
            "HTTP-Referer": "http://localhost",
            "X-Title": "PromptForge",
        },
    )
