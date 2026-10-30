"""Mapeo de estados para fuentes de pago estándar."""

from app.models.transaction import StatusEnum

STRIPE_STATUS_MAP: dict[str, StatusEnum] = {
    "succeeded": StatusEnum.COMPLETED,
    "pending": StatusEnum.PENDING,
    "failed": StatusEnum.FAILED,
    "refunded": StatusEnum.REFUNDED,
}

PAYPAL_STATUS_MAP: dict[str, StatusEnum] = {
    "completed": StatusEnum.COMPLETED,
    "processed": StatusEnum.COMPLETED,
    "pending": StatusEnum.PENDING,
    "failed": StatusEnum.FAILED,
    "refunded": StatusEnum.REFUNDED,
    "cancelled": StatusEnum.CANCELLED,
    "canceled": StatusEnum.CANCELLED,
}
