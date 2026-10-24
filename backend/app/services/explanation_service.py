import json
import re
from typing import Optional

from app.core.logging import logger
from app.core.security import validate_language_pair
from app.llm.base import LLMMessage
from app.llm.factory import get_llm_client
from app.prompt_engine.registry import get_prompt_registry
from app.schemas.explanation import (
    ExplanationRequest,
    ExplanationResponse,
    ParadigmDifference,
)


class ExplanationService:
    def __init__(self):
        self.registry = get_prompt_registry()

    async def explain(
        self,
        request: ExplanationRequest,
        provider: Optional[str] = None
    ) -> ExplanationResponse:
        validate_language_pair(request.source_language, request.target_language)

        template = self.registry.get_template(task="explanation", strategy="paradigm_diff")

        system_text = template.render_system()
        user_text = template.render_user(
            source_language=request.source_language.capitalize(),
            target_language=request.target_language.capitalize(),
            source_code=request.source_code,
            translated_code=request.translated_code,
        )

        messages = [
            LLMMessage(role="system", content=system_text),
            LLMMessage(role="user", content=user_text),
        ]

        client = get_llm_client(provider)
        llm_resp = await client.generate(
            messages=messages,
            temperature=template.parameters.temperature,
            max_tokens=template.parameters.max_tokens,
            response_format="json",
        )

        return self._parse_explanation_json(llm_resp.content)

    def _parse_explanation_json(self, raw_content: str) -> ExplanationResponse:
        content = raw_content.strip()
        clean = re.sub(r"^```(?:json)?\s*", "", content, flags=re.IGNORECASE)
        clean = re.sub(r"\s*```$", "", clean)

        try:
            data = json.loads(clean)
            diffs = [
                ParadigmDifference(
                    category=d.get("category", "General"),
                    source_concept=d.get("source_concept", ""),
                    target_concept=d.get("target_concept", ""),
                    explanation=d.get("explanation", ""),
                    code_snippet_source=d.get("code_snippet_source"),
                    code_snippet_target=d.get("code_snippet_target"),
                )
                for d in data.get("differences", [])
            ]
            return ExplanationResponse(
                summary=data.get("summary", "Analysis of code translation paradigm differences."),
                differences=diffs,
                gotchas_and_caveats=data.get("gotchas_and_caveats", []),
                runtime_differences=data.get("runtime_differences", []),
            )
        except Exception as e:
            logger.error(f"Error parsing explanation JSON: {e}. Raw content: {raw_content[:200]}")
            return ExplanationResponse(
                summary="Unable to parse structured explanation.",
                differences=[],
                gotchas_and_caveats=[f"Parsing error: {e}"],
                runtime_differences=[],
            )
