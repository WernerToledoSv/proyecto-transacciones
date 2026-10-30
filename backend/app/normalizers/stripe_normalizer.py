"""
Normalizador para transacciones de Stripe.

Estructura de entrada esperada:
  {
    "charge_id":     "ch_3abc123",      # → id
    "amount_cents":  15000,             # → amount  (÷ 100 para convertir a unidades)
    "currency":      "usd",             # → currency (se normaliza a mayúsculas)
    "charge_status": "succeeded",       # → status  (ver mapa de estados)
    "created_at":    1698000000,        # → timestamp (Unix timestamp)
    ...campos extra...
  }

Mapa de estados Stripe → StatusEnum:
  "succeeded"  → completed
  "pending"    → pending
  "failed"     → failed
  "refunded"   → refunded
  cualquier otro → unknown  (se registra como aviso en extra_fields)

Decisión pendiente:
  Stripe puede enviar el monto en centavos (integer) o en unidades (float)
  dependiendo de la moneda (JPY no tiene centavos). Por ahora se divide
  siempre entre 100. Si se agregan monedas de cero decimales, esta lógica
  debe ajustarse.
"""
from __future__ import annotations

from typing import Any

from app.core.exceptions import NormalizationError
from app.models.transaction import NormalizedTransaction, SourceType, StatusEnum
from app.normalizers.base import BaseNormalizer
from app.rules.estados import STRIPE_STATUS_MAP

_CANONICAL_KEYS = {"charge_id", "amount_cents", "currency", "charge_status", "created_at"}


class StripeNormalizer(BaseNormalizer):
    source = SourceType.STRIPE

    def normalize(self, record: dict[str, Any]) -> NormalizedTransaction:
        charge_id = str(self._require(record, "charge_id"))
        amount_cents = self._require(record, "amount_cents")
        currency = str(self._require(record, "currency"))
        charge_status = str(self._require(record, "charge_status")).lower()
        created_at = self._require(record, "created_at")

        amount = self._parse_amount(amount_cents, "amount_cents") / 100
        timestamp = self._parse_datetime(created_at, "created_at")
        status = STRIPE_STATUS_MAP.get(charge_status, StatusEnum.UNKNOWN)

        extra = self._extra(record, _CANONICAL_KEYS)
        if status == StatusEnum.UNKNOWN:
            extra["_status_warning"] = (
                f"Estado Stripe desconocido: '{charge_status}'. Se mapeó a 'unknown'."
            )

        return NormalizedTransaction(
            id=charge_id,
            source=self.source,
            amount=amount,
            currency=currency,
            status=status,
            timestamp=timestamp,
            extra_fields=extra,
        )
