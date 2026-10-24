from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.config import get_settings
from app.core.exceptions import CodeShiftException
from app.core.logging import logger
from app.db.database import init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing CodeShift AI database schemas...")
    await init_db()
    logger.info("Database initialized successfully.")
    yield
    logger.info("CodeShift AI shutting down.")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        description="Prompt Engineering Code Translation & Evaluation Platform",
        version="0.1.0",
        lifespan=lifespan,
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global Exception Handlers
    @app.exception_handler(CodeShiftException)
    async def codeshift_exception_handler(request: Request, exc: CodeShiftException):
        logger.error(f"Application error: {exc.message} - Details: {exc.details}")
        return JSONResponse(
            status_code=400,
            content={
                "error": exc.__class__.__name__,
                "message": exc.message,
                "details": exc.details,
            },
        )

    # Include API Routers
    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_app()
