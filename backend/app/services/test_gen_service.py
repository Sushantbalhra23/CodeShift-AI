import json
import re
from typing import Optional

from app.core.logging import logger
from app.core.security import validate_language_pair
from app.llm.base import LLMMessage
from app.llm.factory import get_llm_client
from app.prompt_engine.registry import get_prompt_registry
from app.schemas.evaluation import (
    TestCase,
    TestGenerationRequest,
    TestGenerationResponse,
)


class TestGenerationService:
    def __init__(self):
        self.registry = get_prompt_registry()

    async def generate_tests(
        self,
        request: TestGenerationRequest,
        provider: Optional[str] = None
    ) -> TestGenerationResponse:
        validate_language_pair(request.source_language, request.target_language)

        template = self.registry.get_template(task="test_generation", strategy="test_synthesis")

        system_text = template.render_system()
        user_text = template.render_user(
            source_language=request.source_language.capitalize(),
            target_language=request.target_language.capitalize(),
            source_code=request.source_code,
            translated_code=request.translated_code,
            num_tests=request.num_tests,
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

        return self._parse_test_response(llm_resp.content, request.target_language)

    def _parse_test_response(self, raw_content: str, target_lang: str) -> TestGenerationResponse:
        clean = re.sub(r"^```(?:json)?\s*", "", raw_content.strip(), flags=re.IGNORECASE)
        clean = re.sub(r"\s*```$", "", clean)

        default_framework = "pytest" if target_lang.lower() == "python" else "junit5"

        try:
            data = json.loads(clean)
            test_cases = [
                TestCase(
                    name=tc.get("name", f"test_case_{i+1}"),
                    description=tc.get("description"),
                    input_values=tc.get("input_values", {}),
                    expected_output=tc.get("expected_output"),
                )
                for i, tc in enumerate(data.get("test_cases", []))
            ]

            return TestGenerationResponse(
                target_language=data.get("target_language", target_lang),
                test_framework=data.get("test_framework", default_framework),
                test_code=data.get("test_code", ""),
                test_cases=test_cases,
                explanation=data.get("explanation"),
            )
        except Exception as e:
            logger.error(f"Failed to parse test generation response as JSON: {e}")
            return TestGenerationResponse(
                target_language=target_lang,
                test_framework=default_framework,
                test_code=raw_content,
                test_cases=[],
                explanation=f"Generated raw test code. JSON parse error: {e}",
            )
