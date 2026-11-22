import pytest
from app.core.exceptions import LLMProviderError
from app.schemas.translation import MAX_SOURCE_CODE_LENGTH
from app.services.translation_service import TranslationService


VALID_JAVA = "public class Adder { public static int add(int a, int b) { return a + b; } }"


@pytest.mark.asyncio
async def test_translate_valid_baseline_input(client):
    payload = {
        "source_code": VALID_JAVA,
        "source_language": "java",
        "target_language": "python",
        "prompt_strategy": "baseline",
    }
    response = await client.post("/api/v1/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["translated_code"]
    assert data["explanation"]
    assert isinstance(data["assumptions"], list)
    assert isinstance(data["warnings"], list)
    assert data["metadata"]["strategy"] == "baseline"
    assert data["metadata"]["provider"] == "mock"
    assert data["metadata"]["latency_ms"] > 0


@pytest.mark.asyncio
async def test_translate_invalid_language(client):
    payload = {
        "source_code": VALID_JAVA,
        "source_language": "javascript",
        "target_language": "python",
        "prompt_strategy": "baseline",
    }
    response = await client.post("/api/v1/translate", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "validation_error"
    assert "javascript" in data["message"] or any(
        "javascript" in (item.get("message") or "") for item in data.get("details", [])
    )


@pytest.mark.asyncio
async def test_translate_empty_code(client):
    payload = {
        "source_code": "   \n\t  ",
        "source_language": "java",
        "target_language": "python",
        "prompt_strategy": "baseline",
    }
    response = await client.post("/api/v1/translate", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "validation_error"
    combined = data["message"] + " ".join(item.get("message", "") for item in data.get("details", []))
    assert "empty" in combined.lower()


@pytest.mark.asyncio
async def test_translate_provider_error(client, monkeypatch):
    async def boom(*args, **kwargs):
        raise LLMProviderError(
            "Upstream LLM Provider API rate limit or service unavailable",
            details={"status_code": 503, "error_type": "rate_limit_exceeded"},
        )

    monkeypatch.setattr("app.llm.providers.mock.MockLLMClient.generate", boom)
    payload = {
        "source_code": VALID_JAVA,
        "source_language": "java",
        "target_language": "python",
        "prompt_strategy": "baseline",
    }
    response = await client.post("/api/v1/translate", json=payload)
    assert response.status_code == 502
    data = response.json()
    assert data["error"] == "provider_error"
    assert "LLM" in data["message"] or "unavailable" in data["message"].lower()
    assert data.get("translated_code") is None


@pytest.mark.asyncio
async def test_translate_payload_too_large(client):
    payload = {
        "source_code": "x" * (MAX_SOURCE_CODE_LENGTH + 1),
        "source_language": "java",
        "target_language": "python",
        "prompt_strategy": "baseline",
    }
    response = await client.post("/api/v1/translate", json=payload)
    assert response.status_code == 422


def test_parse_structured_model_output():
    service = TranslationService()
    raw = """
    {
      "translated_code": "def add(a, b):\\n    return a + b\\n",
      "explanation": "Mapped Java static method to a Python function.",
      "assumptions": ["Integers fit in Python int"],
      "warnings": ["Python ints do not overflow"]
    }
    """
    code, explanation, assumptions, warnings = service._parse_structured_output(raw, "python")
    assert "def add" in code
    assert "Mapped Java" in explanation
    assert assumptions == ["Integers fit in Python int"]
    assert warnings == ["Python ints do not overflow"]


def test_parse_invalid_model_output_raises():
    service = TranslationService()
    with pytest.raises(LLMProviderError):
        service._parse_structured_output("sorry I cannot help", "python")


@pytest.mark.asyncio
async def test_translate_zero_shot(client):
    payload = {
        "source_code": "public class Adder { public static int add(int a, int b) { return a + b; } }",
        "source_language": "java",
        "target_language": "python",
        "strategy": "zero_shot",
    }
    response = await client.post("/api/v1/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "translated_code" in data
    assert data["target_language"] == "python"
    assert data["metadata"]["strategy"] == "zero_shot"
    assert data["metadata"]["ast_valid"] is True
    assert data["metadata"]["latency_ms"] > 0


@pytest.mark.asyncio
async def test_translate_chain_of_thought(client):
    payload = {
        "source_code": "public class Adder { public static int add(int a, int b) { return a + b; } }",
        "source_language": "java",
        "target_language": "python",
        "strategy": "chain_of_thought",
    }
    response = await client.post("/api/v1/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "translated_code" in data
    assert data["metadata"]["strategy"] == "chain_of_thought"
    assert data["explanation"] is not None


@pytest.mark.asyncio
async def test_batch_translate(client):
    payload = {
        "source_code": "def multiply(x: int, y: int) -> int:\n    return x * y\n",
        "source_language": "python",
        "target_language": "java",
        "strategies": ["zero_shot", "few_shot"],
    }
    response = await client.post("/api/v1/translate/batch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 2
    assert data["results"][0]["metadata"]["strategy"] == "zero_shot"
    assert data["results"][1]["metadata"]["strategy"] == "few_shot"


@pytest.mark.asyncio
async def test_explain_differences(client):
    payload = {
        "source_code": "List<Integer> numbers = Arrays.asList(1, 2, 3);",
        "translated_code": "numbers = [1, 2, 3]",
        "source_language": "java",
        "target_language": "python",
    }
    response = await client.post("/api/v1/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert len(data["differences"]) > 0
    assert len(data["gotchas_and_caveats"]) > 0
