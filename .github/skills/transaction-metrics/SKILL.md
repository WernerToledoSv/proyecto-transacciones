---
name: transaction-metrics
description: "Úsala para explicar, revisar o modificar los cálculos de métricas de transacciones, sus agregaciones, la respuesta de métricas o su presentación en el panel."
---

# Métricas de transacciones

## Objetivo

Guiar tareas sobre los cálculos y la presentación de métricas existentes, sin introducir agregaciones no admitidas ni cambiar implícitamente la forma de las respuestas.

## Responsabilidades

- Explicar cómo se calculan los totales y las dimensiones de agrupación actuales.
- Seguir el recorrido de las métricas desde el almacenamiento en memoria hasta el calculador y la respuesta de la API.
- Mantener los cálculos coherentes con el modelo de respuesta y el tratamiento actual de monedas.

## Cuándo utilizarla

- Una tarea trata sobre el total de registros recibidos, válidos o inválidos; montos por moneda; conteos por fuente o estado; o la presentación de métricas.
- Se pregunta cómo se obtiene un valor mostrado en el panel.

## Archivos relacionados del proyecto

- `backend/app/metrics/calculator.py`: lógica de cálculo.
- `backend/app/models/responses.py`: `MetricsResponse`.
- `backend/app/api/metrics.py`: endpoint y datos obtenidos del almacenamiento.
- `backend/app/services/store.py`: transacciones y contadores en memoria.
- `frontend/src/app/features/dashboard/dashboard.component.ts`: presentación actual de métricas.
- `frontend/src/app/core/services/metrics.service.ts` y `frontend/src/app/models/transaction.model.ts`: servicio de API y tipo del frontend.

## Procedimiento

1. Inspeccionar el calculador, el modelo de respuesta, el endpoint y, cuando corresponda, el consumidor del frontend.
2. Verificar en el código qué registros se incluyen, las claves exactas de agrupación y el redondeo aplicado.
3. Explicar que los montos se mantienen agrupados por moneda; nunca sumar monedas distintas.
4. Para cambios solicitados en métricas, describir el cálculo y sus efectos en la respuesta o la interfaz antes de editar.
5. Mantener coherentes los tipos y la respuesta de backend y frontend si ambos están dentro del alcance; de lo contrario, no modificar capas no solicitadas.

## Entradas y salidas

- **Entradas:** las transacciones normalizadas válidas actuales y los conteos de registros recibidos e inválidos suministrados por el endpoint de métricas.
- **Salida:** `MetricsResponse` con totales de recibidas, válidas e inválidas; montos por moneda; y conteos por fuente y estado.

## Reglas y restricciones

- No inventar métricas, tasas, interpretaciones ni significados de negocio ausentes en la implementación.
- No sumar valores de monedas diferentes.
- No confundir errores a nivel de archivo con los contadores de registros recibidos o inválidos, salvo que el código lo haga explícitamente.
- No cambiar los contratos del endpoint ni de la respuesta sin autorización expresa.

## Ejemplo

Ante «Explica por qué el panel muestra un monto separado para cada moneda», seguir `get_metrics()` hasta `compute_metrics()` y la presentación de `amount_by_currency` en el panel. Describir el comportamiento existente sin cambiarlo.
