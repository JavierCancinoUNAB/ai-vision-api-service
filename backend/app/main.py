"""
main.py — Punto de entrada de la API FastAPI.

Configura CORS, registra los routers y expone Swagger UI en /docs.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import health, predict, history

# -------------------------------------------------------------------
# Logging básico
# -------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# -------------------------------------------------------------------
# Lifespan (reemplaza el deprecado @app.on_event)
# -------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Startup
    logger.info("=" * 60)
    logger.info("AI Vision API iniciada correctamente.")
    logger.info("Entorno: %s", settings.environment)
    logger.info("Modelo IA: %s", settings.model_name)
    logger.info("Supabase configurado: %s", settings.supabase_configured)
    logger.info("CORS permitidos: %s", settings.cors_origins_list)
    logger.info("Swagger UI disponible en /docs")
    logger.info("=" * 60)
    yield
    # Shutdown (si se necesitara cleanup)


# -------------------------------------------------------------------
# Instancia FastAPI
# -------------------------------------------------------------------
app = FastAPI(
    title="AI Vision API as a Service",
    description=(
        "API REST para clasificación de imágenes con MobileNetV2 (TensorFlow/Keras). "
        "Parte de una arquitectura cloud en tres capas: IaaS (AWS EC2), "
        "PaaS (Render + Supabase) y SaaS (Vercel)."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# -------------------------------------------------------------------
# CORS
# -------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# Registro de routers bajo el prefijo /api
# -------------------------------------------------------------------
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(predict.router, prefix="/api", tags=["Predicción"])
app.include_router(history.router, prefix="/api", tags=["Historial"])
