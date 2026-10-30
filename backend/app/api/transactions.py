"""
Endpoints de consulta de transacciones normalizadas.

GET /api/v1/transactions/
  Parámetros opcionales de filtro: source, status, currency.

GET /api/v1/transactions/{id}
  Retorna una transacción por su ID.

DELETE /api/v1/transactions/
  Limpia el store en memoria (útil para reiniciar el estado en desarrollo).
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, status
from typing import Annotated

from app.models.responses import ApiResponse
from app.models.transaction import NormalizedTransaction, SourceType, StatusEnum
from app.services.store import store

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get(
    "/",
    response_model=ApiResponse[list[NormalizedTransaction]],
    summary="Listar transacciones normalizadas",
    description=(
        "Devuelve todas las transacciones normalizadas en memoria. "
        "Soporta filtros opcionales por fuente, estado y moneda."
    ),
)
def list_transactions(
    source: Annotated[SourceType | None, Query(description="Filtrar por fuente")] = None,
    status_filter: Annotated[
        StatusEnum | None,
        Query(alias="status", description="Filtrar por estado"),
    ] = None,
    currency: Annotated[
        str | None, Query(description="Filtrar por código de moneda soportado")
    ] = None,
) -> ApiResponse[list[NormalizedTransaction]]:
    transactions = store.filter_transactions(
        source=source,
        status=status_filter,
        currency=currency,
    )
    return ApiResponse(success=True, data=transactions)


@router.get(
    "/{transaction_id}",
    response_model=ApiResponse[NormalizedTransaction],
    summary="Obtener transacción por ID",
)
def get_transaction(transaction_id: str) -> ApiResponse[NormalizedTransaction]:
    match = next(
        (t for t in store.transactions if t.id == transaction_id), None
    )
    if match is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transacción con id '{transaction_id}' no encontrada.",
        )
    return ApiResponse(success=True, data=match)


@router.delete(
    "/",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Limpiar store en memoria",
    description=(
        "Elimina todas las transacciones, registros inválidos y contadores. "
        "Útil para reiniciar el estado durante el desarrollo. "
        "NOTA: esta operación es irreversible en la sesión actual."
    ),
)
def clear_transactions() -> ApiResponse[dict]:
    count = len(store.transactions)
    store.clear()
    return ApiResponse(
        success=True,
        data={"message": f"Store limpiado. Se eliminaron {count} transacciones."},
    )
