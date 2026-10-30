"""
Endpoint de métricas del procesamiento.

GET /api/v1/metrics/
  Calcula y devuelve indicadores sobre las transacciones en memoria.
"""
from __future__ import annotations

from fastapi import APIRouter

from app.metrics.calculator import compute_metrics
from app.models.responses import ApiResponse, MetricsResponse
from app.services.store import store

router = APIRouter(prefix="/metrics", tags=["Metrics"])


@router.get(
    "/",
    response_model=ApiResponse[MetricsResponse],
    summary="Obtener métricas del procesamiento",
    description=(
        "Calcula indicadores sobre las transacciones actualmente en memoria: "
        "totales, montos por moneda (sin mezclar divisas), "
        "distribución por fuente y por estado."
    ),
)
def get_metrics() -> ApiResponse[MetricsResponse]:
    metrics = compute_metrics(
        valid=store.transactions,
        total_received=store.total_received,
        total_invalid=len(store.invalid_records),
    )
    return ApiResponse(success=True, data=metrics)
