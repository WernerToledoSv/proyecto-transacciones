"""
Procesamiento aislado de un registro de transacción.

Este módulo contiene la lógica de detección, normalización y validación.
No lee archivos ni escribe en el almacenamiento: devuelve un resultado
que la capa de orquestación decide cómo persistir.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.core.exceptions import NormalizationError
from app.detectors.source_detector import detect_source
from app.models.responses import InvalidRecord
from app.models.transaction import NormalizedTransaction, SourceType
from app.normalizers.registry import get_normalizer
from app.validators.transaction_validator import validate


@dataclass(frozen=True)
class RecordProcessingOutcome:
    """Resultado de procesar un registro, válido o inválido."""

    transaction: NormalizedTransaction | None = None
    invalid_record: InvalidRecord | None = None

    @property
    def is_valid(self) -> bool:
        return self.transaction is not None


def process_record(raw: dict[str, Any]) -> RecordProcessingOutcome:
    """
    Detecta, normaliza y valida un registro sin modificar el almacenamiento.

    La función puede reutilizarse desde distintos flujos de entrada
    (archivos, endpoints u otros procesos) porque no depende de FastAPI
    ni del singleton del store.
    """
    source = detect_source(raw)

    if source == SourceType.UNKNOWN:
        return _invalid(
            raw=raw,
            source_hint="unknown",
            error_type="UnknownSource",
            detail=(
                "No se pudo identificar la fuente del registro. "
                "Las claves presentes no coinciden con ninguna fuente registrada."
            ),
        )

    normalizer = get_normalizer(source)
    if normalizer is None:
        return _invalid(
            raw=raw,
            source_hint=source.value,
            error_type="MissingNormalizer",
            detail=f"Fuente '{source.value}' detectada pero sin normalizador registrado.",
        )

    try:
        transaction = normalizer.normalize(raw)
    except NormalizationError as exc:
        return _invalid(
            raw=raw,
            source_hint=source.value,
            error_type="NormalizationError",
            detail=exc.message,
        )
    except Exception as exc:  # pylint: disable=broad-except
        return _invalid(
            raw=raw,
            source_hint=source.value,
            error_type="UnexpectedError",
            detail=f"Error inesperado durante la normalización: {exc!s}",
        )

    validation = validate(transaction)
    if not validation.is_valid:
        return _invalid(
            raw=raw,
            source_hint=source.value,
            error_type="ValidationError",
            detail="; ".join(validation.errors),
        )

    return RecordProcessingOutcome(transaction=transaction)


def _invalid(
    raw: dict[str, Any],
    source_hint: str,
    error_type: str,
    detail: str,
) -> RecordProcessingOutcome:
    """Construye el resultado inválido sin persistirlo."""
    return RecordProcessingOutcome(
        invalid_record=InvalidRecord(
            raw=raw,
            source_hint=source_hint,
            error_type=error_type,
            error_detail=detail,
        )
    )
