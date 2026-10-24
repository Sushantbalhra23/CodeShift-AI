import time
from typing import Any, Dict, List, Optional
import httpx

from app.core.exceptions import LLMProviderError
from app.llm.base import BaseLLMClient, LLMMessage, LLMResponse, LLMUsage


class GeminiLLMClient(BaseLLMClient):
    """Client for Google Gemini API."""

    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

    def __init__(self, model: str = "gemini-2.5-flash", api_key: Optional[str] = None):
        super().__init__(model=model, api_key=api_key)
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY must be provided for Gemini provider.")

    async def generate(
        self,
        messages: List[LLMMessage],
        temperature: float = 0.2,
        max_tokens: int = 4096,
        top_p: float = 0.95,
        response_format: Optional[str] = None,
    ) -> LLMResponse:
        start_time = time.perf_counter()

        system_instruction = None
        contents = []

        for msg in messages:
            if msg.role == "system":
                system_instruction = {"parts": [{"text": msg.content}]}
            elif msg.role == "user":
                contents.append({"role": "user", "parts": [{"text": msg.content}]})
            elif msg.role == "assistant":
                contents.append({"role": "model", "parts": [{"text": msg.content}]})

        body: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
                "topP": top_p,
            },
        }

        if system_instruction:
            body["systemInstruction"] = system_instruction

        if response_format == "json":
            body["generationConfig"]["responseMimeType"] = "application/json"

        endpoint = f"{self.BASE_URL}/{self.model}:generateContent?key={self.api_key}"

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(endpoint, json=body)
                if resp.status_code != 200:
                    raise LLMProviderError(
                        f"Gemini API returned HTTP {resp.status_code}: {resp.text}",
                        details={"status_code": resp.status_code, "body": resp.text},
                    )
                data = resp.json()

            latency_ms = (time.perf_counter() - start_time) * 1000

            candidates = data.get("candidates", [])
            if not candidates:
                raise LLMProviderError("Gemini API returned no candidates.", details=data)

            content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")

            # Usage metadata if provided
            usage_meta = data.get("usageMetadata", {})
            prompt_tokens = usage_meta.get("promptTokenCount", 0)
            completion_tokens = usage_meta.get("candidatesTokenCount", 0)
            total_tokens = usage_meta.get("totalTokenCount", 0)

            return LLMResponse(
                content=content_text,
                model=self.model,
                provider="gemini",
                latency_ms=round(latency_ms, 2),
                usage=LLMUsage(
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    total_tokens=total_tokens,
                ),
                raw_response=data,
            )
        except httpx.RequestError as e:
            raise LLMProviderError(f"Network error communicating with Gemini API: {e}")
