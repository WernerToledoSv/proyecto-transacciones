"""
Endpoint de carga y procesamiento de archivos JSON.

POST /api/v1/upload
  - Acepta uno o varios archivos JSON (multipart/form-data).
  - Procesa cada archivo independientemente.
  - Los resultados se acumulan en el store en memoria.
  - Devuelve un resumen del procesamiento.

Los errores de archivo individual no interrumpen el procesamiento de los demás.
"""
from __future__ import annotations

from fastapi import APIRouter, File, UploadFile, status, HTTPException
from typing import Annotated

from app.models.responses import ApiResponse, ProcessingResponse, FileProcessingResult
from app.services.processing_service import process_file

router = APIRouter(prefix="/upload", tags=["Upload"])

_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB por archivo


@router.post(
    "/",
    response_model=ApiResponse[ProcessingResponse],
    status_code=status.HTTP_200_OK,
    summary="Procesar archivos JSON de transacciones",
    description=(
        "Recibe uno o más archivos JSON con transacciones de diferentes fuentes. "
        "Detecta la fuente, normaliza y valida cada registro. "
        "Los resultados se acumulan en memoria hasta que se limpien con "
        "`DELETE /transactions`."
    ),
)
async def upload_files(
    files: Annotated[list[UploadFile], File(description="Uno o más archivos JSON")],
) -> ApiResponse[ProcessingResponse]:
    if not files:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Se requiere al menos un archivo.",
        )

    file_results: list[FileProcessingResult] = []
    total_valid = 0
    total_invalid = 0

    for upload in files:
        filename = upload.filename or "sin_nombre.json"

        # Validar content-type (advertencia no bloqueante)
        content_type = upload.content_type or ""
        if content_type and "json" not in content_type and "octet-stream" not in content_type:
            # No bloqueamos — el contenido puede ser JSON aunque el tipo sea incorrecto
            pass

        content = await upload.read()

        if len(content) > _MAX_FILE_SIZE_BYTES:
            file_results.append(
                FileProcessingResult(
                    filename=filename,
                    records_found=0,
                    valid=0,
                    invalid=0,
                    errors=[
                        f"El archivo supera el límite de "
                        f"{_MAX_FILE_SIZE_BYTES // (1024*1024)} MB."
                    ],
                )
            )
            continue

        result = process_file(content, filename)
        file_results.append(result)
        total_valid += result.valid
        total_invalid += result.invalid

    return ApiResponse(
        success=True,
        data=ProcessingResponse(
            files=file_results,
            total_valid=total_valid,
            total_invalid=total_invalid,
        ),
    )
