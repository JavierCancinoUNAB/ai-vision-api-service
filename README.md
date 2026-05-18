# AI Vision API as a Service

> Plataforma web de clasificación de imágenes con Inteligencia Artificial, construida sobre una arquitectura cloud de tres capas (IaaS + PaaS + SaaS).

---

## Descripción

**AI Vision API as a Service** es una aplicación full-stack que permite al usuario cargar una imagen desde su navegador, enviarla a una API REST propia, procesarla con el modelo de visión por computadora **MobileNetV2** (TensorFlow/Keras) y recibir una predicción con porcentaje de confianza. Todo el historial de predicciones se persiste en **Supabase PostgreSQL**.

---

## Objetivo

Demostrar la implementación práctica de los tres modelos de servicio cloud:

| Modelo | Tecnología | Rol |
|--------|-----------|-----|
| **IaaS** | AWS EC2 (Ubuntu Server 22.04/24.04) | Infraestructura virtual administrada |
| **PaaS** | Render + Supabase | Lógica de negocio y base de datos administrados |
| **SaaS** | Frontend en Vercel | Aplicación accesible por el usuario final |

---

## Tecnologías

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Axios
- Deploy: **Vercel**

### Backend
- Python 3.11+
- FastAPI + Uvicorn
- TensorFlow/Keras (MobileNetV2)
- Pillow
- Pydantic + pydantic-settings
- Supabase Python Client
- Deploy: **Render**

### Base de datos
- **Supabase** (PostgreSQL administrado)

### Infraestructura (IaaS)
- **AWS EC2** con Ubuntu Server 22.04 LTS

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO FINAL                            │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  CAPA 1 - PRESENTACIÓN (SaaS)                                   │
│  React + Vite + TypeScript + Tailwind CSS → Deploy en Vercel    │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API (Axios)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  CAPA 2 - LÓGICA DE NEGOCIO (PaaS)                              │
│  FastAPI + MobileNetV2 + Python 3.11 → Deploy en Render         │
└─────────┬───────────────────────────────────────────────────────┘
          │ Supabase Client
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  CAPA 3 - DATOS (PaaS)                                          │
│  Supabase PostgreSQL → Base de datos administrada               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  IaaS - AWS EC2 Ubuntu Server 22.04                             │
│  Servidor virtual para Nginx reverse proxy / ambiente pruebas   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Instalación Local

### Requisitos previos
- Node.js 18+
- Python 3.11+
- Git
- Docker Desktop (opcional)

### Backend

```bash
cd backend
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt

# Copia y completa las variables de entorno
cp .env.example .env

uvicorn app.main:app --reload
```

Backend disponible en: http://localhost:8000  
Swagger UI: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install

# Copia y completa las variables de entorno
cp .env.example .env

npm run dev
```

Frontend disponible en: http://localhost:5173

### Con Docker

```bash
# Desde la raíz del proyecto
cp backend/.env.example backend/.env
# Edita backend/.env con tus claves

docker compose up -d --build
```

---

## Variables de Entorno

### Backend (`backend/.env`)

```env
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY=TU_ANON_KEY
MAX_FILE_SIZE_MB=5
MODEL_NAME=MobileNetV2
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173
```

> **IMPORTANTE**: `SUPABASE_SERVICE_ROLE_KEY` es secreta. Nunca la pongas en el frontend ni la subas a GitHub.

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del servicio |
| POST | `/api/predict` | Clasificar imagen con IA |
| GET | `/api/history` | Historial de predicciones |

Ver documentación completa en [docs/ENDPOINTS.md](docs/ENDPOINTS.md).

---

## Base de Datos Supabase

Ejecuta el SQL en `docs/SUPABASE_SQL.sql` desde el editor SQL de Supabase.

La tabla `predictions` almacena:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | BIGSERIAL | Clave primaria |
| `filename` | TEXT | Nombre del archivo analizado |
| `prediction` | TEXT | Clase detectada por la IA |
| `confidence` | NUMERIC | Confianza entre 0 y 1 |
| `model_used` | TEXT | Modelo utilizado |
| `image_url` | TEXT | URL opcional de la imagen |
| `created_at` | TIMESTAMP | Fecha del análisis |

---

## Despliegue en la Nube

### Render (Backend)

Ver guía completa en [infrastructure/DEPLOY_RENDER.md](infrastructure/DEPLOY_RENDER.md).

1. Crear Web Service en Render.
2. Conectar repositorio GitHub.
3. Root directory: `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Agregar variables de entorno.

### Vercel (Frontend)

Ver guía completa en [infrastructure/DEPLOY_VERCEL.md](infrastructure/DEPLOY_VERCEL.md).

1. Importar repositorio en Vercel.
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Variable: `VITE_API_BASE_URL=https://TU-BACKEND.onrender.com`

### AWS EC2 (IaaS)

Ver guía completa en [infrastructure/AWS_EC2_SETUP.md](infrastructure/AWS_EC2_SETUP.md).

---

## Modelos Cloud

### IaaS — AWS EC2
- **Proveedor**: Amazon Web Services (AWS)
- **Servicio**: EC2 (Elastic Compute Cloud)
- **Sistema operativo**: Ubuntu Server 22.04 LTS
- **Uso en el proyecto**: Servidor virtual para Nginx reverse proxy, ambiente de pruebas de infraestructura, evidencia de administración de recursos IaaS.

### PaaS — Render + Supabase
- **Render**: Plataforma que gestiona el servidor, el runtime Python, el despliegue automático y el escalado del backend FastAPI.
- **Supabase**: Plataforma que gestiona la base de datos PostgreSQL, autenticación, Row Level Security y APIs automáticas.

### SaaS — Vercel
- **Vercel**: La aplicación React es accesible por cualquier usuario desde el navegador, sin necesidad de instalar nada. Es un servicio de software completo.

---

## Pruebas

### Prueba rápida del backend

```bash
# Health check
curl http://localhost:8000/api/health

# Predecir imagen
curl -X POST http://localhost:8000/api/predict \
  -F "file=@/ruta/a/imagen.jpg"

# Historial
curl http://localhost:8000/api/history
```

---

## Evidencias para Presentación

- [ ] Link frontend en Vercel (público)
- [ ] Link backend en Render → `/api/health`
- [ ] Captura de Swagger UI (`/docs`)
- [ ] Captura de predicción funcionando
- [ ] Captura de historial
- [ ] Captura tabla `predictions` en Supabase
- [ ] Captura de instancia AWS EC2 activa
- [ ] Diagrama de arquitectura (ver `docs/ARQUITECTURA.md`)
- [ ] Tabla de cumplimiento de rúbrica (ver `docs/RUBRICA_CUMPLIMIENTO.md`)

---

## Seguridad

- No se almacenan claves en el repositorio.
- `.env` y `.pem` están en `.gitignore`.
- `SUPABASE_SERVICE_ROLE_KEY` solo se usa en el backend.
- CORS configurado para aceptar solo orígenes autorizados.
- Validación de tipo y tamaño de imagen en el backend.
- HTTPS obligatorio en producción (Render y Vercel lo proveen automáticamente).

---

## Tabla de Cumplimiento de Rúbrica

| Criterio | Cumplido | Evidencia |
|----------|----------|-----------|
| Componente IaaS | ✅ | AWS EC2 Ubuntu documentado y activo |
| Capa PaaS | ✅ | Render (backend) + Supabase (DB) |
| Solución SaaS | ✅ | Frontend en Vercel, acceso público |
| API propia implementada | ✅ | 3 endpoints REST documentados |
| Arquitectura 3 capas | ✅ | Presentación / Lógica / Datos |
| Despliegue accesible | ✅ | URLs públicas Render + Vercel |
| Documentación técnica | ✅ | README + docs/ + infrastructure/ |

---

## Estructura del Proyecto

```
ai-vision-api-service/
├── README.md
├── .gitignore
├── docker-compose.yml
├── frontend/          # React + Vite + TypeScript
├── backend/           # FastAPI + TensorFlow
├── docs/              # Documentación técnica
└── infrastructure/    # Guías de despliegue cloud
```

---

*Proyecto académico — AI Vision API as a Service — 2026*
