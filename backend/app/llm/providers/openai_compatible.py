import time
from typing import Any, Dict, List, Optional
import httpx

from app.core.exceptions import LLMProviderError
from app.llm.base import BaseLLMClient, LLMMessage, LLMResponse, LLMUsage


class OpenAICompatibleLLMClient(BaseLLMClient):
    """Client for OpenAI or OpenAI-compatible Chat Completions API."""

    def __init__(
        self,
        model: str = "gpt-4o",
        api_key: Optional[str] = None,
        base_url: str = "https://api.openai.com/v1",
    ):
        super().__init__(model=model, api_key=api_key)
        self.base_url = base_url.rstrip("/")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY must be provided for OpenAI provider.")

    async def generate(
        self,
        messages: List[LLMMessage],
        temperature: float = 0.2,
        max_tokens: int = 4096,
        top_p: float = 0.95,
        response_format: Optional[str] = None,
    ) -> LLMResponse:
        start_time = time.perf_counter()

        endpoint = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        body: Dict[str, Any] = {
            "model": self.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "top_p": top_p,
        }

        if response_format == "json":
            body["response_format"] = {"type": "json_object"}

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(endpoint, json=body, headers=headers)
                if resp.status_code != 200:
                    raise LLMProviderError(
                        f"OpenAI API returned HTTP {resp.status_code}: {resp.text}",
                        details={"status_code": resp.status_code, "body": resp.text},
                    )
                data = resp.json()

            latency_ms = (time.perf_counter() - start_time) * 1000

            choices = data.get("choices", [])
            if not choices:
                raise LLMProviderError("OpenAI API returned no completion choices.", details=data)

            content_text = choices[0].get("message", {}).get("content", "")
            usage_data = data.get("usage", {})

            return LLMResponse(
                content=content_text,
                model=self.model,
                provider="openai",
                latency_ms=round(latency_ms, 2),
                usage=LLMUsage(
                    prompt_tokens=usage_data.get("prompt_tokens", 0),
                    completion_tokens=usage_data.get("completion_tokens", 0),
                    total_tokens=usage_data.get("total_tokens", 0),
                ),
                raw_response=data,
            )
        except httpx.RequestError as e:
            raise LLMProviderError(f"Network error communicating with OpenAI API: {e}")
