"""
schemas.py — Modelos Pydantic para solicitudes y respuestas de la API.
"""

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class PredictionResponse(BaseModel):
    """Respuesta del endpoint POST /api/predict."""
    filename: str = Field(..., description="Nombre del archivo analizado")
    prediction: str = Field(..., description="Clase detectada por el modelo IA")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confianza de la predicción (0-1)")
    model: str = Field(..., description="Nombre del modelo utilizado")
    created_at: datetime = Field(..., description="Fecha y hora del análisis")
    saved: bool = Field(..., description="True si se guardó en Supabase")
    warning: Optional[str] = Field(None, description="Advertencia opcional, p.ej. Supabase no configurado")


class HistoryItem(BaseModel):
    """Un registro del historial de predicciones."""
    model_config = ConfigDict(protected_namespaces=())

    id: Optional[int] = Field(None, description="Identificador único")
    filename: str = Field(..., description="Nombre del archivo analizado")
    prediction: str = Field(..., description="Clase detectada")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confianza (0-1)")
    model_used: str = Field(..., description="Modelo utilizado")
    image_url: Optional[str] = Field(None, description="URL de la imagen (opcional)")
    created_at: Optional[datetime] = Field(None, description="Fecha del análisis")


class HistoryResponse(BaseModel):
    """Respuesta del endpoint GET /api/history."""
    items: list[HistoryItem] = Field(default_factory=list)
    total: int = Field(..., description="Total de registros")
    supabase_available: bool = Field(..., description="Indica si Supabase está configurado")
    message: Optional[str] = Field(None, description="Mensaje informativo")


class HealthResponse(BaseModel):
    """Respuesta del endpoint GET /api/health."""
    status: str
    service: str
    environment: str
