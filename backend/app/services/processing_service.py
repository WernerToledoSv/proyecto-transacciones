"""
Orquestador del procesamiento de archivos.

Responsabilidades:
  1. Leer y validar la estructura del archivo.
  2. Delegar cada registro al procesador especializado.
  3. Persistir los resultados en el store.
  4. Construir el resumen del archivo.

La lógica de detección, normalización y validación vive en record_processor.py.
"""
from __future__ import annotations

from app.core.exceptions import AppError, FileError
from app.models.responses import FileProcessingResult
from app.readers.json_reader import parse_bytes
from app.services.record_processor import process_record
from app.services.store import store


def process_file(content: bytes, filename: str) -> FileProcessingResult:
    """Procesa un archivo JSON y almacena los resultados de sus registros."""
    result = FileProcessingResult(
        filename=filename,
        records_found=0,
        valid=0,
        invalid=0,
    )

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

    for raw in records:
        outcome = process_record(raw)

        if outcome.is_valid:
            store.add_transaction(outcome.transaction)
            result.valid += 1
        else:
            store.add_invalid(outcome.invalid_record)
            result.invalid += 1

    return result
