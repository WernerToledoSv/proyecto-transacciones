"""Catálogo central de monedas soportadas por la aplicación."""

SUPPORTED_CURRENCIES = {
    "AED", "ARS", "AUD", "BBD", "BDT", "BMD", "BOB", "BRL", "BZD", "CAD",
    "CHF", "CLP", "CNY", "COP", "CRC", "DKK", "DOP", "EUR", "GBP", "GTQ",
    "HKD", "HNL", "JPY", "KRW", "MXN", "NIO", "NOK", "NZD", "PEN", "PYG",
    "SEK", "SGD", "THB", "TTD", "USD", "UYU", "VND", "ZAR",
}

# Monedas sin centavos (ejemplos comunes). Se usa para decisiones futuras de
# normalización de importes cuando la fuente envía valores sin fracciones.
ZERO_DECIMAL_CURRENCIES = {"CLP", "JPY", "KRW", "VND"}
