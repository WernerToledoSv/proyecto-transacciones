"""
Normalizador para transacciones de PayPal.

Estructura de entrada esperada:
  {
    "transaction_id":  "PAYID-ABC123",   # → id
    "gross_amount":    "75.00",          # → amount  (string con decimal)
    "currency_code":   "EUR",            # → currency
    "payment_status":  "Completed",      # → status  (ver mapa de estados)
    "time_created":    "2024-03-15T10:30:00Z",  # → timestamp (formato de fecha admitido)
    ...campos extra...
  }

Mapa de estados PayPal → StatusEnum:
  "completed"  → completed
  "pending"    → pending
  "failed"     → failed
  "refunded"   → refunded
  "cancelled"  → cancelled
  cualquier otro → unknown

Decisión pendiente:
  PayPal distingue "Completed" de "Processed". Por ahora ambos se mapean
  a "completed". Si se requiere granularidad, agregar estado al enum.
"""
from __future__ import annotations

from typing import Any

from app.core.exceptions import NormalizationError
from app.models.transaction import NormalizedTransaction, SourceType, StatusEnum
from app.normalizers.base import BaseNormalizer
from app.rules.estados import PAYPAL_STATUS_MAP

_CANONICAL_KEYS = {
    "transaction_id", "gross_amount", "currency_code",
    "payment_status", "time_created",
}


class PaypalNormalizer(BaseNormalizer):
    source = SourceType.PAYPAL

    def normalize(self, record: dict[str, Any]) -> NormalizedTransaction:
        transaction_id = str(self._require(record, "transaction_id"))
        gross_amount = self._require(record, "gross_amount")
        currency_code = str(self._require(record, "currency_code"))
        payment_status = str(self._require(record, "payment_status")).lower()
        time_created = self._require(record, "time_created")

        amount = self._parse_amount(gross_amount, "gross_amount")
        timestamp = self._parse_datetime(time_created, "time_created")
        status = PAYPAL_STATUS_MAP.get(payment_status, StatusEnum.UNKNOWN)

        extra = self._extra(record, _CANONICAL_KEYS)
        if status == StatusEnum.UNKNOWN:
            extra["_status_warning"] = (
                f"Estado PayPal desconocido: '{payment_status}'. Se mapeó a 'unknown'."
            )

        return NormalizedTransaction(
            id=transaction_id,
            source=self.source,
            amount=amount,
            currency=currency_code,
            status=status,
            timestamp=timestamp,
            extra_fields=extra,
        )
