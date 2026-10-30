"""
Servicio de procesamiento de archivos.

Coordina el pipeline completo para un archivo:
  read → detect → normalize → validate → store

Manejo de errores:
  - Errores de archivo (vacío, JSON inválido, estructura): se registran como
    FileProcessingResult.errors y no se procesan más registros del archivo.
  - Errores por registro (normalización, validación): se registran como
    InvalidRecord y se continúa con el siguiente registro.
"""
from __future__ import annotations

from typing import Any

from app.core.exceptions import (
    AppError, FileError, NormalizationError,
)
from app.detectors.source_detector import detect_source
from app.models.responses import FileProcessingResult, InvalidRecord
from app.models.transaction import SourceType
from app.normalizers.registry import get_normalizer
from app.readers.json_reader import parse_bytes
from app.services.store import store
from app.validators.transaction_validator import validate


def process_file(content: bytes, filename: str) -> FileProcessingResult:
    """
    Procesa un archivo JSON completo y almacena los resultados.

    Returns:
      FileProcessingResult — resumen del procesamiento de este archivo.
    """
    result = FileProcessingResult(
        filename=filename,
        records_found=0,
        valid=0,
        invalid=0,
    )

    # ── 1. Lectura ────────────────────────────────────────────────────────────
    try:
        records = parse_bytes(content, filename)
    except FileError as exc:
        result.errors.append(f"[archivo] {exc.message}")
        return result
    except AppError as exc:
        result.errors.append(f"[estructura] {exc.message}")
        return result

    result.records_found = len(records)
    store.increment_received(len(records))

    # ── 2. Procesamiento registro a registro ──────────────────────────────────
    for raw in records:
        _process_record(raw, result)

    return result


def _process_record(raw: dict[str, Any], result: FileProcessingResult) -> None:
    """Procesa un único registro: detección → normalización → validación."""

    # Detección de fuente
    source = detect_source(raw)

    if source == SourceType.UNKNOWN:
        _record_invalid(
            raw=raw,
            source_hint="unknown",
            error_type="UnknownSource",
            detail=(
                "No se pudo identificar la fuente del registro. "
                "Las claves presentes no coinciden con ninguna fuente registrada."
            ),
            result=result,
        )
        return

    # Normalización
    normalizer = get_normalizer(source)
    if normalizer is None:
        _record_invalid(
            raw=raw,
            source_hint=source.value,
            error_type="MissingNormalizer",
            detail=f"Fuente '{source.value}' detectada pero sin normalizador registrado.",
            result=result,
        )
        return

    try:
        tx = normalizer.normalize(raw)
    except NormalizationError as exc:
        _record_invalid(
            raw=raw,
            source_hint=source.value,
            error_type="NormalizationError",
            detail=exc.message,
            result=result,
        )
        return
    except Exception as exc:  # pylint: disable=broad-except
        _record_invalid(
            raw=raw,
            source_hint=source.value,
            error_type="UnexpectedError",
            detail=f"Error inesperado durante la normalización: {exc!s}",
            result=result,
        )
        return

    # Validación de negocio
    validation = validate(tx)
    if not validation.is_valid:
        _record_invalid(
            raw=raw,
            source_hint=source.value,
            error_type="ValidationError",
            detail="; ".join(validation.errors),
            result=result,
        )
        return

    # Registro exitoso
    store.add_transaction(tx)
    result.valid += 1


def _record_invalid(
    raw: dict[str, Any],
    source_hint: str,
    error_type: str,
    detail: str,
    result: FileProcessingResult,
) -> None:
    store.add_invalid(
        InvalidRecord(
            raw=raw,
            source_hint=source_hint,
            error_type=error_type,
            error_detail=detail,
        )
    )
    result.invalid += 1
