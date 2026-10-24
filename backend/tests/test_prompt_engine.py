import pytest
from app.prompt_engine.registry import PromptRegistry, get_prompt_registry
from app.llm.base import LLMMessage
from app.llm.factory import get_llm_client
from app.llm.providers.mock import MockLLMClient


def test_prompt_registry_loading():
    registry = get_prompt_registry()
    strategies = registry.list_strategies()
    assert len(strategies) > 0

    # Verify zero_shot template
    zero_shot = registry.get_template(task="translation", strategy="zero_shot")
    assert zero_shot.version == "1.0.0"
    assert "Strict Invariants" in zero_shot.system_prompt
    rendered = zero_shot.render_user(
        source_language="java",
        target_language="python",
        source_code="public class Test {}"
    )
    assert "public class Test {}" in rendered
    assert "python" in rendered


def test_prompt_registry_strategies_coverage():
    registry = get_prompt_registry()
    expected_strategies = ["zero_shot", "few_shot", "chain_of_thought", "role_expert"]
    for strat in expected_strategies:
        tpl = registry.get_template(task="translation", strategy=strat)
        assert tpl is not None
        assert tpl.strategy == strat


@pytest.mark.asyncio
async def test_mock_llm_client_translation():
    client = get_llm_client("mock")
    assert isinstance(client, MockLLMClient)

    messages = [
        LLMMessage(role="system", content="You are a compiler."),
        LLMMessage(
            role="user",
            content="Translate from java to python: public class Solution { public static void main() {} }"
        ),
    ]
    response = await client.generate(messages)
    assert response.provider == "mock"
    assert "def " in response.content or "class " in response.content
    assert response.latency_ms > 0
    assert response.usage.total_tokens > 0
