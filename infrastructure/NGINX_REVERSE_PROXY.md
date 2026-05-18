# Nginx Reverse Proxy en AWS EC2

## ¿Para qué sirve Nginx aquí?

Nginx actúa como **reverse proxy** entre el usuario/internet y el backend FastAPI.

```
Internet → Puerto 80/443 → Nginx → Puerto 8000 → FastAPI
```

Ventajas:
- Expone solo los puertos 80/443 al público.
- Puede manejar SSL/TLS (HTTPS).
- Puede servir múltiples servicios desde el mismo servidor.
- Agrega headers de seguridad.

---

## Paso 1 — Instalar Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

Verificar:

```bash
sudo systemctl status nginx
curl http://localhost
```

---

## Paso 2 — Configurar Nginx como Reverse Proxy

Crear el archivo de configuración del sitio:

```bash
sudo nano /etc/nginx/sites-available/ai-vision-api
```

Pega el siguiente contenido (ajusta el `server_name` con tu IP o dominio):

```nginx
server {
    listen 80;
    server_name IP_PUBLICA_EC2;   # Ej: 54.23.45.67 o tudominio.com

    # Encabezados de seguridad
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    # Tamaño máximo de cuerpo (para imágenes)
    client_max_body_size 10M;

    location / {
        proxy_pass         http://127.0.0.1:8000;
        proxy_http_version 1.1;

        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        # Timeout generoso para el modelo de IA
        proxy_read_timeout 120s;
        proxy_connect_timeout 10s;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://127.0.0.1:8000/api/health;
    }
}
```

---

## Paso 3 — Habilitar el sitio

```bash
# Crear enlace simbólico para habilitar el sitio
sudo ln -s /etc/nginx/sites-available/ai-vision-api /etc/nginx/sites-enabled/

# Eliminar el sitio por defecto (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Verificar la configuración de Nginx
sudo nginx -t

# Recargar Nginx para aplicar cambios
sudo systemctl reload nginx
```

Verificar que funciona:

```bash
curl http://IP_PUBLICA_EC2/api/health
```

---

## Paso 4 — HTTPS con Let's Encrypt (si tienes dominio)

Si tienes un dominio apuntando al EC2:

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tudominio.com

# El certificado se renueva automáticamente
sudo certbot renew --dry-run
```

---

## Comandos útiles de Nginx

```bash
# Verificar sintaxis de configuración
sudo nginx -t

# Recargar configuración sin reiniciar
sudo systemctl reload nginx

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver estado del servicio
sudo systemctl status nginx

# Ver logs de acceso
sudo tail -f /var/log/nginx/access.log

# Ver logs de errores
sudo tail -f /var/log/nginx/error.log
```

---

## Estructura de archivos de configuración Nginx

```
/etc/nginx/
├── nginx.conf                    # Configuración global
├── sites-available/
│   ├── default                   # Sitio por defecto
│   └── ai-vision-api             # Nuestra configuración (CREADA)
└── sites-enabled/
    └── ai-vision-api -> ../sites-available/ai-vision-api  (ENLACE)
```
