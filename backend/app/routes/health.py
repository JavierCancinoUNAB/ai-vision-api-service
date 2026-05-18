"""
routes/health.py — Endpoint de salud del servicio.
"""

from fastapi import APIRouter
from app.schemas import HealthResponse
from app.config import settings

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Estado del servicio",
    description="Devuelve el estado actual de la API. Útil para healthchecks en Render y Docker.",
)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="AI Vision API",
        environment=settings.environment,
    )
