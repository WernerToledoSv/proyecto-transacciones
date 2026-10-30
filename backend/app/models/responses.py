"""
Contratos de respuesta de la API.

Todas las respuestas siguen la estructura:
  {
    "success": bool,
    "data":    <payload>,   # presente cuando success=True
    "error":   <str|null>,  # presente cuando success=False
  }

El campo `data` varía según el endpoint; se tipó con genéricos para
reutilizar la envoltura sin repetir código.
"""
from __future__ import annotations

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


# ── Envoltura genérica ───────────────────────────────────────────────────────

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: T | None = None
    error: str | None = None


# ── Registro inválido ────────────────────────────────────────────────────────

class InvalidRecord(BaseModel):
    """Registro que no pudo normalizarse, con la razón del fallo."""

    raw: dict[str, Any] = Field(..., description="Dato original sin modificar")
    source_hint: str = Field(..., description="Fuente detectada o 'unknown'")
    error_type: str = Field(..., description="Categoría del error")
    error_detail: str = Field(..., description="Descripción legible del problema")


# ── Métricas ─────────────────────────────────────────────────────────────────

class MetricsResponse(BaseModel):
    total_received: int = Field(..., description="Total de registros recibidos")
    total_valid: int = Field(..., description="Registros normalizados correctamente")
    total_invalid: int = Field(..., description="Registros con errores")
    amount_by_currency: dict[str, float] = Field(
        ...,
        description="Suma de montos agrupada por código de moneda soportado. "
                    "Las monedas nunca se mezclan.",
    )
    count_by_source: dict[str, int] = Field(
        ..., description="Cantidad de transacciones por fuente"
    )
    count_by_status: dict[str, int] = Field(
        ..., description="Cantidad de transacciones por estado"
    )


# ── Resultado de procesamiento ───────────────────────────────────────────────

class FileProcessingResult(BaseModel):
    filename: str
    records_found: int
    valid: int
    invalid: int
    errors: list[str] = Field(
        default_factory=list,
        description="Errores a nivel de archivo (vacío, JSON mal formado, etc.)",
    )


class ProcessingResponse(BaseModel):
    files: list[FileProcessingResult]
    total_valid: int
    total_invalid: int

