from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.evaluation import RepairRequest, RepairResponse
from app.services.repair_service import RepairService

router = APIRouter(prefix="/repair", tags=["Iterative Repair"])


@router.post("", response_model=RepairResponse)
async def repair_code(
    request: RepairRequest,
    provider: Optional[str] = Query(None, description="Optional LLM provider override"),
    translation_id: Optional[int] = Query(None, description="Optional translation DB ID to link repair iteration"),
    db: AsyncSession = Depends(get_db),
):
    """Iteratively repair broken code by incorporating compiler, AST, or test diagnostic feedback."""
    service = RepairService(db=db)
    return await service.repair(
        request=request,
        provider=provider,
        translation_id=translation_id,
    )
