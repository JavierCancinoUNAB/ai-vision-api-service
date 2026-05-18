# Cumplimiento de Rúbrica — AI Vision API as a Service

## Tabla General de Cumplimiento

| Criterio | Peso | Cómo se cumple | Evidencia requerida |
|----------|------|----------------|---------------------|
| Despliegue en la nube | 15% | Frontend en Vercel + Backend en Render | URLs públicas activas |
| Diseño en capas (3+) | 15% | Presentación / Lógica / Datos | Diagrama en ARQUITECTURA.md |
| Componente IaaS | 15% | AWS EC2 Ubuntu Server 22.04 | Captura instancia activa en consola AWS |
| Componente PaaS | 15% | Render (backend) + Supabase (DB) | Captura dashboard Render + tabla Supabase |
| Solución SaaS | 10% | Frontend accesible en Vercel | URL pública funcional |
| API propia implementada | 10% | 3 endpoints REST documentados | Swagger /docs + curl examples |
| Funcionalidad completa | 10% | Subida → predicción → historial | Captura del flujo completo |
| Documentación técnica | 5% | README + docs/ + infrastructure/ | Archivos en el repositorio |
| Presentación oral | 5% | Defensa de decisiones técnicas | Slides o demo en vivo |

---

## Detalle por Criterio

### 1. Despliegue en la nube (15%)

**Cumplido:** La solución no es local. Está desplegada en servicios cloud públicos.

| Componente | Servicio | URL |
|------------|---------|-----|
| Frontend | Vercel | `https://[proyecto].vercel.app` |
| Backend API | Render | `https://[proyecto].onrender.com` |
| Base de datos | Supabase | PostgreSQL administrado |

**Evidencias:**
- [ ] Captura del frontend desplegado y funcional
- [ ] Captura de `GET /api/health` respondiendo desde Render
- [ ] Captura del dashboard de Vercel con deploy exitoso

---

### 2. Diseño en capas (15%)

**Cumplido:** Arquitectura en 3 capas claramente separadas.

| Capa | Componente | Tecnología |
|------|-----------|------------|
| Presentación | Frontend SPA | React + TypeScript + Vercel |
| Lógica | API REST + Modelo IA | FastAPI + MobileNetV2 + Render |
| Datos | Base de datos relacional | PostgreSQL + Supabase |

**Evidencias:**
- [ ] Diagrama de arquitectura (ver `docs/ARQUITECTURA.md`)
- [ ] Código organizado en `frontend/` y `backend/` con separación clara

---

### 3. Componente IaaS (15%)

**Cumplido:** AWS EC2 con Ubuntu Server 22.04 LTS.

**Definición:** IaaS (Infrastructure as a Service) provee recursos de cómputo virtualizados. El equipo gestiona el sistema operativo y el software instalado.

| Elemento | Detalle |
|----------|---------|
| Proveedor | Amazon Web Services (AWS) |
| Servicio IaaS | EC2 (Elastic Compute Cloud) |
| Sistema operativo | Ubuntu Server 22.04 LTS |
| Uso | Nginx reverse proxy / ambiente de pruebas |

**Por qué EC2 es IaaS y no PaaS:**
- En EC2 instalas y configuras el SO manualmente.
- Gestionas usuarios, actualizaciones de seguridad, firewall, servicios.
- El proveedor solo gestiona el hardware físico y la virtualización.
- Esto contrasta con Render (PaaS), donde el proveedor gestiona el servidor, el runtime y el despliegue.

**Evidencias:**
- [ ] Captura de la consola AWS con la instancia EC2 en estado `running`
- [ ] Captura de la conexión SSH exitosa (`ubuntu@IP_PUBLICA`)
- [ ] Captura de Nginx configurado o Docker instalado

---

### 4. Componente PaaS (15%)

**Cumplido:** Render (backend) + Supabase (base de datos).

**Render:**
- Gestiona el servidor, el runtime Python, el despliegue desde GitHub y el SSL.
- El equipo solo sube el código y configura variables de entorno.

**Supabase:**
- Gestiona el motor PostgreSQL, backups, escalabilidad y autenticación.
- El equipo solo define el esquema SQL y las políticas RLS.

**Evidencias:**
- [ ] Captura del dashboard de Render con el servicio activo
- [ ] Captura de la tabla `predictions` en Supabase con datos reales
- [ ] Variables de entorno configuradas en Render

---

### 5. Solución SaaS (10%)

**Cumplido:** Aplicación web React desplegada en Vercel.

**Por qué es SaaS:**
- El usuario accede desde el navegador sin instalar nada.
- La aplicación es multiusuario y accesible globalmente.
- Vercel provee hosting, CDN, SSL y despliegue automático.

**Evidencias:**
- [ ] URL pública de Vercel accesible
- [ ] Captura del flujo completo de uso

---

### 6. API propia implementada (10%)

**Cumplido:** 3 endpoints REST documentados con Swagger.

| Endpoint | Método | Función |
|----------|--------|---------|
| `/api/health` | GET | Healthcheck del servicio |
| `/api/predict` | POST | Clasificación de imagen con IA |
| `/api/history` | GET | Historial de predicciones |

**Evidencias:**
- [ ] Captura del Swagger UI en `/docs`
- [ ] Captura de respuesta de `/api/predict` con JSON de resultado
- [ ] Ver `docs/ENDPOINTS.md` para documentación completa

---

### 7. Funcionalidad completa (10%)

**Flujo completo implementado:**

1. Usuario sube imagen → Frontend valida tipo y tamaño
2. Frontend envía `POST /api/predict` con `multipart/form-data`
3. Backend valida imagen → MobileNetV2 clasifica → guarda en Supabase
4. Frontend muestra predicción con confianza en porcentaje
5. Frontend muestra historial actualizado desde Supabase

**Evidencias:**
- [ ] Demo en vivo durante la presentación
- [ ] Capturas del flujo: subida → resultado → historial

---

### 8. Documentación técnica (5%)

**Documentación incluida:**

| Archivo | Contenido |
|---------|-----------|
| `README.md` | Descripción, instalación, despliegue |
| `docs/ARQUITECTURA.md` | Diagrama y explicación de capas |
| `docs/ENDPOINTS.md` | Documentación de la API |
| `docs/SUPABASE_SQL.sql` | Script de base de datos |
| `docs/RUBRICA_CUMPLIMIENTO.md` | Este archivo |
| `docs/INSTRUCCIONES_COMPLETAS.txt` | Guía paso a paso |
| `infrastructure/AWS_EC2_SETUP.md` | Guía IaaS |
| `infrastructure/DEPLOY_RENDER.md` | Guía PaaS backend |
| `infrastructure/DEPLOY_VERCEL.md` | Guía SaaS frontend |
| `infrastructure/NGINX_REVERSE_PROXY.md` | Nginx en EC2 |
| `infrastructure/SECURITY_NOTES.md` | Notas de seguridad |

---

### 9. Presentación oral (5%)

**Puntos a defender:**

1. **Arquitectura de tres capas**: Explicar cada capa con el diagrama Mermaid.
2. **IaaS vs PaaS vs SaaS**: Usar la tabla de diferenciación.
3. **El modelo de IA**: MobileNetV2, ImageNet, 1000 clases, 96% Top-5 accuracy.
4. **Decisiones de diseño**: Por qué FastAPI, por qué Supabase, por qué Render.
5. **Seguridad**: CORS, validación de imágenes, manejo de claves.
6. **Demo en vivo**: Subir imagen y mostrar predicción funcionando.

---

## Checklist Final Antes de la Presentación

- [ ] Backend `/api/health` responde `{"status": "ok"}`
- [ ] Swagger `/docs` accesible
- [ ] Frontend carga en Vercel
- [ ] Se puede subir una imagen y obtener predicción
- [ ] El resultado se guarda en Supabase
- [ ] El historial muestra los registros
- [ ] Instancia EC2 activa y con SSH funcionando
- [ ] Capturas de pantalla preparadas
- [ ] URLs compartidas o listos para demo
