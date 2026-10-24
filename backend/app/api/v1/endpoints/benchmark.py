from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy import Integer, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import EvaluationRecord, TranslationRecord
from app.schemas.translation import TranslationMetadata, TranslationResponse

router = APIRouter(prefix="/benchmark", tags=["Benchmark & History"])


@router.get("/history", response_model=List[TranslationResponse])
async def get_translation_history(
    limit: int = 50,
    strategy: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve saved translation runs with evaluation metrics and strategy logs."""
    query = select(TranslationRecord).order_by(TranslationRecord.id.desc()).limit(limit)
    if strategy:
        query = query.where(TranslationRecord.strategy == strategy)

    result = await db.execute(query)
    records = result.scalars().all()

    responses = []
    for r in records:
        responses.append(
            TranslationResponse(
                id=r.id,
                source_language=r.source_language,
                target_language=r.target_language,
                source_code=r.source_code,
                translated_code=r.translated_code,
                explanation=r.explanation,
                metadata=TranslationMetadata(
                    strategy=r.strategy,
                    prompt_version=r.prompt_version,
                    model=r.model_name,
                    provider=r.provider,
                    latency_ms=r.latency_ms or 0.0,
                    prompt_tokens=r.prompt_tokens or 0,
                    completion_tokens=r.completion_tokens or 0,
                    total_tokens=r.total_tokens or 0,
                    ast_valid=r.ast_valid or False,
                ),
                created_at=r.created_at,
            )
        )
    return responses


@router.get("/stats")
async def get_benchmark_stats(db: AsyncSession = Depends(get_db)):
    """Retrieve aggregate benchmark statistics across prompt strategies."""
    # Total count
    count_res = await db.execute(select(func.count(TranslationRecord.id)))
    total_runs = count_res.scalar() or 0

    # Stats grouped by strategy
    group_query = select(
        TranslationRecord.strategy,
        func.count(TranslationRecord.id).label("count"),
        func.avg(TranslationRecord.latency_ms).label("avg_latency"),
        func.sum(TranslationRecord.total_tokens).label("sum_tokens"),
        func.sum(cast(TranslationRecord.ast_valid, Integer)).label("valid_count"),
    ).group_by(TranslationRecord.strategy)

    res = await db.execute(group_query)
    strategies_stats = []
    for row in res.all():
        strat, count, avg_lat, sum_tok, valid_cnt = row
        strategies_stats.append({
            "strategy": strat,
            "total_runs": count,
            "avg_latency_ms": round(avg_lat or 0.0, 2),
            "total_tokens": sum_tok or 0,
            "valid_ast_count": valid_cnt or 0,
            "ast_pass_rate": round(((valid_cnt or 0) / count) * 100, 1) if count > 0 else 0.0,
        })

    return {
        "total_experiments": total_runs,
        "strategies": strategies_stats,
    }


@router.delete("/clear")
async def clear_history(db: AsyncSession = Depends(get_db)):
    """Clear benchmark run history."""
    await db.execute(TranslationRecord.__table__.delete())
    await db.commit()
    return {"message": "Benchmark history cleared successfully."}
