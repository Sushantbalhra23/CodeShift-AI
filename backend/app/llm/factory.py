from typing import Optional
from app.config import get_settings
from app.core.logging import logger
from app.llm.base import BaseLLMClient
from app.llm.providers.gemini import GeminiLLMClient
from app.llm.providers.mock import MockLLMClient
from app.llm.providers.openai_compatible import OpenAICompatibleLLMClient


def get_llm_client(provider: Optional[str] = None) -> BaseLLMClient:
    settings = get_settings()
    chosen_provider = (provider or settings.DEFAULT_LLM_PROVIDER).lower()

    if chosen_provider == "gemini":
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not configured. Falling back to MockLLMClient for safe execution.")
            return MockLLMClient(model=settings.GEMINI_MODEL)
        return GeminiLLMClient(model=settings.GEMINI_MODEL, api_key=settings.GEMINI_API_KEY)

    elif chosen_provider == "openai":
        if not settings.OPENAI_API_KEY:
            logger.warning("OPENAI_API_KEY not configured. Falling back to MockLLMClient for safe execution.")
            return MockLLMClient(model=settings.OPENAI_MODEL)
        return OpenAICompatibleLLMClient(model=settings.OPENAI_MODEL, api_key=settings.OPENAI_API_KEY)

    elif chosen_provider == "mock":
        return MockLLMClient(model="mock-compiler-v1")

    else:
        logger.warning(f"Unknown provider '{chosen_provider}'. Defaulting to MockLLMClient.")
        return MockLLMClient()
