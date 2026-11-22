import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.prompt_engine.registry import get_prompt_registry
from app.schemas.translation import (
    BatchTranslationRequest,
    BatchTranslationResponse,
    TranslationRequest,
    TranslationResponse,
)
from app.services.translation_service import TranslationService

router = APIRouter(prefix="/translate", tags=["Translation"])


@router.post("", response_model=TranslationResponse)
async def translate_code(
    request: TranslationRequest,
    provider: Optional[str] = Query(None, description="Optional LLM provider override"),
    db: AsyncSession = Depends(get_db),
):
    """Translate source code using a specified prompt engineering strategy."""
    service = TranslationService(db=db)
    return await service.translate(request=request, provider=provider)


@router.post("/batch", response_model=BatchTranslationResponse)
async def batch_translate_code(
    request: BatchTranslationRequest,
    provider: Optional[str] = Query(None, description="Optional LLM provider override"),
    db: AsyncSession = Depends(get_db),
):
    """Run multiple prompt engineering strategies on the same source code for benchmark comparison."""
    service = TranslationService(db=db)
    results: List[TranslationResponse] = []

    for strat in request.strategies:
        single_req = TranslationRequest(
            source_code=request.source_code,
            source_language=request.source_language,
            target_language=request.target_language,
            prompt_strategy=strat,
            temperature=request.temperature,
        )
        res = await service.translate(request=single_req, provider=provider)
        results.append(res)

    return BatchTranslationResponse(results=results)


@router.get("/strategies")
async def list_strategies():
    """List all available prompt engineering strategies and versions."""
    registry = get_prompt_registry()
    return {"strategies": registry.list_strategies(task="translation")}
