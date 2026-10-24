import json
import re
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.core.security import validate_language_pair
from app.db.models import RepairRecord
from app.llm.base import LLMMessage
from app.llm.factory import get_llm_client
from app.prompt_engine.registry import get_prompt_registry
from app.sandbox.static_analyzer import StaticAnalyzer
from app.schemas.evaluation import RepairRequest, RepairResponse


class RepairService:
    def __init__(self, db: Optional[AsyncSession] = None):
        self.db = db
        self.registry = get_prompt_registry()

    async def repair(
        self,
        request: RepairRequest,
        provider: Optional[str] = None,
        translation_id: Optional[int] = None,
    ) -> RepairResponse:
        validate_language_pair(request.source_language, request.target_language)

        template = self.registry.get_template(task="repair", strategy="iterative_repair")

        system_text = template.render_system()
        user_text = template.render_user(
            iteration=request.iteration,
            source_language=request.source_language.capitalize(),
            target_language=request.target_language.capitalize(),
            source_code=request.source_code,
            current_code=request.current_code,
            error_feedback=request.error_feedback,
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

        repair_data = self._parse_repair_json(llm_resp.content, request.iteration)

        # Validate repaired code AST
        ast_result = StaticAnalyzer.validate_code(repair_data["repaired_code"], request.target_language)
        converged = repair_data.get("converged", False) and ast_result.is_valid

        # Persist repair iteration in DB if translation_id and session provided
        if self.db and translation_id:
            try:
                db_repair = RepairRecord(
                    translation_id=translation_id,
                    iteration_number=request.iteration,
                    input_code=request.current_code,
                    error_feedback=request.error_feedback,
                    repaired_code=repair_data["repaired_code"],
                    converged=converged,
                )
                self.db.add(db_repair)
                await self.db.commit()
            except Exception as e:
                logger.error(f"Error persisting repair iteration: {e}")
                await self.db.rollback()

        return RepairResponse(
            iteration=request.iteration,
            repaired_code=repair_data["repaired_code"],
            explanation_of_fix=repair_data["explanation_of_fix"],
            is_ast_valid=ast_result.is_valid,
            ast_error=ast_result.error_message,
            converged=converged,
        )

    def _parse_repair_json(self, raw_content: str, iteration: int) -> dict:
        clean = re.sub(r"^```(?:json)?\s*", "", raw_content.strip(), flags=re.IGNORECASE)
        clean = re.sub(r"\s*```$", "", clean)

        try:
            data = json.loads(clean)
            repaired = data.get("repaired_code", "").strip()
            # If code is still wrapped in markdown fences, clean it
            repaired = re.sub(r"^```[a-zA-Z]*\n?", "", repaired)
            repaired = re.sub(r"\n?```$", "", repaired).strip()

            return {
                "iteration": data.get("iteration", iteration),
                "repaired_code": repaired,
                "explanation_of_fix": data.get("explanation_of_fix", "Applied correction based on error diagnostics."),
                "converged": bool(data.get("converged", True)),
            }
        except Exception as e:
            logger.warning(f"Failed to parse repair response as JSON: {e}")
            # Fallback extraction
            return {
                "iteration": iteration,
                "repaired_code": raw_content,
                "explanation_of_fix": f"Raw repair generated. Parse notice: {e}",
                "converged": False,
            }
