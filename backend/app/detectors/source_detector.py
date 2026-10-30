"""
Detección de fuente por heurística de campos.

Estrategia:
  Cada fuente conocida tiene un conjunto de campos "firma" que la identifican
  de forma única. El detector evalúa cada firma en orden de especificidad
  (mayor número de campos primero) y devuelve la primera coincidencia.

  Si ninguna firma coincide, devuelve SourceType.UNKNOWN.

Agregar una fuente nueva:
  1. Definir la firma en `_SIGNATURES`.
  2. Crear el normalizador correspondiente en `normalizers/`.
  3. Registrarlo en `normalizers/registry.py`.

Decisiones pendientes:
  - Si en el futuro las fuentes incluyen un campo "source" explícito,
    se puede priorizar ese campo antes de evaluar las firmas.
"""
from __future__ import annotations

from typing import Any

from app.models.transaction import SourceType


# ── Firmas por fuente ─────────────────────────────────────────────────────────
# Cada entrada es un frozenset de claves que deben estar presentes en el registro.
# Las firmas más específicas (más campos) se evalúan primero.

_SIGNATURES: list[tuple[SourceType, frozenset[str]]] = sorted(
    [
        (
            SourceType.STRIPE,
            frozenset({"charge_id", "amount_cents", "currency", "charge_status", "created_at"}),
        ),
        (
            SourceType.PAYPAL,
            frozenset({"transaction_id", "gross_amount", "currency_code", "payment_status", "time_created"}),
        ),
        (
            SourceType.BANK_TRANSFER,
            frozenset({"reference_number", "transfer_amount", "transfer_currency", "status_code", "value_date"}),
        ),
    ],
    key=lambda x: len(x[1]),
    reverse=True,  # más específico primero
)


def detect_source(record: dict[str, Any]) -> SourceType:
    """
    Detecta la fuente de un registro comparando sus claves con las firmas
    registradas.

    Returns:
      SourceType — el tipo de fuente identificado, o SourceType.UNKNOWN.
    """
    present_keys = frozenset(record.keys())
    for source, signature in _SIGNATURES:
        if signature.issubset(present_keys):
            return source
    return SourceType.UNKNOWN


def get_registered_sources() -> list[str]:
    """Devuelve los nombres de las fuentes con firma registrada."""
    return [s.value for s, _ in _SIGNATURES]
