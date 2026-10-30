# Frontend — Panel Administrativo

SPA Angular 18 para el sistema de normalización de transacciones.  
Se comunica con el backend FastAPI en `http://localhost:8000`.

---

## Requisitos

- Node.js 20 o superior
- Angular CLI 18: `npm install -g @angular/cli`

---

## Instalación

```bash
cd frontend
npm install
```

---

## Ejecución en desarrollo

```bash
ng serve
# o
npm start
```

Disponible en `http://localhost:4200`.  
El backend debe estar corriendo en `http://localhost:8000`.

---

## Build de producción

```bash
npm run build:prod
```

Artefacto en `dist/frontend/`.

---

## Configuración de la URL del backend

Edita `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
};
```

Para producción, edita `src/environments/environment.prod.ts`.

---

## Estructura

```
src/app/
├── models/                    # Interfaces TypeScript (contratos JSON)
│   ├── api-response.model.ts
│   └── transaction.model.ts
├── core/services/             # Servicios HTTP (uno por recurso)
│   ├── api.service.ts         # Base: URL, unwrap, manejo de errores
│   ├── upload.service.ts
│   ├── transactions.service.ts
│   ├── metrics.service.ts
│   └── invalid-records.service.ts
├── layouts/                   # Shell del panel (sidebar + topbar)
│   ├── shell/
│   ├── sidebar/
│   └── topbar/
├── shared/                    # Componentes visuales reutilizables
│   ├── stat-card/
│   ├── badge/
│   ├── spinner/
│   ├── empty-state/
│   ├── alert/
│   ├── page-header/
│   └── bar-chart/
└── features/
    ├── dashboard/             # KPIs, gráficos de fuente y estado
    ├── upload/                # Drag & drop, procesamiento de archivos
    ├── transactions/          # Tabla con filtros, paginación y detalle
    └── errors/                # Registros inválidos con datos originales
```

---

## Pantallas

| Ruta             | Descripción                                       |
|------------------|---------------------------------------------------|
| `/dashboard`     | Métricas globales, gráficos por fuente y estado   |
| `/upload`        | Carga de archivos JSON (drag & drop)              |
| `/transactions`  | Tabla filtrable y paginada de transacciones       |
| `/errors`        | Registros que fallaron con tipo y descripción     |

---

## Flujo típico de uso

1. Iniciar el backend: `uvicorn main:app --reload --port 8000`
2. Iniciar el frontend: `ng serve`
3. Ir a `/upload` y subir archivos JSON de ejemplo (carpeta `backend/samples/`)
4. Revisar resultados en `/dashboard`, `/transactions` y `/errors`
