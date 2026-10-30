"""
Almacén en memoria para los resultados del procesamiento.

LIMITACIÓN CONOCIDA:
  Los datos se almacenan en la memoria del proceso de Python.
  Se pierden al reiniciar el servidor. No hay persistencia entre sesiones.
  Para persistencia real, reemplazar este módulo por una capa de repositorio
  con base de datos.

El store acumula los resultados de cada llamada a `/upload`.
Para reiniciar el estado, el cliente puede llamar a `DELETE /transactions`.
"""
from __future__ import annotations

from app.models.transaction import NormalizedTransaction, SourceType, StatusEnum
from app.models.responses import InvalidRecord


class InMemoryStore:
    def __init__(self) -> None:
        self._transactions: list[NormalizedTransaction] = []
        self._invalid_records: list[InvalidRecord] = []
        self._total_received: int = 0

    # ── Escritura ────────────────────────────────────────────────────────────

    def add_transaction(self, tx: NormalizedTransaction) -> None:
        self._transactions.append(tx)

    def add_invalid(self, record: InvalidRecord) -> None:
        self._invalid_records.append(record)

    def increment_received(self, count: int) -> None:
        self._total_received += count

    def clear(self) -> None:
        self._transactions.clear()
        self._invalid_records.clear()
        self._total_received = 0

    # ── Lectura ──────────────────────────────────────────────────────────────

    @property
    def transactions(self) -> list[NormalizedTransaction]:
        return list(self._transactions)

    @property
    def invalid_records(self) -> list[InvalidRecord]:
        return list(self._invalid_records)

    @property
    def total_received(self) -> int:
        return self._total_received

    def filter_transactions(
        self,
        source: SourceType | None = None,
        status: StatusEnum | None = None,
        currency: str | None = None,
    ) -> list[NormalizedTransaction]:
        result = self._transactions
        if source is not None:
            result = [t for t in result if t.source == source]
        if status is not None:
            result = [t for t in result if t.status == status]
        if currency is not None:
            result = [t for t in result if t.currency == currency.upper()]
        return result


# Instancia única (singleton de proceso)
store = InMemoryStore()
