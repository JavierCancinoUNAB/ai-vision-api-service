"""
routes/history.py — Endpoint para obtener el historial de predicciones.
"""

import logging
from fastapi import APIRouter
from app.schemas import HistoryResponse, HistoryItem
from app.database import get_predictions
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/history",
    response_model=HistoryResponse,
    summary="Historial de predicciones",
    description="Retorna las predicciones almacenadas en Supabase, ordenadas de más reciente a más antigua.",
)
async def history() -> HistoryResponse:
    if not settings.supabase_configured:
        return HistoryResponse(
            items=[],
            total=0,
            supabase_available=False,
            message="Supabase no está configurado. Configure las variables de entorno para ver el historial.",
        )

    raw_items = get_predictions(limit=50)

    items = []
    for row in raw_items:
        try:
            items.append(
                HistoryItem(
                    id=row.get("id"),
                    filename=row.get("filename", ""),
                    prediction=row.get("prediction", ""),
                    confidence=float(row.get("confidence", 0)),
                    model_used=row.get("model_used", ""),
                    image_url=row.get("image_url"),
                    created_at=row.get("created_at"),
                )
            )
        except Exception as exc:
            logger.warning("Error al parsear registro del historial: %s | row=%s", exc, row)

    return HistoryResponse(
        items=items,
        total=len(items),
        supabase_available=True,
        message=None,
    )
