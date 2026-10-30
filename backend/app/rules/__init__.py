"""Reglas y configuraciones centralizadas del dominio."""

from app.rules.estados import PAYPAL_STATUS_MAP, STRIPE_STATUS_MAP
from app.rules.estados_bancarios import BANK_TRANSFER_STATUS_MAP
from app.rules.fechas import DATE_FORMATS
from app.rules.monedas import SUPPORTED_CURRENCIES, ZERO_DECIMAL_CURRENCIES

__all__ = [
    "BANK_TRANSFER_STATUS_MAP",
    "DATE_FORMATS",
    "PAYPAL_STATUS_MAP",
    "STRIPE_STATUS_MAP",
    "SUPPORTED_CURRENCIES",
    "ZERO_DECIMAL_CURRENCIES",
]
