import json
import re
from typing import List, Optional, Tuple
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import LLMProviderError, PromptTemplateNotFoundError
from app.core.logging import logger
from app.db.models import EvaluationRecord, TranslationRecord
from app.llm.base import LLMMessage
from app.llm.factory import get_llm_client
from app.prompt_engine.registry import get_prompt_registry
from app.sandbox.static_analyzer import StaticAnalyzer
from app.schemas.translation import (
    LLMTranslationPayload,
    TranslationMetadata,
    TranslationRequest,
    TranslationResponse,
)


class TranslationService:
    def __init__(self, db: Optional[AsyncSession] = None):
        self.db = db
        self.registry = get_prompt_registry()

    async def translate(
        self,
        request: TranslationRequest,
        provider: Optional[str] = None,
        experiment_id: Optional[int] = None,
    ) -> TranslationResponse:
        # 1. Pydantic validator has already validated source_code, language pair, and size limits

        # 2. Strategy resolution (supports both 'baseline' and 'zero_shot', etc.)
        strategy = request.prompt_strategy or "baseline"
        try:
            template = self.registry.get_template(
                task="translation",
                strategy=strategy,
                version=request.prompt_version,
            )
        except PromptTemplateNotFoundError:
            # Fallback to zero_shot if baseline is not found or vice versa
            fallback = "zero_shot" if strategy == "baseline" else "baseline"
            template = self.registry.get_template(
                task="translation",
                strategy=fallback,
                version=request.prompt_version,
            )

        # 3. Render prompt
        system_text = template.render_system()
        user_text = template.render_user(
            source_language=request.source_language.capitalize(),
            target_language=request.target_language.capitalize(),
            source_code=request.source_code,
        )

        messages = [
            LLMMessage(role="system", content=system_text),
            LLMMessage(role="user", content=user_text),
        ]

        # 4. Dispatch to configured LLM client
        client = get_llm_client(provider)
        temp = request.temperature if request.temperature is not None else template.parameters.temperature

        llm_resp = await client.generate(
            messages=messages,
            temperature=temp,
            max_tokens=template.parameters.max_tokens,
            top_p=template.parameters.top_p or 0.95,
            response_format="json",
        )

        # 5. Parse and validate structured model output
        translated_code, explanation, assumptions, warnings = self._parse_structured_output(
            llm_resp.content, request.target_language
        )

        # 6. Static AST check
        ast_result = StaticAnalyzer.validate_code(translated_code, request.target_language)

        metadata = TranslationMetadata(
            strategy=strategy,
            prompt_version=template.version,
            model=llm_resp.model,
            provider=llm_resp.provider,
            latency_ms=llm_resp.latency_ms,
            prompt_tokens=llm_resp.usage.prompt_tokens,
            completion_tokens=llm_resp.usage.completion_tokens,
            total_tokens=llm_resp.usage.total_tokens,
            ast_valid=ast_result.is_valid,
            ast_error=ast_result.error_message,
        )

        # 7. Persist to SQLite DB if session available
        record_id = None
        if self.db:
            try:
                db_record = TranslationRecord(
                    experiment_id=experiment_id,
                    source_language=request.source_language,
                    target_language=request.target_language,
                    source_code=request.source_code,
                    translated_code=translated_code,
                    strategy=strategy,
                    prompt_version=template.version,
                    model_name=llm_resp.model,
                    provider=llm_resp.provider,
                    prompt_tokens=llm_resp.usage.prompt_tokens,
                    completion_tokens=llm_resp.usage.completion_tokens,
                    total_tokens=llm_resp.usage.total_tokens,
                    latency_ms=llm_resp.latency_ms,
                    ast_valid=ast_result.is_valid,
                    explanation=explanation,
                )
                self.db.add(db_record)
                await self.db.flush()

                eval_record = EvaluationRecord(
                    translation_id=db_record.id,
                    syntax_valid=ast_result.is_valid,
                    ast_nodes_count=ast_result.node_count,
                    lines_of_code=len(translated_code.splitlines()),
                    error_message=ast_result.error_message,
                )
                self.db.add(eval_record)
                await self.db.commit()
                await self.db.refresh(db_record)
                record_id = db_record.id
            except Exception as e:
                logger.error(f"Failed to persist translation record: {e}")
                await self.db.rollback()

        return TranslationResponse(
            translated_code=translated_code,
            explanation=explanation,
            assumptions=assumptions,
            warnings=warnings,
            metadata=metadata,
            id=record_id,
            source_language=request.source_language,
            target_language=request.target_language,
        )

    def _parse_structured_output(
        self,
        raw_content: str,
        target_language: str
    ) -> Tuple[str, str, List[str], List[str]]:
        content = (raw_content or "").strip()
        if not content:
            raise LLMProviderError(
                "LLM returned an empty translation payload.",
                details={"target_language": target_language},
            )

        parsed = self._try_parse_json_payload(content)
        if parsed:
            code = self._strip_code_fences(parsed.translated_code)
            if code:
                explanation = parsed.explanation.strip()
                return (
                    code,
                    explanation or "Code translation generated successfully.",
                    parsed.assumptions,
                    parsed.warnings,
                )

        pattern = rf"```(?:{re.escape(target_language)})?\s*\n(.*?)\n```"
        match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
        if match:
            code = match.group(1).strip()
            if code:
                explanation = re.sub(pattern, "", content, flags=re.DOTALL | re.IGNORECASE).strip()
                return (
                    code,
                    explanation or f"Translated to {target_language} using markdown fences.",
                    [],
                    ["Model produced unstructured markdown block instead of strict JSON schema."],
                )

        raise LLMProviderError(
            "LLM returned output that did not match the required translation schema.",
            details={"raw_preview": content[:500], "target_language": target_language},
        )

    def _try_parse_json_payload(self, content: str) -> Optional[LLMTranslationPayload]:
        try:
            clean_json = re.sub(r"^```(?:json)?\s*", "", content, flags=re.IGNORECASE)
            clean_json = re.sub(r"\s*```$", "", clean_json).strip()
            data = json.loads(clean_json)
            if not isinstance(data, dict):
                return None
            if not data.get("explanation") and data.get("step_1_analysis"):
                data["explanation"] = (
                    f"Step 1: {data.get('step_1_analysis')}\nStep 2: {data.get('step_2_type_mapping')}"
                )
            return LLMTranslationPayload.model_validate(data)
        except (json.JSONDecodeError, ValidationError, TypeError, ValueError) as e:
            logger.debug(f"Structured JSON parse fallback: {e}")
            return None

    @staticmethod
    def _strip_code_fences(code: str) -> str:
        cleaned = re.sub(r"^```[a-zA-Z]*\n?", "", code.strip())
        cleaned = re.sub(r"\n?```$", "", cleaned).strip()
        return cleaned
