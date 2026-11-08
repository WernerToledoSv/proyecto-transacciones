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
├── .github/
│   ├── agents/
│   │   └── transaction-coordinator.agent.md  # Agente Coordinador de Transacciones
│   └── skills/
│       ├── project-change-documentation/     # Documentación de cambios
│       ├── source-detection/                  # Detección de fuentes
│       ├── transaction-analysis/              # Análisis de transacciones
│       ├── transaction-metrics/               # Métricas de transacciones
│       ├── transaction-normalization/         # Normalización de transacciones
│       └── transaction-validation/            # Validación de transacciones
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

### Implementación de la actividad

- **Skills y agente personalizado:** agregados directamente en `main`, commit [`36a8e26`](https://github.com/WernerToledoSv/proyecto-transacciones/commit/36a8e26c9a71c24cd65653160b4e8d175d4b506f); no se utilizó PR para este cambio.
- **Refactorización y pruebas:** desarrolladas en `refactor/separacion-pipeline-procesamiento` y fusionadas a `main` mediante el [PR #1](https://github.com/WernerToledoSv/proyecto-transacciones/pull/1).
- Se separó el procesamiento por registro de la orquestación de archivos, se centralizó la configuración y se crearon seis Skills especializadas coordinadas por el agente personalizado.

---

## 2. Ejecución del backend

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

### Iniciar el servidor

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

**Puedes cargar estos archivos directamente desde el frontend**, sin necesidad de utilizar Swagger ni enviar la petición manualmente:

1. Inicia el backend y el frontend siguiendo los pasos de instalación y ejecución.
2. Abre la aplicación en [`http://localhost:4200`](http://localhost:4200).
3. En el menú lateral, entra en **Cargar archivos** (ruta `/upload`).
4. Selecciona los archivos de `backend/samples/` desde tu equipo o arrástralos al área de carga.
5. Haz clic en **Procesar archivos**. La pantalla mostrará el resumen de transacciones válidas e inválidas y el resultado de cada archivo.

La vista **Cargar archivos** permite seleccionar o arrastrar varios archivos `.json` o `.txt` con contenido en formato JSON, con un límite de 10 MB por archivo.

También puedes utilizar Swagger en `http://localhost:8000/docs` y el endpoint `POST /api/v1/upload/` si deseas probar la API directamente.

**Nota:** los archivos con ejemplos inválidos están destinados a probar las validaciones; por ello, algunos registros pueden ser rechazados o reportados como inválidos.

---

## 3. Frontend

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

## 4. Flujo principal

El backend procesa cada registro en esta secuencia:

1. Detecta la fuente del dato.
2. Normaliza el registro a un formato canónico.
3. Valida la transacción ya normalizada.
4. Guarda el resultado en memoria.
5. Calcula métricas por moneda, estado y fuente.

---

## 5. Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/upload/` | Subir uno o varios archivos JSON |
| GET | `/api/v1/transactions/` | Listar transacciones |
| GET | `/api/v1/transactions/{id}` | Buscar una transacción por ID |
| GET | `/api/v1/metrics/` | Obtener métricas agregadas |
| GET | `/api/v1/invalid/` | Listar registros inválidos |
| DELETE | `/api/v1/transactions/` | Limpiar el almacenamiento en memoria |

---

## 6. Variables de entorno

| Archivo | Descripción |
|---------|-------------|
| `backend/.env.example` | Plantilla de entorno para el backend |
| `backend/.env` | Variables activas locales |

---

## 7. Tecnologías principales

- FastAPI
- Pydantic v2
- Uvicorn
- Angular 18
- Tailwind CSS
- Python 3.12

---

## 8. Personalización de GitHub Copilot

El proyecto incluye seis Skills especializadas. Cada una contiene instrucciones para ayudar a GitHub Copilot Chat a realizar una tarea concreta respetando la arquitectura del proyecto:

| Skill | Descripción |
|-------|-------------|
| `source-detection` | Identifica el origen de las transacciones, como Stripe, PayPal o transferencias bancarias. |
| `transaction-normalization` | Guía la conversión de los datos de cada proveedor al formato común del sistema. |
| `transaction-validation` | Define cómo comprobar que una transacción cumpla las reglas y requisitos del proyecto. |
| `transaction-metrics` | Orienta el cálculo y la explicación de métricas y agrupaciones de transacciones. |
| `transaction-analysis` | Ayuda a interpretar resultados, registros inválidos y resúmenes del procesamiento. |
| `project-change-documentation` | Guía la revisión de cambios y la actualización de la documentación del proyecto. |

### Agente Coordinador de Transacciones

El agente personalizado **Coordinador de Transacciones** (`.github/agents/transaction-coordinator.agent.md`) actúa como punto de entrada para las tareas relacionadas con el procesamiento. Analiza la solicitud y selecciona las Skills necesarias para orientar el trabajo de Copilot, evitando concentrar todas las instrucciones en un único agente.

Las Skills y el agente son configuraciones de GitHub Copilot Chat; no son agentes ejecutables dentro del backend. Sus archivos se encuentran en [`.github/skills/`](.github/skills/) y [`.github/agents/`](.github/agents/).

---

## 9. Refactorización del procesamiento

Se separó el procesamiento individual de cada transacción de la orquestación del archivo:

- `backend/app/services/record_processor.py`: detecta, normaliza y valida un registro sin guardar datos.
- `backend/app/services/processing_service.py`: coordina la lectura del archivo, delega los registros y almacena los resultados.
- `backend/app/api/upload.py`: recibe archivos y aplica el límite de tamaño configurado.
- `backend/app/core/config.py`: centraliza el límite mediante `MAX_UPLOAD_FILE_SIZE_MB`.

Esta separación permite mantener la lógica de cada registro independiente de la lectura de archivos y del almacenamiento.

---

## 10. Pruebas unitarias

Como parte de la refactorización se agregó `backend/tests/test_record_processor.py`, con cinco pruebas unitarias para comprobar el comportamiento de `record_processor.py` de forma independiente. Se verifican los casos de fuente desconocida, ausencia de normalizador, error de normalización, error de validación y procesamiento exitoso sin persistencia directa.

### Cómo ejecutar las pruebas

Abre una terminal en la carpeta raíz del proyecto y ejecuta:

```powershell
cd backend

# Activar el entorno virtual (si ya fue creado)
.\.venv\Scripts\Activate.ps1

# Ejecutar todas las pruebas unitarias
python -m unittest discover -s tests -v
```

Si todavía no has creado el entorno virtual, puedes prepararlo e instalar las dependencias antes de ejecutar las pruebas:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m unittest discover -s tests -v
```

La opción `-v` muestra el nombre y el resultado de cada prueba. Si todas finalizan correctamente, al final aparecerá `OK`.

---

## 11. Referencias

- Backend: [backend/README.md](backend/README.md)
- Archivos de ejemplo: [backend/samples/](backend/samples/)
- Código del proyecto: [backend/](backend)
- Frontend: [frontend/](frontend)
