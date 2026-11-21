from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.config import get_settings
from app.core.exceptions import CodeShiftException, LLMProviderError
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

    # CORS Middleware — allows Vite dev server on port 5173
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global Exception Handlers

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """Return field-level 422 messages in a clean, human-readable format."""
        errors = []
        for err in exc.errors():
            field = " → ".join(str(loc) for loc in err["loc"] if loc != "body")
            errors.append({"field": field, "message": err["msg"]})
        first_message = errors[0]["message"] if errors else "Validation failed."
        return JSONResponse(
            status_code=422,
            content={
                "error": "validation_error",
                "message": first_message,
                "details": errors,
            },
        )

    @app.exception_handler(LLMProviderError)
    async def llm_provider_error_handler(request: Request, exc: LLMProviderError):
        """Map upstream LLM failures to HTTP 502 Bad Gateway."""
        logger.error(f"LLM provider error: {exc.message} - Details: {exc.details}")
        return JSONResponse(
            status_code=502,
            content={
                "error": "provider_error",
                "message": exc.message,
                "details": exc.details,
            },
        )

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
