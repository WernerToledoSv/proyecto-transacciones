---
name: transaction-validation
description: "Úsala para revisar o modificar la validación de transacciones, detectar valores obligatorios ausentes, verificar restricciones del modelo canónico o explicar errores de las reglas de negocio."
---

# Validación de transacciones

## Objetivo

Aplicar y explicar las capas de validación existentes sin duplicar reglas ni confundir la conversión de datos con la validación de negocio.

## Responsabilidades

- Distinguir las restricciones del modelo Pydantic de las comprobaciones de negocio posteriores a la normalización.
- Explicar `ValidationResult` y cómo sus errores se convierten en detalles de registros inválidos.
- Guiar cambios a las reglas de validación existentes únicamente cuando se soliciten.

## Cuándo utilizarla

- Una tarea trata sobre valores obligatorios o mal formados, errores de validación, monedas admitidas, montos o marcas de tiempo.
- Se necesita rastrear por qué se aceptó o rechazó una transacción normalizada.

## Archivos relacionados del proyecto

- `backend/app/validators/transaction_validator.py`: reglas de negocio y `ValidationResult`.
- `backend/app/models/transaction.py`: restricciones de campos Pydantic y normalización de moneda.
- `backend/app/rules/monedas.py`: catálogo de monedas admitidas.
- `backend/app/services/processing_service.py`: ejecuta la validación y registra transacciones inválidas.
- `backend/app/models/responses.py`: estructura de respuesta de registros inválidos.

## Procedimiento

1. Identificar si el problema ocurre al construir el modelo Pydantic, en el validador de negocio o antes, durante la normalización.
2. Leer la restricción pertinente y quién la invoca antes de describir o cambiar el comportamiento.
3. Confirmar las reglas actuales exactas: ID no vacío; monto no negativo y monto positivo para estados activos; moneda de tres letras mayúsculas incluida en el catálogo admitido; marca de tiempo como máximo 365 días en el futuro.
4. Explicar el flujo de rechazo existente y la representación del error.
5. Antes de cualquier edición solicitada, indicar su impacto y conservar el contrato de respuesta actual. Ejecutar las comprobaciones específicas disponibles.

## Entradas y salidas

- **Entrada:** normalmente un `NormalizedTransaction`; Pydantic también valida los valores durante la construcción del modelo.
- **Salida:** la construcción Pydantic se completa o genera un error de validación; la validación de negocio devuelve `ValidationResult` con `is_valid` y `errors`.

## Reglas y restricciones

- No añadir reglas de validación basadas en suposiciones sobre datos de proveedores o intenciones del usuario.
- No duplicar las restricciones del modelo en el validador de negocio, ni viceversa, sin un comportamiento solicitado que lo justifique.
- No presentar errores de normalización como errores de validación de negocio.
- Mantener los detalles de error explícitos y coherentes con el reporte existente de registros inválidos.
- No alterar los contratos de API ni el modelo canónico, salvo que se solicite expresamente.

## Ejemplo

Ante «¿Por qué se rechazó esta transacción?», revisar en orden la conversión al modelo canónico, las restricciones Pydantic y las comprobaciones de `validate()`. Identificar la etapa exacta que falló y el detalle de error existente.
