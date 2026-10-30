# Backend — Sistema de Normalización de Transacciones

API REST construida con FastAPI para detectar, normalizar y validar transacciones financieras de multiple origen.

---

## Requisitos

- Python 3.12 o superior

---

## Instalación

```powershell
cd C:\Users\USER\Desktop\proyecto-transacciones\backend

python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt

if (Test-Path .env.example) {
    Copy-Item .env.example .env
}
```

---

## Ejecución

```powershell
cd C:\Users\USER\Desktop\proyecto-transacciones\backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

| URL | Descripción |
|-----|-------------|
| `http://localhost:8000/docs` | Swagger UI |
| `http://localhost:8000/redoc` | ReDoc |
| `http://localhost:8000/health` | Estado del backend |

---

## Estructura principal

```text
backend/
├── app/
│   ├── api/                 # Endpoints HTTP
│   ├── core/                # Excepciones y utilidades base
│   ├── detectors/           # Detección de origen del registro
│   ├── metrics/             # Cálculo de métricas
│   ├── models/              # Modelos canónicos y enums
│   ├── normalizers/         # Normalización por proveedor
│   ├── rules/               # Reglas de moneda, fechas y estados
│   ├── services/            # Procesamiento y almacenamiento en memoria
│   └── validators/          # Validaciones del dominio
├── main.py                  # Punto de entrada de FastAPI
├── requirements.txt
├── .env.example
├── README.md
└── .venv/
```

---

## Flujo de procesamiento

El backend ejecuta este flujo:

1. Detecta la fuente del registro.
2. Normaliza el registro a un formato canónico.
3. Valida la transacción ya normalizada.
4. Guarda el resultado en memoria.
5. Calcula métricas por moneda, estado y fuente.

---

## Endpoints

### Upload

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/upload/` | Procesar uno o varios archivos JSON |

### Transacciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/transactions/` | Listar transacciones |
| GET | `/api/v1/transactions/{id}` | Obtener una transacción por ID |
| DELETE | `/api/v1/transactions/` | Limpiar el almacenamiento en memoria |

**Parámetros de filtro**:
- `source`: `stripe` | `paypal` | `bank_transfer` | `unknown`
- `status`: `pending` | `completed` | `failed` | `refunded` | `cancelled` | `unknown`
- `currency`: código incluido en el catálogo de `app/rules/monedas.py` (por ejemplo `USD`, `EUR`, `COP`)

### Métricas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/metrics/` | Indicadores del procesamiento |

### Registros inválidos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/invalid/` | Registros que fallaron durante la normalización o validación |

---

## Fuentes soportadas

### Stripe

| Campo original | Campo canónico | Transformación |
|----------------|----------------|----------------|
| `charge_id` | `id` | Directo |
| `amount_cents` | `amount` | ÷ 100 |
| `currency` | `currency` | Mayúsculas |
| `charge_status` | `status` | Mapeo por estado |
| `created_at` | `timestamp` | Unix timestamp → UTC |

### PayPal

| Campo original | Campo canónico | Transformación |
|----------------|----------------|----------------|
| `transaction_id` | `id` | Directo |
| `gross_amount` | `amount` | String → float |
| `currency_code` | `currency` | Mayúsculas |
| `payment_status` | `status` | Mapeo por estado |
| `time_created` | `timestamp` | Formato admitido por las reglas de fecha → UTC |

### Bank Transfer

| Campo original | Campo canónico | Transformación |
|----------------|----------------|----------------|
| `reference_number` | `id` | Directo |
| `transfer_amount` | `amount` | Directo |
| `transfer_currency` | `currency` | Mayúsculas |
| `status_code` | `status` | Mapeo de estados bancarios |
| `value_date` | `timestamp` | Fecha → UTC |

---

## Validación de negocio

La validación se hace sobre la transacción ya normalizada.

Reglas presentes en `app/validators/transaction_validator.py`:

- `id` no vacío
- `amount` no negativo
- `amount` mayor a cero para estados con movimiento de fondos
- `currency` con formato de tres letras mayúsculas e incluida en `app/rules/monedas.py`
- `timestamp` no excesivamente futuro

---

## Estructura de errores

| Nivel | Tipo | Ejemplo |
|-------|------|---------|
| Archivo | `FileError` | JSON mal formado |
| Estructura | `StructureError` | Claves no reconocidas |
| Fuente | `UnknownSource` | No coincide con ninguna firma |
| Registro | `NormalizationError` | Campo obligatorio ausente |
| Negocio | `ValidationError` | Monto inválido, moneda inválida |

---

## Probar la API manualmente

```powershell
curl -X POST http://localhost:8000/api/v1/upload/ -F "files=@samples/stripe_transactions.json"
curl http://localhost:8000/api/v1/transactions/
curl "http://localhost:8000/api/v1/transactions/?source=stripe&currency=USD"
curl http://localhost:8000/api/v1/metrics/
curl http://localhost:8000/api/v1/invalid/
curl -X DELETE http://localhost:8000/api/v1/transactions/
```


## Arquitectura

```text
backend/
├── main.py                        # Aplicación FastAPI y configuración CORS
├── requirements.txt
├── .env.example
└── app/
    ├── api/                       # Endpoints HTTP
    ├── core/                      # Configuración y excepciones
    ├── detectors/                 # Detección de fuentes
    ├── metrics/                   # Cálculo de métricas
    ├── models/                    # Modelos de transacciones y respuestas
    ├── normalizers/               # Normalizadores por fuente
    ├── readers/                   # Lectura de archivos de entrada
    ├── rules/                     # Catálogos de monedas, fechas y estados
    ├── services/                  # Procesamiento y almacenamiento
    └── validators/                # Validación de transacciones
```
