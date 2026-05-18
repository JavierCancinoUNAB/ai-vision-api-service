# Deploy en Render — Backend FastAPI (PaaS)

## ¿Por qué Render es PaaS?

Render es una plataforma PaaS (Platform as a Service). Gestiona el servidor, el runtime Python, el despliegue automático desde GitHub, el certificado SSL y el escalado. El equipo solo gestiona el código y las variables de entorno.

---

## Requisitos Previos

- Repositorio en GitHub con el código del proyecto.
- Cuenta en Render: https://render.com
- Variables de entorno de Supabase listas.

---

## Paso a Paso

### 1. Crear cuenta y conectar GitHub

1. Ve a https://render.com y crea una cuenta (gratuita).
2. Ve a **Account Settings → Integrations → GitHub**.
3. Conecta tu cuenta de GitHub y da acceso al repositorio.

### 2. Crear el Web Service

1. En el dashboard, haz clic en **"New +"** → **"Web Service"**.
2. Selecciona **"Build and deploy from a Git repository"**.
3. Selecciona el repositorio `ai-vision-api-service`.

### 3. Configurar el servicio

| Campo | Valor |
|-------|-------|
| Name | `ai-vision-backend` |
| Region | Oregon (US West) o la más cercana |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | `Python 3` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Instance Type | Free (para demo) o Starter ($7/mes para producción) |

> **Nota sobre la RAM**: TensorFlow requiere al menos 512 MB de RAM.
> El plan Free tiene 512 MB pero puede ser ajustado. Si el servicio falla
> por OOM (Out of Memory), usa el plan Starter.

### 4. Agregar Variables de Entorno

En la sección **"Environment Variables"**, agrega una por una:

| Variable | Valor |
|----------|-------|
| `SUPABASE_URL` | `https://TU-PROYECTO.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `TU_SERVICE_ROLE_KEY` |
| `SUPABASE_ANON_KEY` | `TU_ANON_KEY` |
| `MAX_FILE_SIZE_MB` | `5` |
| `MODEL_NAME` | `MobileNetV2` |
| `ENVIRONMENT` | `production` |
| `CORS_ORIGINS` | `https://TU-FRONTEND.vercel.app` |

> **IMPORTANTE**: Completa `CORS_ORIGINS` con la URL del frontend en Vercel
> después de desplegarlo. Mientras tanto, puedes poner `*` solo durante pruebas.

### 5. Desplegar

1. Haz clic en **"Create Web Service"**.
2. Render comenzará a construir. El proceso dura 5-10 minutos la primera vez.
3. Puedes seguir el progreso en los logs de build.

### 6. Verificar el despliegue

Una vez que el estado sea **"Live"**:

```bash
# Health check
curl https://TU-BACKEND.onrender.com/api/health

# Swagger UI
# Abrir en el navegador:
# https://TU-BACKEND.onrender.com/docs
```

---

## Actualizaciones Automáticas

Cada vez que hagas `git push` a la rama `main`, Render detectará el cambio
y redesplegará automáticamente.

```bash
git add .
git commit -m "Update backend"
git push origin main
# Render redespliega automáticamente
```

---

## Logs en Tiempo Real

Desde el dashboard de Render → tu servicio → **"Logs"**:

```
=== Logs de startup ===
INFO | AI Vision API iniciada correctamente.
INFO | Entorno: production
INFO | Modelo IA: MobileNetV2
INFO | Supabase configurado: True
INFO | Swagger UI disponible en /docs
```

---

## Nota sobre el Plan Free de Render

El plan gratuito de Render:
- Duerme el servicio después de **15 minutos de inactividad**.
- Al primer request después del "sleep", tarda **30-60 segundos** en reactivarse.
- Esto es normal para demos académicas.
- Para evitarlo, usa el plan Starter ($7/mes) o el plan Pro.

Alternativa: Puedes usar un servicio externo de "ping" para mantenerlo activo:
- https://uptimerobot.com (gratis)
- Configura un monitor HTTP cada 10 minutos hacia `/api/health`.

---

## Solución de Problemas Comunes

### Error: "out of memory"
- Increase instance type a Starter (512 MB → 2 GB RAM).

### Error: "Module not found"
- Verifica que `requirements.txt` está completo.
- Verifica que `Root Directory` está configurado como `backend`.

### Error de CORS en el frontend
- Verifica que `CORS_ORIGINS` contiene la URL exacta del frontend (sin slash final).
- Ejemplo: `https://mi-app.vercel.app` (correcto)
- Ejemplo: `https://mi-app.vercel.app/` (incorrecto, tiene slash)

### El modelo tarda mucho en la primera predicción
- Es normal. MobileNetV2 tarda ~2-5 segundos en la primera inferencia.
- Las siguientes son más rápidas (~0.5-1 segundo).
