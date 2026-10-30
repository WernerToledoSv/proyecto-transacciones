"""Mapeo de los estados bancarios reconocidos por la aplicación."""

from app.models.transaction import StatusEnum

BANK_TRANSFER_STATUS_MAP: dict[str, StatusEnum] = {
    "ACCP": StatusEnum.COMPLETED,
    "ACSC": StatusEnum.COMPLETED,
    "PDNG": StatusEnum.PENDING,
    "RJCT": StatusEnum.FAILED,
    "REVD": StatusEnum.REFUNDED,
    "CANC": StatusEnum.CANCELLED,
}
