# proyecto-transacciones

Aplicación full-stack para gestionar transacciones financieras detectadas desde múltiples fuentes.

| Capa | Tecnología | Puerto |
|------|------------|--------|
| Frontend | Angular 18 + Tailwind 3 | 4200 |
| Backend | Python 3.12 + FastAPI | 8000 |

---

## Estructura del proyecto

```text
proyecto-transacciones/
├── backend/                  # API REST con FastAPI
│   ├── app/
│   │   ├── api/              # Endpoints HTTP
│   │   ├── core/             # Excepciones y utilidades base
│   │   ├── detectors/        # Detección de la fuente del registro
│   │   ├── metrics/          # Cálculo de métricas
│   │   ├── models/           # Modelos canónicos y enums
│   │   ├── normalizers/      # Normalización por proveedor
│   │   ├── rules/            # Reglas de moneda, fechas y estados
│   │   ├── services/         # Procesamiento y almacenamiento en memoria
│   │   └── validators/       # Validaciones del dominio
│   ├── samples/              # Datos de ejemplo para probar la carga
│   ├── main.py               # Punto de entrada del backend
│   ├── requirements.txt      # Dependencias de Python
│   ├── .env.example          # Variables de entorno
│   └── README.md             # Documentación del backend
├── frontend/                 # SPA Angular
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── ...
├── .gitignore
├── README.md
└── package-lock.json
```

---

## 1. Backend

### Requisitos

- Python 3.12 o superior

### Instalación

```powershell
cd C:\Users\USER\Desktop\proyecto-transacciones\backend

python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt

if (Test-Path .env.example) {
    Copy-Item .env.example .env
}
```

### Ejecución

```powershell
cd C:\Users\USER\Desktop\proyecto-transacciones\backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API base: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Archivos de ejemplo (samples)

La carpeta [`backend/samples/`](backend/samples/) contiene archivos de ejemplo en formato JSON y TXT que sirven para probar la carga y el procesamiento de transacciones desde distintas fuentes.

Incluye ejemplos de transferencias bancarias, PayPal, Stripe, transacciones mixtas y datos sin estructurar. También contiene registros inválidos para comprobar el funcionamiento de las validaciones.

Para utilizarlos:

1. Inicia el backend.
2. Abre Swagger en `http://localhost:8000/docs` o utiliza directamente el endpoint `POST /api/v1/upload/`.
3. Selecciona uno o varios archivos de `backend/samples/` para cargarlos y probar el procesamiento.

**Nota:** los archivos con ejemplos inválidos están destinados a probar las validaciones; por ello, algunos registros pueden ser rechazados o reportados como inválidos.

---

## 2. Frontend

### Requisitos

- Node.js 20 o superior
- npm

### Instalación

```powershell
cd C:\Users\USER\Desktop\proyecto-transacciones\frontend
npm install
```

### Ejecución

```powershell
cd C:\Users\USER\Desktop\proyecto-transacciones\frontend
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

### Build de producción

```powershell
cd C:\Users\USER\Desktop\proyecto-transacciones\frontend
npm run build:prod
```

---

## 3. Flujo principal

El backend procesa cada registro en esta secuencia:

1. Detecta la fuente del dato.
2. Normaliza el registro a un formato canónico.
3. Valida la transacción ya normalizada.
4. Guarda el resultado en memoria.
5. Calcula métricas por moneda, estado y fuente.

---

## 4. Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/upload/` | Subir uno o varios archivos JSON |
| GET | `/api/v1/transactions/` | Listar transacciones |
| GET | `/api/v1/transactions/{id}` | Buscar una transacción por ID |
| GET | `/api/v1/metrics/` | Obtener métricas agregadas |
| GET | `/api/v1/invalid/` | Listar registros inválidos |
| DELETE | `/api/v1/transactions/` | Limpiar el almacenamiento en memoria |

---

## 5. Variables de entorno

| Archivo | Descripción |
|---------|-------------|
| `backend/.env.example` | Plantilla de entorno para el backend |
| `backend/.env` | Variables activas locales |

---

## 6. Tecnologías principales

- FastAPI
- Pydantic v2
- Uvicorn
- Angular 18
- Tailwind CSS
- Python 3.12

---

## 7. Referencias

- Backend: [backend/README.md](backend/README.md)
- Archivos de ejemplo: [backend/samples/](backend/samples/)
- Código del proyecto: [backend/](backend)
- Frontend: [frontend/](frontend)

