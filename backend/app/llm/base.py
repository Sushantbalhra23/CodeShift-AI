from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class LLMMessage(BaseModel):
    role: str  # system, user, assistant
    content: str


class LLMUsage(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class LLMResponse(BaseModel):
    content: str
    model: str
    provider: str
    latency_ms: float
    usage: LLMUsage = Field(default_factory=LLMUsage)
    raw_response: Optional[Dict[str, Any]] = None


class BaseLLMClient(ABC):
    def __init__(self, model: str, api_key: Optional[str] = None):
        self.model = model
        self.api_key = api_key

    @abstractmethod
    async def generate(
        self,
        messages: List[LLMMessage],
        temperature: float = 0.2,
        max_tokens: int = 4096,
        top_p: float = 0.95,
        response_format: Optional[str] = None,
    ) -> LLMResponse:
        """Generate a response from the LLM given a sequence of messages."""
        pass
