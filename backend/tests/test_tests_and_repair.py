import pytest
from app.sandbox.docker_runner import IsolatedSandbox


@pytest.mark.asyncio
async def test_generate_tests_endpoint(client):
    payload = {
        "source_code": "public class Calc { public static int add(int a, int b) { return a + b; } }",
        "translated_code": "class Calc:\n    @staticmethod\n    def add(a: int, b: int) -> int:\n        return a + b\n",
        "source_language": "java",
        "target_language": "python",
        "num_tests": 3,
    }
    response = await client.post("/api/v1/tests/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["target_language"] == "python"
    assert data["test_framework"] == "pytest"
    assert "test_code" in data
    assert len(data["test_cases"]) > 0


@pytest.mark.asyncio
async def test_sandbox_host_execution_blocked(client):
    """Verify that arbitrary code is not executed on host when Docker execution is disabled."""
    payload = {
        "code": "import os\nos.system('echo dangerous')",
        "language": "python",
    }
    response = await client.post("/api/v1/tests/execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Ensure it ran static AST verification rather than running dangerous commands
    assert data["sandboxed"] is False
    assert "Host execution strictly blocked" in data["status_message"]
    assert data["success"] is True  # Syntactically valid python AST


@pytest.mark.asyncio
async def test_repair_endpoint(client):
    payload = {
        "source_code": "public class FixMe { public static int val() { return 42; } }",
        "current_code": "def val():\n    return 42 + ",
        "source_language": "java",
        "target_language": "python",
        "error_feedback": "SyntaxError: invalid syntax on line 2",
        "iteration": 1,
    }
    response = await client.post("/api/v1/repair", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["iteration"] == 1
    assert "repaired_code" in data
    assert data["is_ast_valid"] is True
    assert data["converged"] is True
    assert data["explanation_of_fix"] != ""
