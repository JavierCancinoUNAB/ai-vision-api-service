# Notas de Seguridad — AI Vision API as a Service

## Reglas Fundamentales

### 1. Nunca subas `.env` a GitHub

El archivo `.env` contiene contraseñas y claves de API. Está protegido por `.gitignore`.

**Si accidentalmente lo subes:**
1. Revoca inmediatamente las claves comprometidas (Supabase, AWS, etc.)
2. Genera nuevas claves
3. Limpia el historial de git con BFG Repo Cleaner
4. Fuerza un nuevo push limpio

### 2. Nunca subas el archivo `.pem` a GitHub

El archivo `.pem` es la clave privada SSH de tu instancia EC2. Si alguien lo obtiene, tiene acceso total al servidor.

- Guárdalo en un lugar seguro de tu computadora
- No lo compartas por correo ni mensajería
- En macOS/Linux, dale permisos restrictivos: `chmod 400 mi-clave.pem`

### 3. `SUPABASE_SERVICE_ROLE_KEY` solo en el backend

La service role key bypassa todas las políticas RLS de Supabase. Solo debe usarse en:
- Variables de entorno del servidor (Render, EC2)
- Nunca en el código del frontend
- Nunca en el repositorio

---

## CORS (Cross-Origin Resource Sharing)

El backend tiene CORS configurado para aceptar solo los orígenes autorizados.

**En desarrollo** (`backend/.env`):
```
CORS_ORIGINS=http://localhost:5173
```

**En producción** (variables de Render):
```
CORS_ORIGINS=https://TU-FRONTEND.vercel.app
```

Nunca uses `CORS_ORIGINS=*` en producción. Esto permitiría a cualquier sitio hacer peticiones a tu API.

---

## Validación de Imágenes

El backend valida todas las imágenes antes de procesarlas:

- **Extensión permitida**: `jpg`, `jpeg`, `png`, `webp`
- **Tamaño máximo**: 5 MB (configurable con `MAX_FILE_SIZE_MB`)
- **Contenido vacío**: rechazado con HTTP 400

Esto previene:
- Subida de archivos maliciosos con extensión cambiada
- Ataques de denegación de servicio por archivos enormes
- Procesamiento de datos corruptos

---

## HTTPS en Producción

- **Render** provee HTTPS automático con certificado SSL de Let's Encrypt.
- **Vercel** provee HTTPS automático con certificado SSL propio.
- En local, HTTP es aceptable.

Nunca despliegues en producción sin HTTPS. Los datos (incluyendo imágenes) viajan encriptados.

---

## Variables de Entorno: Dónde Van

| Variable | Frontend | Backend Local | Backend Render | GitHub |
|----------|----------|---------------|----------------|--------|
| `VITE_API_BASE_URL` | ✅ | ❌ | ❌ | ❌ |
| `SUPABASE_URL` | ❌ | ✅ (.env) | ✅ (Env Vars) | ❌ |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ ❌ NUNCA | ✅ (.env) | ✅ (Env Vars) | ❌ ❌ NUNCA |
| `SUPABASE_ANON_KEY` | ❌ | ✅ (.env) | ✅ (Env Vars) | ❌ |

---

## Seguridad en AWS EC2

- Limitar el puerto SSH (22) a tu IP específica en el Security Group.
- Mantener el sistema operativo actualizado: `sudo apt update && sudo apt upgrade -y`
- No ejecutar servicios como `root`.
- Usar UFW (Uncomplicated Firewall) para reglas adicionales.
- Detener la instancia cuando no la uses (evita costos y reduce superficie de ataque).

---

## Checklist de Seguridad

Antes de hacer push a GitHub:

```bash
# Verifica que .env no está trackeado
git status

# Si aparece, agrégalo al .gitignore y elimínalo del staging
git rm --cached .env
git rm --cached backend/.env
git rm --cached frontend/.env

# Verifica que .pem no está trackeado
git status | grep .pem
```

Antes de presentar:

- [ ] No hay claves reales hardcodeadas en el código
- [ ] `.env` no aparece en `git log` ni en el repositorio remoto
- [ ] `.pem` no está en el repositorio
- [ ] Las claves de Supabase en el repositorio son solo los valores de ejemplo
- [ ] CORS está configurado con la URL específica del frontend
