"""
config.py — Configuración centralizada de variables de entorno.

Se utiliza pydantic-settings para validar y leer las variables.
Si no existe .env, los valores por defecto permiten arrancar sin Supabase.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    # Supabase — opcionales para no romper el arranque
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_anon_key: str = ""

    # Parámetros de la API
    max_file_size_mb: int = 5
    model_name: str = "MobileNetV2"
    environment: str = "development"

    # CORS — acepta cadena separada por comas o valor único
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        protected_namespaces=(),
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Devuelve los orígenes CORS como lista."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def supabase_configured(self) -> bool:
        """True solo si las dos variables mínimas de Supabase están presentes."""
        return bool(self.supabase_url and self.supabase_service_role_key)

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024


# Instancia única exportable
settings = Settings()
