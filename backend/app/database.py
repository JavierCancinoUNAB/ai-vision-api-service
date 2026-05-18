"""
database.py — Gestión de la conexión con Supabase y operaciones CRUD.

El cliente se inicializa solo si existen SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
Si no están configuradas, las funciones retornan valores neutros sin lanzar excepción.
"""

import logging
from typing import Optional, List, Any
from datetime import datetime, timezone

from app.config import settings

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Inicialización del cliente Supabase (una sola vez al importar)
# -------------------------------------------------------------------
_supabase_client = None


def _get_client():
    """Inicializa y devuelve el cliente Supabase. Solo crea una instancia."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not settings.supabase_configured:
        return None

    try:
        from supabase import create_client, Client
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
        logger.info("Cliente Supabase inicializado correctamente.")
        return _supabase_client
    except Exception as exc:
        logger.error("Error al inicializar Supabase: %s", exc)
        return None


# -------------------------------------------------------------------
# Operaciones de base de datos
# -------------------------------------------------------------------

def save_prediction(
    filename: str,
    prediction: str,
    confidence: float,
    model_used: str,
    image_url: Optional[str] = None,
    created_at: Optional[datetime] = None,
) -> bool:
    """
    Guarda una predicción en la tabla 'predictions' de Supabase.

    Retorna True si se guardó correctamente, False en cualquier otro caso.
    """
    client = _get_client()
    if client is None:
        logger.warning("Supabase no está configurado. La predicción no se guardó.")
        return False

    record = {
        "filename": filename,
        "prediction": prediction,
        "confidence": float(confidence),
        "model_used": model_used,
        "image_url": image_url,
        "created_at": (created_at or datetime.now(timezone.utc)).isoformat(),
    }

    try:
        response = client.table("predictions").insert(record).execute()
        if response.data:
            logger.info("Predicción guardada en Supabase con id=%s", response.data[0].get("id"))
            return True
        logger.warning("Supabase no devolvió datos al insertar: %s", response)
        return False
    except Exception as exc:
        logger.error("Error al guardar predicción en Supabase: %s", exc)
        return False


def get_predictions(limit: int = 50) -> List[Any]:
    """
    Obtiene las predicciones más recientes desde Supabase.

    Retorna lista vacía si Supabase no está configurado o hay un error.
    """
    client = _get_client()
    if client is None:
        logger.warning("Supabase no está configurado. No se puede obtener historial.")
        return []

    try:
        response = (
            client.table("predictions")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return response.data or []
    except Exception as exc:
        logger.error("Error al obtener predicciones de Supabase: %s", exc)
        return []
