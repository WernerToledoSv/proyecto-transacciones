"""
Normalizador para transacciones de transferencia bancaria.

Estructura de entrada esperada:
  {
    "reference_number":   "TRF-2024-001",  # → id
    "transfer_amount":    1500.00,          # → amount
    "transfer_currency":  "COP",            # → currency
    "status_code":        "ACCP",           # → status  (ver mapa de estados)
    "value_date":         "2024-03-20",     # → timestamp (fecha, sin hora)
    ...campos extra...
  }

Mapa de estados bancarios → StatusEnum:
  "ACCP" (AcceptedCustomerProfile) → completed
  "ACSC" (AcceptedSettlementCompleted) → completed
  "PDNG" (Pending)                  → pending
  "RJCT" (Rejected)                 → failed
  "REVD" (Reversed)                 → refunded
  "CANC" (Cancelled)                → cancelled
  cualquier otro → unknown

"""
from __future__ import annotations

from typing import Any

from app.models.transaction import NormalizedTransaction, SourceType, StatusEnum
from app.normalizers.base import BaseNormalizer
from app.rules.estados_bancarios import BANK_TRANSFER_STATUS_MAP

_CANONICAL_KEYS = {
    "reference_number", "transfer_amount", "transfer_currency",
    "status_code", "value_date",
}


class BankTransferNormalizer(BaseNormalizer):
    source = SourceType.BANK_TRANSFER

    def normalize(self, record: dict[str, Any]) -> NormalizedTransaction:
        reference = str(self._require(record, "reference_number"))
        transfer_amount = self._require(record, "transfer_amount")
        transfer_currency = str(self._require(record, "transfer_currency"))
        status_code = str(self._require(record, "status_code")).upper()
        value_date = self._require(record, "value_date")

        amount = self._parse_amount(transfer_amount, "transfer_amount")
        timestamp = self._parse_datetime(value_date, "value_date")
        status = BANK_TRANSFER_STATUS_MAP.get(status_code, StatusEnum.UNKNOWN)

        extra = self._extra(record, _CANONICAL_KEYS)
        if status == StatusEnum.UNKNOWN:
            extra["_status_warning"] = (
                f"Código de estado bancario desconocido: '{status_code}'. "
                "Se mapeó a 'unknown'."
            )

        return NormalizedTransaction(
            id=reference,
            source=self.source,
            amount=amount,
            currency=transfer_currency,
            status=status,
            timestamp=timestamp,
            extra_fields=extra,
        )
