---
name: transaction-analysis
description: "Úsala para explicar resultados del procesamiento, resumir registros válidos e inválidos, interpretar métricas existentes o rastrear resultados visibles en la interfaz."
---

# Análisis de transacciones

## Objetivo

Generar explicaciones claras basadas en los resultados y contratos existentes del proyecto. Es un flujo de trabajo del asistente de programación, no una función de análisis con IA en el backend.

## Responsabilidades

- Rastrear y explicar resúmenes de procesamiento por archivo, detalles de registros inválidos y métricas existentes.
- Distinguir errores de archivo o estructura de errores por registro en detección, normalización y validación.
- Relacionar los campos de respuesta del backend con su presentación actual en Angular cuando ayude a responder.

## Cuándo utilizarla

- Se pregunta qué significan los resultados del procesamiento, por qué se rechazaron registros o cómo se muestran los resultados en la interfaz.
- Se solicita un resumen basado en datos de respuesta o código existente.

## Archivos relacionados del proyecto

- `backend/app/services/processing_service.py`: flujo de procesamiento por archivo y registro.
- `backend/app/models/responses.py`: estructuras de respuesta del procesamiento, registros inválidos y métricas.
- `backend/app/api/upload.py`, `backend/app/api/invalid_records.py` y `backend/app/api/metrics.py`: endpoints que exponen resultados.
- `backend/app/core/exceptions.py` y `backend/app/readers/json_reader.py`: errores de archivo y estructura.
- `frontend/src/app/features/upload/upload.component.ts`: resúmenes de carga.
- `frontend/src/app/features/errors/errors.component.ts`: presentación de registros inválidos.
- `frontend/src/app/features/dashboard/dashboard.component.ts`: presentación de métricas.

## Procedimiento

1. Identificar el origen del resultado e inspeccionar su modelo y el código que lo produce; usar datos reales de respuesta si el usuario los proporciona.
2. Seguir el orden del procesamiento: lectura, detección, normalización, validación y almacenamiento de registros válidos; distinguir los errores tempranos de archivo.
3. Explicar los conteos y errores utilizando los campos y el comportamiento exactos de la respuesta.
4. Si el resumen incluye métricas, usar la Skill de métricas existente y evitar totales entre monedas o afirmaciones causales no respaldadas.
5. Indicar la incertidumbre si no se proporcionaron datos ni resultados de ejecución; no inventar resultados observados.

## Entradas y salidas

- **Entradas:** respuestas de procesamiento, registros inválidos, respuestas de métricas o código fuente que describa cómo se generan esos resultados.
- **Salida:** una explicación concisa y comprensible, vinculada a los campos de resultado y las etapas existentes.

## Reglas y restricciones

- No agregar comportamiento de LLM en tiempo de ejecución, agentes autónomos en el backend ni nuevos endpoints de análisis.
- No afirmar que se procesaron datos o se observaron resultados si no se proporcionaron o ejecutaron.
- No inferir causas de un error más allá de los detalles registrados y el flujo de código verificado.
- No modificar el comportamiento del frontend ni los contratos de API, salvo que el usuario solicite explícitamente ese cambio.

## Ejemplo

Ante «Resume esta respuesta de carga», agrupar los registros según los conteos válidos e inválidos y los errores por archivo realmente indicados. Explicar las categorías sin inventar detalles de transacciones.
