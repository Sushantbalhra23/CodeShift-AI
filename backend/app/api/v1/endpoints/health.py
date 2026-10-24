from fastapi import APIRouter
from app.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "default_provider": settings.DEFAULT_LLM_PROVIDER,
        "docker_execution_enabled": settings.ALLOW_DOCKER_EXECUTION,
    }
