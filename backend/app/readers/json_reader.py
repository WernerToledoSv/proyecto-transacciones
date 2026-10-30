"""
Lector de archivos JSON.

Responsabilidades:
  - Leer bytes crudos y decodificarlos.
  - Parsear el JSON.
  - Normalizar la raíz: acepta un objeto raíz {"transactions": [...]}
    o directamente un arreglo [...].
  - Elevar excepciones de dominio (EmptyFileError, MalformedJSONError,
    StructureError) para que la capa superior decida cómo registrarlas.

Lo que NO hace:
  - Validar el contenido individual de cada transacción (eso es responsabilidad
    de validators/).
  - Detectar la fuente (eso es responsabilidad de detectors/).
"""
from __future__ import annotations

import json
from typing import Any

from app.core.exceptions import EmptyFileError, MalformedJSONError, StructureError


def parse_bytes(content: bytes, filename: str = "<bytes>") -> list[dict[str, Any]]:
    """
    Parsea `content` (bytes UTF-8) y devuelve la lista de registros crudos.

    Formatos aceptados:
      - Array JSON directo:          [{ ... }, { ... }]
      - Objeto con clave estándar:   {"transactions": [{ ... }]}
      - Objeto con clave genérica:   {"data": [{ ... }]}

    Raises:
      EmptyFileError      — contenido vacío o solo espacios en blanco.
      MalformedJSONError  — el contenido no es JSON válido.
      StructureError      — JSON válido pero con estructura no reconocida.
    """
    if not content or not content.strip():
        raise EmptyFileError(f"El archivo '{filename}' está vacío.")

    try:
        parsed: Any = json.loads(content)
    except json.JSONDecodeError as exc:
        raise MalformedJSONError(
            f"El archivo '{filename}' contiene JSON mal formado: {exc.msg} "
            f"(línea {exc.lineno}, columna {exc.colno})."
        ) from exc

    records = _extract_records(parsed, filename)

    if len(records) == 0:
        raise EmptyFileError(
            f"El archivo '{filename}' es válido pero no contiene registros."
        )

    return records


def _extract_records(parsed: Any, filename: str) -> list[dict[str, Any]]:
    """
    Extrae la lista de registros de la raíz del JSON.

    Acepta:
      list  → directamente los registros
      dict  → busca las claves conocidas en orden: "transactions", "data", "records"
    """
    if isinstance(parsed, list):
        _assert_list_of_dicts(parsed, filename)
        return parsed

    if isinstance(parsed, dict):
        for key in ("transactions", "data", "records"):
            if key in parsed and isinstance(parsed[key], list):
                _assert_list_of_dicts(parsed[key], filename)
                return parsed[key]

        raise StructureError(
            f"El archivo '{filename}' es un objeto JSON pero no contiene ninguna "
            "de las claves reconocidas: 'transactions', 'data', 'records'."
        )

    raise StructureError(
        f"El archivo '{filename}' tiene una estructura no reconocida "
        f"(tipo raíz: {type(parsed).__name__})."
    )


def _assert_list_of_dicts(items: list[Any], filename: str) -> None:
    """Verifica que todos los elementos de la lista sean objetos."""
    for i, item in enumerate(items):
        if not isinstance(item, dict):
            raise StructureError(
                f"El archivo '{filename}': el elemento en el índice {i} no es un "
                f"objeto JSON (tipo: {type(item).__name__})."
            )
