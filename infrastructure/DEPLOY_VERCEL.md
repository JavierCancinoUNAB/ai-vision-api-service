# Deploy en Vercel — Frontend React (SaaS)

## ¿Por qué Vercel es SaaS?

La aplicación React desplegada en Vercel es accesible por cualquier usuario desde el navegador, sin necesidad de instalar nada. Vercel provee hosting, CDN global, SSL automático y despliegue continuo. El usuario final consume el software como servicio.

---

## Requisitos Previos

- Repositorio en GitHub con el código del proyecto.
- Cuenta en Vercel: https://vercel.com
- URL del backend en Render disponible.

---

## Paso a Paso

### 1. Crear cuenta y conectar GitHub

1. Ve a https://vercel.com y crea una cuenta (gratuita con GitHub).
2. Haz clic en **"Continue with GitHub"** y autoriza el acceso.

### 2. Importar el proyecto

1. En el dashboard, haz clic en **"Add New..." → "Project"**.
2. Busca el repositorio `ai-vision-api-service` y haz clic en **"Import"**.

### 3. Configurar el proyecto

| Campo | Valor |
|-------|-------|
| Framework Preset | **Vite** |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 4. Agregar Variables de Entorno

En la sección **"Environment Variables"**:

| Variable | Valor |
|----------|-------|
| `VITE_API_BASE_URL` | `https://TU-BACKEND.onrender.com` |

> Reemplaza con la URL real de tu servicio en Render.

### 5. Desplegar

1. Haz clic en **"Deploy"**.
2. Espera 1-2 minutos.
3. Vercel asignará una URL pública tipo:
   `https://ai-vision-frontend-xxx.vercel.app`

### 6. Actualizar CORS en el backend

Una vez que tengas la URL de Vercel, actualiza la variable `CORS_ORIGINS` en Render:

```
CORS_ORIGINS=https://ai-vision-frontend-xxx.vercel.app
```

---

## Verificar el Despliegue

1. Abre la URL de Vercel en el navegador.
2. Debes ver la interfaz de "AI Vision API as a Service".
3. Sube una imagen de prueba y verifica que aparezca la predicción.

---

## Actualizaciones Automáticas

Cada `git push` a `main` redespliega automáticamente:

```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel redespliega automáticamente en ~1 minuto
```

---

## Dominio Personalizado (Opcional)

1. En Vercel → tu proyecto → **"Settings" → "Domains"**.
2. Agrega tu dominio personalizado.
3. Configura los DNS según las instrucciones de Vercel.

---

## Solución de Problemas Comunes

### "Page not found" al recargar rutas
- Crea un archivo `frontend/public/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Variables de entorno no disponibles
- Verifica que la variable empiece con `VITE_`.
- En Vite, solo las variables `VITE_*` se exponen al código del cliente.
- Redespliega después de agregar o cambiar variables.

### Error de CORS al hacer peticiones al backend
- Verifica que `VITE_API_BASE_URL` apunta a la URL correcta de Render.
- Verifica que `CORS_ORIGINS` en Render contiene la URL exacta de Vercel.

### Build falla con error de TypeScript
- Verifica que no hay errores de TypeScript localmente: `npm run build`
- Asegúrate de que `tsconfig.json` está en `frontend/`.

---

## Preview Deployments

Vercel crea automáticamente una URL de preview para cada Pull Request o rama distinta de `main`. Esto permite revisar cambios antes de pasarlos a producción.
