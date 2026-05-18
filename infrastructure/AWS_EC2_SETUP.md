# AWS EC2 Setup — Guía de Infraestructura IaaS

## Concepto

**Amazon AWS** es el proveedor cloud.  
**AWS EC2** (Elastic Compute Cloud) es el servicio IaaS de servidor virtual.  
**Ubuntu Server 22.04 LTS** es el sistema operativo instalado dentro de la instancia EC2.

En IaaS, el proveedor gestiona el hardware físico y la virtualización. El equipo gestiona el sistema operativo, el software instalado y la seguridad.

---

## Paso 1 — Crear la instancia EC2

1. Accede a la consola AWS: https://console.aws.amazon.com
2. Busca **EC2** en la barra de búsqueda y entra al servicio.
3. Haz clic en **"Launch instance"**.
4. Configura los parámetros:

| Parámetro | Valor recomendado |
|-----------|------------------|
| Name | `ai-vision-server` |
| AMI | Ubuntu Server 22.04 LTS (Free Tier eligible) |
| Architecture | 64-bit (x86) |
| Instance type | t2.micro (Free Tier) |
| Key pair | Crear nuevo (ver Paso 2) |

---

## Paso 2 — Key Pair (archivo .pem)

1. En la sección **"Key pair (login)"**, haz clic en **"Create new key pair"**.
2. Nombre: `ai-vision-key`
3. Key pair type: **RSA**
4. Private key file format: **.pem** (macOS/Linux) o **.ppk** (Windows PuTTY)
5. Haz clic en **"Create key pair"**.
6. El archivo `.pem` se descargará automáticamente.

> **CRÍTICO**: Guarda el archivo `.pem` en un lugar seguro.  
> **Nunca lo subas a GitHub o a ningún repositorio público.**  
> El archivo `.pem` está en `.gitignore` por esta razón.

---

## Paso 3 — Security Group (Puertos)

En **"Network settings"** configura los puertos de entrada:

| Puerto | Protocolo | Fuente | Uso |
|--------|-----------|--------|-----|
| 22 | TCP | My IP (recomendado) | SSH — acceso administrativo |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 443 | TCP | 0.0.0.0/0 | HTTPS |
| 8000 | TCP | My IP (opcional) | Solo para pruebas directas del backend |

> **Seguridad**: Limitar el puerto 22 a "My IP" reduce la superficie de ataque.  
> No abras el puerto 8000 al público si usas Nginx como reverse proxy.

---

## Paso 4 — Lanzar la instancia

1. Revisa la configuración y haz clic en **"Launch instance"**.
2. Espera 1-2 minutos a que el estado sea **"running"**.
3. Toma nota de la **"Public IPv4 address"** (ej: `54.23.45.67`).

---

## Paso 5 — Conectarse por SSH

### macOS / Linux

```bash
# Dar permisos correctos al archivo .pem
chmod 400 /ruta/ai-vision-key.pem

# Conectarse
ssh -i "/ruta/ai-vision-key.pem" ubuntu@IP_PUBLICA_EC2
```

### Windows (PowerShell)

```powershell
ssh -i "C:\Users\TuUsuario\Downloads\ai-vision-key.pem" ubuntu@IP_PUBLICA_EC2
```

### Windows (con PuTTY)

1. Abre **PuTTYgen**, importa el `.pem`, guarda como `.ppk`.
2. Abre **PuTTY**, pon la IP en "Host Name".
3. En Connection → SSH → Auth: selecciona el `.ppk`.
4. Haz clic en "Open".

---

## Paso 6 — Configurar el servidor

Una vez conectado por SSH:

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar utilidades básicas
sudo apt install -y curl wget git unzip

# Instalar Docker
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker

# Agregar usuario ubuntu al grupo docker
sudo usermod -aG docker ubuntu

# Salir y volver a entrar para aplicar el grupo
exit
```

Reconectar y verificar:

```bash
ssh -i "ai-vision-key.pem" ubuntu@IP_PUBLICA_EC2
docker --version
docker compose version
```

Instalar Nginx:

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Verificar que Nginx responde
curl http://localhost
```

---

## Paso 7 — Clonar y correr el proyecto (opcional)

```bash
# Clonar el repositorio
git clone https://github.com/TU-USUARIO/ai-vision-api-service.git
cd ai-vision-api-service

# Crear y configurar .env
cp backend/.env.example backend/.env
nano backend/.env   # Editar con las claves reales

# Construir y correr con Docker
docker compose up -d --build

# Verificar
curl http://localhost:8000/api/health
```

---

## Paso 8 — Obtener la IP Pública (para EC2 como proxy)

```bash
# Obtener IP pública desde la instancia
curl -s http://checkip.amazonaws.com
# o
curl -s http://169.254.169.254/latest/meta-data/public-ipv4
```

---

## Evidencia para la Presentación

Para demostrar el uso de IaaS:

1. **Captura 1**: Consola AWS → EC2 → Instances → Estado "running"
2. **Captura 2**: Terminal con SSH conectado al servidor Ubuntu
3. **Captura 3**: `uname -a` para mostrar Ubuntu 22.04
4. **Captura 4**: `docker --version` y `nginx -v` instalados
5. **Captura 5** (opcional): Nginx respondiendo en el navegador con la IP pública

---

## Diferencia IaaS vs PaaS (para defender en la presentación)

| | IaaS (EC2) | PaaS (Render) |
|--|-----------|--------------|
| Quién gestiona el hardware | AWS | Render |
| Quién instala el SO | **Tú** | Render |
| Quién configura Nginx | **Tú** | Render |
| Quién gestiona el runtime Python | **Tú** | Render |
| Quién hace el deploy | **Tú** | Render (automático) |
| Nivel de control | Alto | Bajo |
| Complejidad de gestión | Alta | Baja |

---

## Seguridad Básica de la Instancia

```bash
# Verificar actualizaciones de seguridad pendientes
sudo apt list --upgradable

# Ver logs de intentos de acceso SSH
sudo tail -100 /var/log/auth.log | grep "Failed password"

# Ver reglas del firewall (UFW)
sudo ufw status

# Habilitar UFW básico
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

> **Detener la instancia cuando no la uses** (en AWS → Actions → Stop)  
> para evitar costos inesperados, especialmente fuera del Free Tier.
