"""
Endpoint de registros inválidos.

GET /api/v1/invalid/
  Devuelve todos los registros que no pudieron normalizarse, con el motivo.
"""
from __future__ import annotations

from fastapi import APIRouter

from app.models.responses import ApiResponse, InvalidRecord
from app.services.store import store

router = APIRouter(prefix="/invalid", tags=["Invalid Records"])


@router.get(
    "/",
    response_model=ApiResponse[list[InvalidRecord]],
    summary="Consultar registros inválidos",
    description=(
        "Devuelve los registros que fallaron durante la lectura, detección, "
        "normalización o validación. Cada entrada incluye el dato original, "
        "la fuente detectada, el tipo de error y la descripción del problema."
    ),
)
def list_invalid_records() -> ApiResponse[list[InvalidRecord]]:
    return ApiResponse(success=True, data=store.invalid_records)
