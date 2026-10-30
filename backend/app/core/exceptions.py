"""
Jerarquía de excepciones propias del dominio.

Niveles:
  AppError                  — base
  ├── FileError             — problemas al leer/parsear el archivo
  │   ├── EmptyFileError
  │   └── MalformedJSONError
  ├── StructureError        — el JSON es válido pero la estructura no es la esperada
  └── NormalizationError    — error al transformar un registro individual
"""
from __future__ import annotations


class AppError(Exception):
    """Raíz de todos los errores de dominio."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


# ── Errores de archivo ───────────────────────────────────────────────────────

class FileError(AppError):
    """Error relacionado con la lectura o el contenido del archivo."""


class EmptyFileError(FileError):
    """El archivo no contiene datos procesables."""


class MalformedJSONError(FileError):
    """El contenido no es JSON válido."""


# ── Errores de estructura ────────────────────────────────────────────────────

class StructureError(AppError):
    """El JSON es válido pero su estructura es desconocida o inesperada."""


class UnknownSourceError(StructureError):
    """No se pudo identificar la fuente de la transacción."""


# ── Errores de normalización ─────────────────────────────────────────────────

class NormalizationError(AppError):
    """Error al transformar un registro individual."""
