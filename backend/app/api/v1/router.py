from fastapi import APIRouter
from app.api.v1.endpoints import benchmark, explain, health, repair, tests, translate

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(translate.router)
api_router.include_router(explain.router)
api_router.include_router(tests.router)
api_router.include_router(repair.router)
api_router.include_router(benchmark.router)
