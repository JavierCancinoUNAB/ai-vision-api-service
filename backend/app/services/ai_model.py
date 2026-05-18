"""
ai_model.py — Servicio de clasificación de imágenes con MobileNetV2.

El modelo se carga una única vez en memoria al importar el módulo.
Esto evita recargar el modelo en cada petición HTTP.
"""

import logging
import io
from typing import Tuple

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Carga del modelo (una sola vez al importar este módulo)
# -------------------------------------------------------------------
_model = None
_decode_predictions = None
_preprocess_input = None


def _load_model():
    """Carga MobileNetV2 preentrenado con pesos de ImageNet."""
    global _model, _decode_predictions, _preprocess_input

    if _model is not None:
        return

    logger.info("Cargando modelo MobileNetV2 con pesos ImageNet...")
    try:
        # Importar dentro de la función para evitar overhead en el arranque
        from tensorflow.keras.applications.mobilenet_v2 import (
            MobileNetV2,
            preprocess_input,
            decode_predictions,
        )

        _model = MobileNetV2(weights="imagenet", include_top=True)
        _preprocess_input = preprocess_input
        _decode_predictions = decode_predictions
        logger.info("Modelo MobileNetV2 cargado correctamente.")
    except Exception as exc:
        logger.error("Error al cargar el modelo MobileNetV2: %s", exc)
        raise RuntimeError(f"No se pudo cargar el modelo de IA: {exc}") from exc


# Cargar el modelo al importar el módulo (durante el arranque de la API)
_load_model()


# -------------------------------------------------------------------
# Función principal de predicción
# -------------------------------------------------------------------

def predict_image(image_bytes: bytes) -> Tuple[str, float]:
    """
    Clasifica una imagen usando MobileNetV2.

    Args:
        image_bytes: Contenido binario de la imagen.

    Returns:
        Tupla (clase_predicha: str, confianza: float)
        donde confianza está entre 0.0 y 1.0.

    Raises:
        ValueError: Si la imagen no se puede procesar.
        RuntimeError: Si el modelo no está disponible.
    """
    if _model is None:
        raise RuntimeError("El modelo de IA no está disponible.")

    try:
        # Abrir imagen con Pillow y convertir a RGB (descarta canal alpha si existe)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Redimensionar a 224x224 (tamaño requerido por MobileNetV2)
        image = image.resize((224, 224), Image.LANCZOS)

        # Convertir a array numpy y añadir dimensión de batch
        img_array = np.array(image, dtype=np.float32)
        img_array = np.expand_dims(img_array, axis=0)

        # Preprocesar según los requisitos de MobileNetV2 (normalización [-1, 1])
        img_array = _preprocess_input(img_array)

        # Inferencia
        predictions = _model.predict(img_array, verbose=0)

        # Decodificar las 3 mejores predicciones de ImageNet
        decoded = _decode_predictions(predictions, top=3)[0]

        # Tomar la predicción con mayor confianza
        top_class_id, top_class_label, top_confidence = decoded[0]

        # Limpiar el nombre de la clase (reemplazar guiones bajos)
        clean_label = top_class_label.replace("_", " ").strip()

        return clean_label, float(top_confidence)

    except Exception as exc:
        logger.error("Error al procesar imagen: %s", exc)
        raise ValueError(f"No se pudo procesar la imagen: {exc}") from exc
