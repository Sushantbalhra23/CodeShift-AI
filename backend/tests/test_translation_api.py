import pytest


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
