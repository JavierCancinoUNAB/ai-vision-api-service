# Documentación de Endpoints — AI Vision API as a Service

Base URL local: `http://localhost:8000`  
Base URL producción: `https://TU-BACKEND.onrender.com`

Swagger UI interactivo: `{BASE_URL}/docs`  
ReDoc: `{BASE_URL}/redoc`

---

## GET /api/health

Verifica que el servicio esté activo. Útil para healthchecks en Render y Docker.

### Request

```
GET /api/health
```

No requiere parámetros ni headers especiales.

### Response 200

```json
{
  "status": "ok",
  "service": "AI Vision API",
  "environment": "development"
}
```

### Ejemplo curl

```bash
curl http://localhost:8000/api/health
```

### Ejemplo curl (producción)

```bash
curl https://TU-BACKEND.onrender.com/api/health
```

---

## POST /api/predict

Recibe una imagen y devuelve la clasificación realizada por MobileNetV2.

### Request

- **Content-Type**: `multipart/form-data`
- **Campo**: `file` (requerido) — archivo de imagen

**Formatos aceptados**: `jpg`, `jpeg`, `png`, `webp`  
**Tamaño máximo**: 5 MB

### Response 200

```json
{
  "filename": "perro.jpg",
  "prediction": "golden retriever",
  "confidence": 0.9234,
  "model": "MobileNetV2",
  "created_at": "2026-05-17T18:00:00.000000+00:00",
  "saved": true,
  "warning": null
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `filename` | string | Nombre del archivo enviado |
| `prediction` | string | Clase detectada por el modelo (en inglés, ImageNet) |
| `confidence` | float | Confianza entre 0.0 y 1.0 |
| `model` | string | Modelo utilizado (`MobileNetV2`) |
| `created_at` | datetime | Fecha y hora del análisis (UTC) |
| `saved` | boolean | `true` si se guardó en Supabase |
| `warning` | string \| null | Advertencia si Supabase no está configurado |

### Response sin Supabase configurado

```json
{
  "filename": "gato.png",
  "prediction": "Egyptian cat",
  "confidence": 0.8761,
  "model": "MobileNetV2",
  "created_at": "2026-05-17T18:00:00.000000+00:00",
  "saved": false,
  "warning": "Supabase no está configurado. El resultado no se guardó en la base de datos."
}
```

### Errores

| Código | Descripción |
|--------|-------------|
| 400 | No se recibió archivo o está vacío |
| 413 | Archivo supera el tamaño máximo (5 MB) |
| 415 | Extensión de archivo no soportada |
| 422 | La imagen no se pudo procesar |
| 503 | El modelo de IA no está disponible |

### Ejemplo curl

```bash
curl -X POST http://localhost:8000/api/predict \
  -F "file=@/ruta/a/imagen.jpg"
```

### Ejemplo curl (Windows PowerShell)

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/predict" `
  -Method POST `
  -Form @{ file = Get-Item "C:\ruta\imagen.jpg" }
```

---

## GET /api/history

Retorna el historial de predicciones almacenadas en Supabase, ordenado de más reciente a más antiguo.

### Request

```
GET /api/history
```

No requiere parámetros.

### Response 200 (con Supabase configurado)

```json
{
  "items": [
    {
      "id": 12,
      "filename": "perro.jpg",
      "prediction": "golden retriever",
      "confidence": 0.9234,
      "model_used": "MobileNetV2",
      "image_url": null,
      "created_at": "2026-05-17T18:00:00+00:00"
    },
    {
      "id": 11,
      "filename": "gato.png",
      "prediction": "Egyptian cat",
      "confidence": 0.8761,
      "model_used": "MobileNetV2",
      "image_url": null,
      "created_at": "2026-05-17T17:45:00+00:00"
    }
  ],
  "total": 2,
  "supabase_available": true,
  "message": null
}
```

### Response 200 (sin Supabase configurado)

```json
{
  "items": [],
  "total": 0,
  "supabase_available": false,
  "message": "Supabase no está configurado. Configure las variables de entorno para ver el historial."
}
```

### Ejemplo curl

```bash
curl http://localhost:8000/api/history
```

### Ejemplo curl con formato legible

```bash
curl http://localhost:8000/api/history | python3 -m json.tool
```

---

## Notas Generales

- Todos los endpoints están bajo el prefijo `/api`.
- Las respuestas siempre son JSON con `Content-Type: application/json`.
- CORS está habilitado para los orígenes definidos en `CORS_ORIGINS`.
- El Swagger UI completo está disponible en `/docs`.
- El modelo MobileNetV2 clasifica entre **1000 clases de ImageNet**.
  Las clases están en inglés (p.ej. `golden_retriever`, `Egyptian_cat`, `sports_car`).
