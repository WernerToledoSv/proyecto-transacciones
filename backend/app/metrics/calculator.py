"""
Calculadora de métricas sobre el conjunto de transacciones en memoria.

Regla fundamental:
  Los montos de monedas diferentes NUNCA se suman en un único total.
  `amount_by_currency` mantiene totales independientes por moneda soportada.
"""
from __future__ import annotations

from collections import defaultdict

from app.models.responses import MetricsResponse
from app.models.transaction import NormalizedTransaction


def compute_metrics(
    valid: list[NormalizedTransaction],
    total_received: int,
    total_invalid: int,
) -> MetricsResponse:
    """
    Calcula métricas sobre la lista de transacciones válidas.

    Args:
      valid:           Lista de transacciones normalizadas y validadas.
      total_received:  Total de registros recibidos (incluyendo inválidos).
      total_invalid:   Cantidad de registros que fallaron.

    Returns:
      MetricsResponse con todos los indicadores calculados.
    """
    amount_by_currency: dict[str, float] = defaultdict(float)
    count_by_source: dict[str, int] = defaultdict(int)
    count_by_status: dict[str, int] = defaultdict(int)

    for tx in valid:
        amount_by_currency[tx.currency] += tx.amount
        count_by_source[tx.source.value] += 1
        count_by_status[tx.status.value] += 1

    # Redondear a 2 decimales para evitar errores de punto flotante en la salida
    rounded_amounts = {
        currency: round(total, 2)
        for currency, total in amount_by_currency.items()
    }

    return MetricsResponse(
        total_received=total_received,
        total_valid=len(valid),
        total_invalid=total_invalid,
        amount_by_currency=rounded_amounts,
        count_by_source=dict(count_by_source),
        count_by_status=dict(count_by_status),
    )
