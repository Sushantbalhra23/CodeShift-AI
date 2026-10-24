from typing import Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.sandbox.docker_runner import IsolatedSandbox, SandboxRunResult
from app.schemas.evaluation import TestGenerationRequest, TestGenerationResponse
from app.services.test_gen_service import TestGenerationService

router = APIRouter(prefix="/tests", tags=["Testing & Verification"])


class ExecuteCodeRequest(BaseModel):
    code: str
    language: str


@router.post("/generate", response_model=TestGenerationResponse)
async def generate_tests(
    request: TestGenerationRequest,
    provider: Optional[str] = Query(None, description="Optional LLM provider override"),
):
    """Synthesize target language unit tests (pytest for Python, JUnit 5 for Java) and input-output test cases."""
    service = TestGenerationService()
    return await service.generate_tests(request=request, provider=provider)


@router.post("/execute", response_model=SandboxRunResult)
async def execute_code_safely(request: ExecuteCodeRequest):
    """
    Safely evaluate code. If Docker sandbox is enabled and running, executes inside
    an isolated, resource-capped container without network. Otherwise, safely performs static AST verification.
    """
    return IsolatedSandbox.execute(code=request.code, language=request.language)
