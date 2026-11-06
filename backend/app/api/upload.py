"""
Endpoint HTTP de carga de archivos JSON.

Esta capa se ocupa de recibir archivos, aplicar el límite de carga configurado
y delegar el procesamiento al servicio de aplicación.
"""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.models.responses import ApiResponse, FileProcessingResult, ProcessingResponse
from app.services.processing_service import process_file

router = APIRouter(prefix="/upload", tags=["Upload"])


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
        content = await upload.read()

        if len(content) > settings.max_upload_file_size_bytes:
            file_results.append(
                FileProcessingResult(
                    filename=filename,
                    records_found=0,
                    valid=0,
                    invalid=0,
                    errors=[
                        "El archivo supera el límite de "
                        f"{settings.max_upload_file_size_mb} MB."
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
