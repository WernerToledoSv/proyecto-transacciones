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

## 7. Personalización de GitHub Copilot

El proyecto incluye Skills para detección de fuentes, normalización, validación, métricas, análisis y documentación de cambios, además del agente personalizado **Coordinador de Transacciones**. Estas instrucciones ayudan a Copilot Chat a trabajar con la arquitectura existente; no agregan agentes ejecutables al backend.

Los archivos de configuración están en [`.github/skills/`](.github/skills/) y [`.github/agents/`](.github/agents/).

---

## 8. Refactorización del procesamiento

Se separó el procesamiento individual de cada transacción de la orquestación del archivo:

- `backend/app/services/record_processor.py`: detecta, normaliza y valida un registro sin guardar datos.
- `backend/app/services/processing_service.py`: coordina la lectura del archivo, delega los registros y almacena los resultados.
- `backend/app/api/upload.py`: recibe archivos y aplica el límite de tamaño configurado.
- `backend/app/core/config.py`: centraliza el límite mediante `MAX_UPLOAD_FILE_SIZE_MB`.

Se agregaron pruebas unitarias para el procesador de registros. Consulta [backend/README.md](backend/README.md) para conocer el detalle y cómo ejecutarlas.

### Origen de los cambios y merge de la tarea

La refactorización se desarrolló en una rama independiente y después se integró a `main` mediante el **Pull Request #1: [Refactorizar pipeline de procesamiento de transacciones](https://github.com/WernerToledoSv/proyecto-transacciones/pull/1)**.

| Dato | Información |
|------|-------------|
| Rama de origen (donde se trabajó) | `refactor/separacion-pipeline-procesamiento` |
| Rama base (desde donde partió el trabajo) | `main` |
| Commit base de `main` | [`36a8e26`](https://github.com/WernerToledoSv/proyecto-transacciones/commit/36a8e26c9a71c24cd65653160b4e8d175d4b506f) |
| Rama de destino | `main` |
| Pull Request | [PR #1](https://github.com/WernerToledoSv/proyecto-transacciones/pull/1) |
| Estado | Cerrado y fusionado |
| Fecha de merge | 6 de noviembre de 2026 |
| Merge commit | [`79cc6ad`](https://github.com/WernerToledoSv/proyecto-transacciones/commit/79cc6ad2c3b77faa354c810d5c7375d5a3016dae) |

**¿Qué había antes y qué cambió con esta rama?**

El trabajo partió de la versión de `main` identificada por el commit `36a8e26`. En esa versión ya estaban incorporados el agente personalizado y las Skills de GitHub Copilot. La rama `refactor/separacion-pipeline-procesamiento` se creó a partir de ese estado para realizar la refactorización del backend; no reemplazó ni eliminó el trabajo previo de Skills y agente.

Los cambios incorporados por el PR #1 fueron:

1. **Separación del procesamiento por registro:** se creó `backend/app/services/record_processor.py`. La función `process_record()` se encarga de detectar la fuente, normalizar y validar una transacción. Devuelve un resultado válido o inválido, sin leer archivos ni guardar directamente en el almacenamiento.
2. **Separación de la orquestación del archivo:** se modificó `backend/app/services/processing_service.py`. Ahora lee el archivo, recorre sus registros, llama a `process_record()` y guarda los resultados en el almacenamiento.
3. **Responsabilidad del endpoint:** se reorganizó `backend/app/api/upload.py` para recibir los archivos, comprobar su tamaño y delegar el procesamiento al servicio.
4. **Configuración centralizada:** se agregó `MAX_UPLOAD_FILE_SIZE_MB` en `backend/app/core/config.py` y en `backend/.env.example`. El límite predeterminado continúa siendo de 10 MB por archivo, pero ahora puede configurarse desde el entorno.
5. **Pruebas unitarias:** se creó `backend/tests/test_record_processor.py` con cinco casos que verifican fuente desconocida, ausencia de normalizador, error de normalización, error de validación y procesamiento exitoso sin persistencia directa.
6. **Documentación:** se actualizaron los README general y del backend para explicar la nueva separación, la configuración y la ejecución de las pruebas.

En resumen, el cambio principal fue pasar de concentrar el procesamiento individual y la coordinación del archivo en un mismo servicio a separar esas responsabilidades. Esto facilita reutilizar y probar el procesamiento de cada transacción de forma aislada.

## 9. Pruebas unitarias

El backend incluye pruebas unitarias para verificar el procesamiento individual de las transacciones. Estas pruebas comprueban que el sistema:

- Identifique y rechace registros cuya fuente no puede determinarse.
- Maneje los casos en los que una fuente no tiene un normalizador registrado.
- Gestione errores durante la normalización.
- Rechace transacciones que no cumplen las reglas de validación.
- Devuelva correctamente una transacción válida sin guardarla directamente en el almacenamiento.

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

Las pruebas del procesador de registros se encuentran en `backend/tests/test_record_processor.py`. La opción `-v` muestra el nombre y el resultado de cada prueba. Si todas finalizan correctamente, al final aparecerá `OK`.

## 10. Referencias

- Backend: [backend/README.md](backend/README.md)
- Archivos de ejemplo: [backend/samples/](backend/samples/)
- Código del proyecto: [backend/](backend)
- Frontend: [frontend/](frontend)
