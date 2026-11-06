---
name: source-detection
description: "Úsala para investigar, ampliar o explicar cómo se identifican registros de transacciones de Stripe, PayPal o transferencias bancarias, incluidas las fuentes desconocidas y las firmas de detección."
---

# Detección de fuentes

## Objetivo

Trabajar con la detección de fuentes existente en el proyecto. No implementar un segundo detector ni suponer que se admiten fuentes fuera de las firmas registradas.

## Responsabilidades

- Revisar cómo se comparan las claves del registro sin procesar con las firmas de fuentes registradas.
- Explicar las firmas de Stripe, PayPal y transferencias bancarias, así como el resultado `UNKNOWN`.
- Si se solicitan cambios, modificar el flujo de detección existente y sus registros relacionados únicamente cuando corresponda.

## Cuándo utilizarla

- Una tarea trata sobre identificar fuentes, campos de firmas, registros no reconocidos o agregar un proveedor de transacciones.
- Se necesita explicar la detección como parte del flujo de procesamiento.

## Archivos relacionados del proyecto

- `backend/app/detectors/source_detector.py`: firmas, `detect_source` y nombres de las fuentes registradas.
- `backend/app/models/transaction.py`: `SourceType`.
- `backend/app/services/processing_service.py`: invoca la detección y gestiona las fuentes desconocidas.
- `backend/app/normalizers/registry.py`: asigna normalizadores a las fuentes conocidas.
- `backend/samples/`: registros de ejemplo para las fuentes existentes.

## Procedimiento

1. Antes de proponer cambios, leer el detector, el enum de fuentes, el servicio de procesamiento y los ejemplos pertinentes.
2. Confirmar los nombres exactos de los campos y las reglas de coincidencia en el código; no inferir la fuente a partir de valores o indicios no documentados.
3. Seguir el resultado de la detección hasta la selección del normalizador y el reporte de registros inválidos.
4. Si la tarea amplía las fuentes admitidas, explicar los puntos de integración existentes afectados antes de editar. Mantener el comportamiento para fuentes desconocidas, salvo que el usuario apruebe un cambio.
5. Validar únicamente el comportamiento solicitado con las pruebas o comprobaciones disponibles; no afirmar que existen pruebas si no las hay.

## Entradas y salidas

- **Entrada:** un registro de transacción sin procesar (`dict[str, Any]`).
- **Salida:** un `SourceType` existente (`STRIPE`, `PAYPAL`, `BANK_TRANSFER` o `UNKNOWN`).
- La detección no normaliza ni valida el registro.

## Reglas y restricciones

- El detector es la fuente de verdad para las firmas; no duplicar su lógica en normalizadores, rutas de API ni Skills.
- No asumir que una firma parcial es suficiente: seguir la comprobación de subconjunto implementada en `source_detector.py`.
- No cambiar el modelo canónico, los contratos de API ni la arquitectura de ejecución para expresar instrucciones.
- No agregar proveedores ni firmas a menos que la tarea lo solicite explícitamente.

## Ejemplo

Ante «¿Por qué este registro se clasifica como fuente desconocida?», comparar sus claves con las firmas de `source_detector.py` y seguir el manejo de `UNKNOWN` en `processing_service.py`. Describir lo que hace el código sin ampliar la firma de forma implícita.
