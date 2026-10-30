"""
Modelo canónico de una transacción normalizada.

Decisiones de diseño documentadas
──────────────────────────────────
* `extra_fields`: preserva los campos originales que no tienen mapeo canónico.
  Esto evita pérdida de información y no inventa reglas.
* `currency`: se almacena en mayúsculas y debe estar incluida en el catálogo
  definido en `app/rules/monedas.py`.
* `status`: normalizado al enum StatusEnum. Si la fuente original usa un
  vocabulario diferente, el normalizador es responsable de la traducción.
  Los valores desconocidos se tratan como UNKNOWN y se reportan como aviso.
"""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator


class SourceType(str, Enum):
    STRIPE = "stripe"
    PAYPAL = "paypal"
    BANK_TRANSFER = "bank_transfer"
    UNKNOWN = "unknown"


class StatusEnum(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"
    UNKNOWN = "unknown"


class NormalizedTransaction(BaseModel):
    """Formato canónico de una transacción, independiente de la fuente."""

    id: str = Field(..., description="Identificador único (tomado de la fuente original)")
    source: SourceType = Field(..., description="Fuente de origen detectada")
    amount: float = Field(..., ge=0, description="Monto de la transacción (≥ 0)")
    currency: str = Field(..., min_length=3, max_length=3, description="Código de moneda en mayúsculas")
    status: StatusEnum = Field(..., description="Estado normalizado")
    timestamp: datetime = Field(..., description="Fecha y hora en UTC")
    extra_fields: dict[str, Any] = Field(
        default_factory=dict,
        description="Campos originales sin mapeo canónico. No se modifican.",
    )

    @field_validator("currency", mode="before")
    @classmethod
    def currency_upper(cls, v: str) -> str:
        return v.strip().upper()
