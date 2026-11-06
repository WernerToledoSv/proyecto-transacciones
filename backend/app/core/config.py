"""
Configuración central de la aplicación.
Los valores se leen de variables de entorno o del archivo .env.
"""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    app_name: str = "Transacciones API"
    app_version: str = "1.0.0"
    app_env: str = "development"

    # CORS — lista separada por comas para los hosts de desarrollo del frontend.
    allowed_origins: str = "http://localhost:4200,http://127.0.0.1:4200"

    # Límite de tamaño por archivo; configurable con MAX_UPLOAD_FILE_SIZE_MB.
    max_upload_file_size_mb: int = 10

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def max_upload_file_size_bytes(self) -> int:
        return self.max_upload_file_size_mb * 1024 * 1024


settings = Settings()
