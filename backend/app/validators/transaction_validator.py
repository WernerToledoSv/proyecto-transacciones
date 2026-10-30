"""
Validaciones de negocio sobre transacciones ya normalizadas.

Estas validaciones se ejecutan DESPUÉS de la normalización (Pydantic ya
verificó tipos). Se ocupan de reglas de dominio como:
  - El ID no puede ser una cadena vacía.
  - El monto debe ser mayor que cero para estados que implican movimiento.
  - La moneda debe estar incluida en el catálogo de monedas soportadas.
  - El timestamp no puede ser una fecha absurdamente futura (> 1 año desde hoy).

"""
from __future__ import annotations

import re
from datetime import datetime, timezone, timedelta
from typing import Any

from app.models.transaction import NormalizedTransaction, StatusEnum
from app.rules.monedas import SUPPORTED_CURRENCIES

# Códigos de moneda que implican movimiento de fondos (monto debe ser > 0)
_ACTIVE_STATUSES = {StatusEnum.COMPLETED, StatusEnum.PENDING}

_CURRENCY_RE = re.compile(r"^[A-Z]{3}$")

# Tolerancia máxima hacia el futuro
_MAX_FUTURE_DELTA = timedelta(days=365)


class ValidationResult:
    """Resultado de validar una transacción normalizada."""

    __slots__ = ("is_valid", "errors")

    def __init__(self) -> None:
        self.is_valid: bool = True
        self.errors: list[str] = []

    def add_error(self, message: str) -> None:
        self.is_valid = False
        self.errors.append(message)

    def __bool__(self) -> bool:
        return self.is_valid


def validate(tx: NormalizedTransaction) -> ValidationResult:
    """
    Valida una transacción normalizada con las reglas de negocio del dominio.

    Returns:
      ValidationResult — contiene `is_valid` y la lista de errores encontrados.
    """
    result = ValidationResult()

    _check_id(tx, result)
    _check_amount(tx, result)
    _check_currency(tx, result)
    _check_timestamp(tx, result)

    return result


# ── Reglas individuales ───────────────────────────────────────────────────────

def _check_id(tx: NormalizedTransaction, result: ValidationResult) -> None:
    if not tx.id or not tx.id.strip():
        result.add_error("El campo 'id' no puede estar vacío.")


def _check_amount(tx: NormalizedTransaction, result: ValidationResult) -> None:
    if tx.amount < 0:
        result.add_error(f"El monto no puede ser negativo: {tx.amount}.")
    elif tx.amount == 0 and tx.status in _ACTIVE_STATUSES:
        result.add_error(
            f"El monto es cero para una transacción con estado '{tx.status.value}'. "
            "Se espera un monto mayor que cero."
        )


def _check_currency(tx: NormalizedTransaction, result: ValidationResult) -> None:
    if not _CURRENCY_RE.match(tx.currency):
        result.add_error(
            f"La moneda '{tx.currency}' no cumple el formato de "
            "(3 letras mayúsculas)."
        )
    elif tx.currency not in SUPPORTED_CURRENCIES:
        result.add_error(
            f"La moneda '{tx.currency}' no está soportada por la aplicación. "
            f"Monedas permitidas: {', '.join(sorted(SUPPORTED_CURRENCIES))}."
        )


def _check_timestamp(tx: NormalizedTransaction, result: ValidationResult) -> None:
    now = datetime.now(tz=timezone.utc)
    if tx.timestamp > now + _MAX_FUTURE_DELTA:
        result.add_error(
            f"El timestamp '{tx.timestamp.isoformat()}' está más de un año "
            "en el futuro, lo cual es sospechoso."
        )
