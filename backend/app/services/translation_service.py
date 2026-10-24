import json
import re
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.core.security import validate_code_payload, validate_language_pair
from app.db.models import EvaluationRecord, TranslationRecord
from app.llm.base import LLMMessage
from app.llm.factory import get_llm_client
from app.prompt_engine.registry import get_prompt_registry
from app.sandbox.static_analyzer import StaticAnalyzer
from app.schemas.translation import (
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
        # 1. Validation
        validate_language_pair(request.source_language, request.target_language)
        code = validate_code_payload(request.source_code)

        # 2. Retrieve versioned prompt template
        template = self.registry.get_template(
            task="translation",
            strategy=request.strategy,
            version=request.prompt_version,
        )

        # 3. Render prompt
        system_text = template.render_system()
        user_text = template.render_user(
            source_language=request.source_language.capitalize(),
            target_language=request.target_language.capitalize(),
            source_code=code,
        )

        messages = [
            LLMMessage(role="system", content=system_text),
            LLMMessage(role="user", content=user_text),
        ]

        # 4. Dispatch to LLM
        client = get_llm_client(provider)
        temp = request.temperature if request.temperature is not None else template.parameters.temperature

        response_format = "json" if request.strategy == "chain_of_thought" else None
        llm_resp = await client.generate(
            messages=messages,
            temperature=temp,
            max_tokens=template.parameters.max_tokens,
            top_p=template.parameters.top_p or 0.95,
            response_format=response_format,
        )

        # 5. Extract translated code and explanation
        translated_code, explanation = self._parse_llm_output(llm_resp.content, request.strategy, request.target_language)

        # 6. Safe static AST validation
        ast_result = StaticAnalyzer.validate_code(translated_code, request.target_language)

        metadata = TranslationMetadata(
            strategy=request.strategy,
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

        # 7. Persist to DB if session provided
        record_id = None
        if self.db:
            try:
                db_record = TranslationRecord(
                    experiment_id=experiment_id,
                    source_language=request.source_language,
                    target_language=request.target_language,
                    source_code=code,
                    translated_code=translated_code,
                    strategy=request.strategy,
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
                logger.error(f"Failed to record translation in database: {e}")
                await self.db.rollback()

        return TranslationResponse(
            id=record_id,
            source_language=request.source_language,
            target_language=request.target_language,
            source_code=code,
            translated_code=translated_code,
            explanation=explanation,
            metadata=metadata,
        )

    def _parse_llm_output(
        self,
        raw_content: str,
        strategy: str,
        target_language: str
    ) -> tuple[str, Optional[str]]:
        content = raw_content.strip()

        # Chain of thought JSON parsing
        if strategy == "chain_of_thought":
            try:
                # Remove json markdown formatting if wrapped
                clean_json = re.sub(r"^```json\s*", "", content, flags=re.IGNORECASE)
                clean_json = re.sub(r"\s*```$", "", clean_json)
                data = json.loads(clean_json)
                code = data.get("translated_code", "").strip()
                explanation = data.get("explanation")
                if not explanation and "step_1_analysis" in data:
                    explanation = f"Step 1: {data.get('step_1_analysis')}\nStep 2: {data.get('step_2_type_mapping')}\nStep 3: {data.get('step_3_library_translation')}"
                if code:
                    return self._clean_code_block(code), explanation
            except Exception as e:
                logger.warning(f"Could not parse CoT response as JSON: {e}")

        # Extract markdown fenced code block
        pattern = rf"```(?:{target_language})?\s*\n(.*?)\n```"
        match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
        if match:
            code = match.group(1).strip()
            # Everything outside the code block can be treated as explanation
            explanation = re.sub(pattern, "", content, flags=re.DOTALL | re.IGNORECASE).strip() or None
            return code, explanation

        # Fallback: if no markdown fences, check for general ``` block
        fallback_pattern = r"```\s*\n(.*?)\n```"
        match_fallback = re.search(fallback_pattern, content, re.DOTALL)
        if match_fallback:
            code = match_fallback.group(1).strip()
            explanation = re.sub(fallback_pattern, "", content, flags=re.DOTALL).strip() or None
            return code, explanation

        # Pure code without fences
        return content, None

    @staticmethod
    def _clean_code_block(code: str) -> str:
        pattern = r"^```[a-zA-Z]*\n?(.*?)\n?```$"
        match = re.match(pattern, code.strip(), re.DOTALL)
        if match:
            return match.group(1).strip()
        return code.strip()
