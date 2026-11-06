---
name: transaction-normalization
description: "Úsala para mapear registros de Stripe, PayPal o transferencias bancarias al modelo canónico del proyecto, revisar conversiones de campos o explicar errores de normalización."
---

# Normalización de transacciones

## Objetivo

Guiar tareas que reutilizan los normalizadores existentes por proveedor y producen el `NormalizedTransaction` canónico del proyecto.

## Responsabilidades

- Explicar y mantener los mapeos de campos y las conversiones específicas de cada fuente que ya están implementados.
- Reutilizar el análisis de datos y la conservación de campos compartidos de `BaseNormalizer`.
- Mantener la selección del proveedor en el registro actual de normalizadores y el esquema canónico en el modelo existente.

## Cuándo utilizarla

- Una tarea trata sobre el mapeo de campos de entrada al modelo canónico, la conversión de montos, fechas o estados, `extra_fields` o `NormalizationError`.
- Se modifica o añade un normalizador de fuente siguiendo el patrón actual de integración.

## Archivos relacionados del proyecto

- `backend/app/normalizers/base.py`: contrato del normalizador y utilidades compartidas.
- `backend/app/normalizers/stripe_normalizer.py`: mapeo de Stripe.
- `backend/app/normalizers/paypal_normalizer.py`: mapeo de PayPal.
- `backend/app/normalizers/bank_transfer_normalizer.py`: mapeo de transferencias bancarias.
- `backend/app/normalizers/registry.py`: correspondencia entre fuentes y normalizadores.
- `backend/app/models/transaction.py`: modelo canónico y enums.
- `backend/app/rules/estados.py`, `backend/app/rules/estados_bancarios.py` y `backend/app/rules/fechas.py`: reglas de estados y fechas existentes.
- `backend/app/services/processing_service.py`: invoca la normalización y gestiona sus errores.

## Procedimiento

1. Leer el normalizador del proveedor correspondiente, la clase base, el modelo canónico, las reglas de fechas y estados y el registro.
2. Confirmar las claves de entrada y conversiones a partir de la implementación y los ejemplos existentes; no deducir comportamientos del proveedor que no estén documentados.
3. Seguir los errores de normalización por el servicio de procesamiento hasta el reporte de registros inválidos.
4. Antes de editar, explicar el mapeo y los puntos de integración afectados. Reutilizar utilidades compartidas y conservar en `extra_fields` los campos de origen no reconocidos, según el patrón existente.
5. Comprobar que el normalizador siga devolviendo el modelo canónico existente o genere el error de normalización del proyecto; ejecutar las validaciones disponibles.

## Entradas y salidas

- **Entrada:** un registro sin procesar de una fuente conocida, enviado al normalizador correspondiente.
- **Salida:** `NormalizedTransaction` o `NormalizationError` cuando no sea posible convertir el registro.
- El modelo contiene los campos canónicos `id`, `source`, `amount`, `currency`, `status`, `timestamp` y `extra_fields`.

## Reglas y restricciones

- No crear un flujo de conversión paralelo ni duplicar las utilidades de `BaseNormalizer`.
- No cambiar ni ampliar el modelo de datos canónico, salvo que el usuario lo solicite expresamente.
- Mantener los mapeos reales de cada proveedor; por ejemplo, utilizar la conversión de montos actual en el código, no un formato universal supuesto.
- No confundir la validación de negocio con la normalización; la validación ocurre después.
- No descartar silenciosamente campos de entrada adicionales ni inventar conversiones alternativas.

## Ejemplo

Ante «Agrega compatibilidad con un campo adicional de PayPal», revisar el tratamiento de claves canónicas del normalizador de PayPal y `BaseNormalizer._extra`, explicar primero el mapeo propuesto y después hacer únicamente el cambio solicitado.
