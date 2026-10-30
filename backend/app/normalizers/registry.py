"""
Registro central de normalizadores.

Asocia cada SourceType con su normalizador correspondiente.
Para agregar una fuente nueva, importarla aquí y registrarla en _REGISTRY.
"""
from __future__ import annotations

from app.models.transaction import SourceType
from app.normalizers.base import BaseNormalizer
from app.normalizers.stripe_normalizer import StripeNormalizer
from app.normalizers.paypal_normalizer import PaypalNormalizer
from app.normalizers.bank_transfer_normalizer import BankTransferNormalizer

_REGISTRY: dict[SourceType, BaseNormalizer] = {
    SourceType.STRIPE: StripeNormalizer(),
    SourceType.PAYPAL: PaypalNormalizer(),
    SourceType.BANK_TRANSFER: BankTransferNormalizer(),
}


def get_normalizer(source: SourceType) -> BaseNormalizer | None:
    """
    Devuelve el normalizador para la fuente indicada, o None si no existe.
    """
    return _REGISTRY.get(source)
