"""
routes/predict.py — Endpoint de clasificación de imágenes con IA.

Valida extensión, tamaño, procesa con MobileNetV2 y guarda en Supabase si está disponible.
"""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.schemas import PredictionResponse
from app.config import settings
from app.database import save_prediction
from app.services.ai_model import predict_image

logger = logging.getLogger(__name__)

router = APIRouter()

# Extensiones permitidas
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Clasificar imagen con IA",
    description=(
        "Recibe una imagen (jpg, jpeg, png o webp, máximo 5 MB), "
        "la procesa con MobileNetV2 y devuelve la predicción con confianza."
    ),
)
async def predict(file: UploadFile = File(..., description="Imagen a clasificar")) -> PredictionResponse:
    # ------------------------------------------------------------------
    # 1. Validar extensión
    # ------------------------------------------------------------------
    if not file.filename:
        raise HTTPException(status_code=400, detail="No se recibió ningún archivo.")

    extension = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Extensión '{extension}' no permitida. Use: {', '.join(ALLOWED_EXTENSIONS)}.",
        )

    # ------------------------------------------------------------------
    # 2. Leer contenido y validar tamaño
    # ------------------------------------------------------------------
    image_bytes = await file.read()

    if len(image_bytes) > settings.max_file_size_bytes:
        size_mb = len(image_bytes) / (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"El archivo pesa {size_mb:.2f} MB. Máximo permitido: {settings.max_file_size_mb} MB.",
        )

    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="El archivo está vacío.")

    # ------------------------------------------------------------------
    # 3. Clasificar imagen con MobileNetV2
    # ------------------------------------------------------------------
    try:
        prediction_label, confidence = predict_image(image_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        logger.error("Error en el modelo IA: %s", exc)
        raise HTTPException(status_code=503, detail="El servicio de IA no está disponible temporalmente.")

    # ------------------------------------------------------------------
    # 4. Persistir en Supabase (no obligatorio para responder)
    # ------------------------------------------------------------------
    created_at = datetime.now(timezone.utc)
    warning = None

    saved = save_prediction(
        filename=file.filename,
        prediction=prediction_label,
        confidence=confidence,
        model_used=settings.model_name,
        created_at=created_at,
    )

    if not saved and not settings.supabase_configured:
        warning = "Supabase no está configurado. El resultado no se guardó en la base de datos."
    elif not saved:
        warning = "No se pudo guardar en la base de datos, pero la predicción fue exitosa."

    logger.info(
        "Predicción: filename=%s, label=%s, confidence=%.4f, saved=%s",
        file.filename,
        prediction_label,
        confidence,
        saved,
    )

    return PredictionResponse(
        filename=file.filename,
        prediction=prediction_label,
        confidence=round(confidence, 4),
        model=settings.model_name,
        created_at=created_at,
        saved=saved,
        warning=warning,
    )
