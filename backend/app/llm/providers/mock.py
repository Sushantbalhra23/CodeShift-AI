import json
import re
import time
from typing import List, Optional
from app.core.exceptions import LLMProviderError
from app.llm.base import BaseLLMClient, LLMMessage, LLMResponse, LLMUsage


class MockLLMClient(BaseLLMClient):
    """Deterministic Mock LLM provider for unit tests, offline development, and verification."""

    def __init__(self, model: str = "mock-compiler-v1", api_key: Optional[str] = None):
        super().__init__(model=model, api_key=api_key or "mock-key")

    async def generate(
        self,
        messages: List[LLMMessage],
        temperature: float = 0.2,
        max_tokens: int = 4096,
        top_p: float = 0.95,
        response_format: Optional[str] = None,
    ) -> LLMResponse:
        start_time = time.perf_counter()

        user_content = next((m.content for m in messages if m.role == "user"), "")
        system_content = next((m.content for m in messages if m.role == "system"), "")
        combined = f"{system_content}\n{user_content}".lower()

        # Simulated provider failure trigger for unit tests
        if "simulate_llm_provider_error" in combined or "simulate_provider_failure" in combined:
            raise LLMProviderError(
                "Upstream LLM Provider API rate limit or service unavailable (Simulated 503 error)",
                details={"status_code": 503, "error_type": "rate_limit_exceeded"}
            )

        # Route mock response based on task cues
        if "test_generation" in combined or ("generate" in combined and "unit test" in combined):
            content = self._mock_test_generation(user_content)
        elif "repair" in combined or "diagnostic error" in combined or "diagnostic feedback" in combined:
            content = self._mock_repair(user_content)
        elif (
            "chain_of_thought" in combined
            or "chain-of-thought" in combined
            or "step_1_analysis" in combined
        ):
            content = self._mock_cot_translation(user_content)
        elif "paradigm difference" in combined or "gotchas_and_caveats" in combined:
            content = self._mock_explanation(user_content)
        else:
            content = self._mock_structured_translation(user_content)

        latency_ms = (time.perf_counter() - start_time) * 1000 + 15.0
        tokens_in = len(user_content.split())
        tokens_out = len(content.split())

        return LLMResponse(
            content=content,
            model=self.model,
            provider="mock",
            latency_ms=round(latency_ms, 2),
            usage=LLMUsage(
                prompt_tokens=tokens_in,
                completion_tokens=tokens_out,
                total_tokens=tokens_in + tokens_out,
            ),
            raw_response={"mock": True},
        )

    def _mock_structured_translation(self, prompt: str) -> str:
        """Returns structured JSON matching user's requested response schema."""
        is_to_python = (
            "target language: python" in prompt.lower()
            or ("python" in prompt.lower() and "java" in prompt.lower() and "public" in prompt.lower())
        )

        if is_to_python:
            code = (
                "from typing import List, Optional\n\n"
                "class Solution:\n"
                "    @staticmethod\n"
                "    def process_data(items: Optional[List[int]]) -> List[int]:\n"
                "        \"\"\"Translates Java stream filter-map logic into Python list comprehension.\"\"\"\n"
                "        if items is None:\n"
                "            return []\n"
                "        return [x * 2 for x in items if x is not None and x > 0]\n"
            )
            explanation = (
                "Translated Java class and static method into Python with PEP 484 type hints. "
                "Replaced iterative accumulator with idiomatic list comprehension and added null guard."
            )
            assumptions = [
                "Assumed input items collection can be None and guarded accordingly.",
                "Assumed standard 64-bit integer values fit natively into Python arbitrary precision int."
            ]
            warnings = [
                "Python integer arithmetic does not overflow at 32-bit boundary unlike Java int.",
                "Concurrency: CPython operates under Global Interpreter Lock (GIL)."
            ]
        else:
            code = (
                "import java.util.ArrayList;\n"
                "import java.util.List;\n\n"
                "public class Solution {\n"
                "    public static List<Integer> processData(List<Integer> items) {\n"
                "        List<Integer> result = new ArrayList<>();\n"
                "        if (items == null) return result;\n"
                "        for (Integer x : items) {\n"
                "            if (x != null && x > 0) {\n"
                "                result.add(x * 2);\n"
                "            }\n"
                "        }\n"
                "        return result;\n"
                "    }\n"
                "}\n"
            )
            explanation = (
                "Translated Python function into a Java public class with static method. "
                "Used generic ArrayList<Integer> with null check safeguards."
            )
            assumptions = [
                "Assumed method belongs in public class Solution.",
                "Assumed list elements are non-primitive boxed Integer values."
            ]
            warnings = [
                "Java int primitives overflow at Integer.MAX_VALUE (2,147,483,647).",
                "Null references will throw NullPointerException if unboxed directly."
            ]

        payload = {
            "translated_code": code,
            "explanation": explanation,
            "assumptions": assumptions,
            "warnings": warnings,
        }
        return json.dumps(payload)

    def _mock_cot_translation(self, prompt: str) -> str:
        res = json.loads(self._mock_structured_translation(prompt))
        res["step_1_analysis"] = "Analyzed input filtering and transformation operations. No state mutation outside local scope."
        res["step_2_type_mapping"] = "Mapped primitive lists to generic collection types with null check guards."
        res["step_3_library_translation"] = "Replaced iterative accumulator with idiomatic comprehension/collection loop."
        return json.dumps(res)

    def _mock_explanation(self, prompt: str) -> str:
        payload = {
            "summary": "Translation between Java and Python involves transitioning between statically-typed compiled paradigms and dynamically-typed interpreted paradigms.",
            "differences": [
                {
                    "category": "Type System",
                    "source_concept": "Static typing with nominal class hierarchy",
                    "target_concept": "Dynamic typing with optional type annotations and duck typing",
                    "explanation": "Java enforces strict compile-time types, while Python resolves method invocations dynamically at runtime.",
                    "code_snippet_source": "List<Integer> items = new ArrayList<>();",
                    "code_snippet_target": "items: List[int] = []"
                },
                {
                    "category": "Idioms",
                    "source_concept": "Explicit loops and Stream API collectors",
                    "target_concept": "List comprehensions and generator expressions",
                    "explanation": "Python prefers concise list comprehensions over builder/collector pipelines.",
                    "code_snippet_source": "items.stream().filter(x -> x > 0).collect(Collectors.toList());",
                    "code_snippet_target": "[x for x in items if x > 0]"
                }
            ],
            "gotchas_and_caveats": [
                "Python integers have arbitrary precision, avoiding 32-bit overflow present in Java int.",
                "Java null references throw NullPointerException; Python handles None objects explicitly.",
                "Default mutability in Python arguments differs from Java parameter passing."
            ],
            "runtime_differences": [
                "JVM executes JIT-compiled bytecode with concurrent garbage collection.",
                "CPython relies on reference counting with a cyclic GC and Global Interpreter Lock (GIL)."
            ]
        }
        return json.dumps(payload)

    def _mock_test_generation(self, prompt: str) -> str:
        is_to_python = "target language: python" in prompt.lower()
        if is_to_python:
            test_code = (
                "import pytest\n"
                "from solution import Solution\n\n"
                "def test_process_data_positive():\n"
                "    assert Solution.process_data([1, 2, 3]) == [2, 4, 6]\n\n"
                "def test_process_data_with_negatives():\n"
                "    assert Solution.process_data([-5, 0, 4]) == [8]\n\n"
                "def test_process_data_empty():\n"
                "    assert Solution.process_data([]) == []\n"
            )
            target_lang = "python"
            framework = "pytest"
        else:
            test_code = (
                "import org.junit.jupiter.api.Test;\n"
                "import static org.junit.jupiter.api.Assertions.*;\n"
                "import java.util.List;\n\n"
                "public class SolutionTest {\n"
                "    @Test\n"
                "    void testPositive() {\n"
                "        assertEquals(List.of(2, 4, 6), Solution.processData(List.of(1, 2, 3)));\n"
                "    }\n"
                "}\n"
            )
            target_lang = "java"
            framework = "junit5"

        payload = {
            "target_language": target_lang,
            "test_framework": framework,
            "test_code": test_code,
            "test_cases": [
                {
                    "name": "test_process_data_positive",
                    "description": "Verifies multiplication on positive numbers",
                    "input_values": {"items": [1, 2, 3]},
                    "expected_output": [2, 4, 6]
                },
                {
                    "name": "test_process_data_with_negatives",
                    "description": "Ensures negative and zero numbers are filtered out",
                    "input_values": {"items": [-5, 0, 4]},
                    "expected_output": [8]
                },
                {
                    "name": "test_process_data_empty",
                    "description": "Validates boundary edge case with empty list",
                    "input_values": {"items": []},
                    "expected_output": []
                }
            ],
            "explanation": "Covers standard cases, negative filter boundaries, and empty collection handling."
        }
        return json.dumps(payload)

    def _mock_repair(self, prompt: str) -> str:
        payload = {
            "iteration": 1,
            "repaired_code": (
                "from typing import List\n\n"
                "class Solution:\n"
                "    @staticmethod\n"
                "    def process_data(items: List[int]) -> List[int]:\n"
                "        if not items:\n"
                "            return []\n"
                "        return [x * 2 for x in items if x > 0]\n"
            ),
            "explanation_of_fix": "Resolved syntax error and missing null check guard identified in diagnostic feedback.",
            "converged": True
        }
        return json.dumps(payload)
