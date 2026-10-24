from typing import Optional
from fastapi import APIRouter, Query

from app.schemas.explanation import ExplanationRequest, ExplanationResponse
from app.services.explanation_service import ExplanationService

router = APIRouter(prefix="/explain", tags=["Explanation"])


@router.post("", response_model=ExplanationResponse)
async def explain_code(
    request: ExplanationRequest,
    provider: Optional[str] = Query(None, description="Optional LLM provider override"),
):
    """Explain language-specific paradigm differences, gotchas, and runtime behaviors."""
    service = ExplanationService()
    return await service.explain(request=request, provider=provider)
