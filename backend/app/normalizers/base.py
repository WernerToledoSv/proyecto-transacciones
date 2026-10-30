"""
Clase base para normalizadores.

Contrato:
  Todo normalizador debe implementar `normalize(record)` y devolver
  un NormalizedTransaction o elevar NormalizationError.

  Los campos sin mapeo canónico se pasan a `extra_fields` para no perder
  información original.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any

from app.core.exceptions import NormalizationError
from app.models.transaction import NormalizedTransaction, SourceType, StatusEnum
from app.rules.fechas import DATE_FORMATS


class BaseNormalizer(ABC):
    """Interfaz común para todos los normalizadores de fuente."""

    source: SourceType  # debe definirse en cada subclase

    @abstractmethod
    def normalize(self, record: dict[str, Any]) -> NormalizedTransaction:
        """
        Transforma un registro crudo al modelo canónico.

        Raises:
          NormalizationError — si el registro no puede transformarse.
        """
        ...

    # ── Utilidades compartidas ───────────────────────────────────────────────

    @staticmethod
    def _require(record: dict[str, Any], key: str) -> Any:
        """Obtiene un campo obligatorio o eleva NormalizationError."""
        value = record.get(key)
        if value is None:
            raise NormalizationError(f"Campo obligatorio ausente: '{key}'.")
        return value

    @staticmethod
    def _parse_datetime(value: Any, field_name: str) -> datetime:
        """
        Intenta parsear el valor como datetime.

        Acepta:
          - Cadenas con los formatos definidos en app/rules/fechas.py.
          - Unix timestamp (int o float).

        Si el valor no tiene zona horaria, se asume UTC.
        """
        if isinstance(value, (int, float)):
            try:
                return datetime.fromtimestamp(value, tz=timezone.utc)
            except (OSError, OverflowError, ValueError) as exc:
                raise NormalizationError(
                    f"'{field_name}' no es un timestamp Unix válido: {value!r}."
                ) from exc

        if isinstance(value, str):
            for fmt in DATE_FORMATS:
                try:
                    dt = datetime.strptime(value, fmt)
                    if dt.tzinfo is None:
                        dt = dt.replace(tzinfo=timezone.utc)
                    return dt
                except ValueError:
                    continue
            raise NormalizationError(
                f"'{field_name}' no tiene un formato de fecha reconocido: {value!r}."
            )

        raise NormalizationError(
            f"'{field_name}' debe ser una fecha con formato admitido o un timestamp Unix, "
            f"no {type(value).__name__!r}."
        )

    @staticmethod
    def _parse_amount(value: Any, field_name: str) -> float:
        """Convierte el valor a float y verifica que sea >= 0."""
        try:
            amount = float(value)
        except (TypeError, ValueError) as exc:
            raise NormalizationError(
                f"'{field_name}' no es un número válido: {value!r}."
            ) from exc
        if amount < 0:
            raise NormalizationError(
                f"'{field_name}' no puede ser negativo: {value!r}."
            )
        return amount

    @staticmethod
    def _extra(record: dict[str, Any], canonical_keys: set[str]) -> dict[str, Any]:
        """Devuelve los campos del registro que no tienen mapeo canónico."""
        return {k: v for k, v in record.items() if k not in canonical_keys}
