# 🚨 Coolify Deployment - Troubleshooting Guide

> Guía de resolución de problemas identificados durante el deployment a Coolify.

## ✅ Estado Actual: FUNCIONANDO

**Última actualización:** 4 de Enero, 2026

---

## PRs de Fixes Aplicados

| PR  | Descripción                           | Problema Resuelto                                              |
| --- | ------------------------------------- | -------------------------------------------------------------- |
| #33 | Add initial Prisma migrations         | Error P1000 - faltaba directorio `prisma/migrations/`          |
| #34 | Use unique hostname `dental-postgres` | DNS conflict con `coolify-db` que también usa alias `postgres` |
| #35 | Use VITE_API_URL for health check     | HomePage llamaba a `/api/health` relativo al frontend          |
| #36 | Allow http in CSP for staging         | CSP bloqueaba conexiones HTTP al API en staging                |
| #20 | Fix VITE_API_URL inconsistency        | Admin setup 404 - API clients usaban URL inconsistente         |

---

## 🔧 Problemas Conocidos y Soluciones

### 1. Error P1000: Authentication Failed

**Síntomas:**
- API container se reinicia constantemente
- Logs muestran `P1000: Authentication failed against database server`

**Causa Raíz:**
El directorio `prisma/migrations/` no existía en el repositorio. Durante desarrollo se usó `prisma db push` pero producción requiere `prisma migrate deploy`.

**Solución:**
```bash
cd packages/database
pnpm prisma migrate dev --name initial_schema
git add prisma/migrations/
git commit -m "feat: add initial database migrations"
git push
```

---

### 2. DNS Conflict: postgres hostname

**Síntomas:**
- API conecta al PostgreSQL incorrecto
- Credenciales son correctas pero autenticación falla

**Causa Raíz:**
La red `coolify` tiene `coolify-db` (PostgreSQL interno de Coolify) con alias `postgres`. Cuando el API resuelve `postgres`, obtiene la IP de `coolify-db`.

**Diagnóstico:**
```bash
# Desde la red coolify, 'postgres' resuelve a coolify-db
docker run --rm --network=coolify postgres:16-alpine getent hosts postgres
# Resultado: fd70:6387:7084::4  postgres  (IP de coolify-db, NO tu postgres)

# Verificar alias de coolify-db
docker inspect coolify-db --format '{{range .NetworkSettings.Networks}}{{.Aliases}}{{end}}'
# Resultado: [coolify-db postgres]
```

**Solución:**
Usar hostname único en `docker-compose.yml`:
```yaml
services:
  postgres:
    image: postgres:16-alpine
    hostname: dental-postgres  # Hostname único
    
  api:
    environment:
      DATABASE_URL: postgresql://...@dental-postgres:5432/...  # Usar hostname único
```

---

### 3. CSP Blocking API Calls

**Síntomas:**
- Console error: `violates Content Security Policy directive: "connect-src 'self' https:"`
- Health check y login fallan en browser pero funcionan con curl

**Causa Raíz:**
El CSP en `nginx.conf` solo permitía conexiones HTTPS, pero staging usa HTTP.

**Solución:**
Agregar `http:` a `connect-src` en `apps/web/nginx.conf`:
```nginx
add_header Content-Security-Policy "... connect-src 'self' https: http:; ..." always;
```

> ⚠️ **Nota de Seguridad:** Cuando se configure SSL, revertir a `https:` only.

---

### 4. Admin Setup retorna 404

**Síntomas:**
- Página `/admin/setup` carga correctamente
- Al verificar status o enviar formulario: Error 404
- Request va a `http://<web-domain>/admin/setup` en lugar de `http://<api-domain>/api/admin/setup`

**Causa Raíz:**
La variable `VITE_API_URL` no estaba configurada o llegaba vacía durante el build. El código tenía inconsistencia: algunos archivos asumían que `VITE_API_URL` incluía `/api` y otros no.

**Solución:**
1. Configurar `VITE_API_URL` en Coolify como **URL base SIN `/api`**:
   ```
   VITE_API_URL=http://api-xxxx.your-server.sslip.io
   ```
   (No incluir `/api` al final)

2. El código ahora añade `/api` explícitamente:
   - `api.ts`: `baseURL: ${API_BASE_URL}/api`
   - `admin-api.ts`: `baseURL: ${API_BASE_URL}/api/admin`

**Verificación:**
```bash
# El request debe ir a la API, no al frontend
curl http://<api-domain>/api/admin/setup
# Debe retornar: {"setupAvailable": true/false, ...}
```

---

### 5. Gateway Timeout después de Deploy

**Síntomas:**
- API responde internamente (`docker exec ... wget`)
- Acceso público vía dominio da timeout
- Ocurre después de cada redeploy

**Causa Raíz:**
Traefik (reverse proxy) mantiene cache de los backends y puede apuntar a contenedores que ya no existen después de un redeploy.

**Solución Inmediata:**
```bash
ssh $COOLIFY_SSH_USER@$COOLIFY_SSH_HOST "docker restart coolify-proxy"
```

**Solución Permanente: Post-Deployment Hook (RECOMENDADO):**

1. Ve a **Coolify UI → Applications → AlveoDent App**
2. Navega a **Advanced → Deployment**
3. En **Post Deployment Command**, ingresa:
   ```
   docker restart coolify-proxy
   ```
4. Guarda los cambios

Esto reiniciará automáticamente el proxy después de cada deploy, asegurando que Traefik recargue sus rutas.

**Prevención Adicional (Implementado en docker-compose.yml):**

1. **`stop_grace_period: 30s`** - Da tiempo a Traefik para detectar que el contenedor se está apagando
2. **Docker healthcheck** - Verifica `/api/health` cada 10s con 30s de start_period
3. **Traefik labels** - Configura healthcheck en el load balancer

```yaml
# docker-compose.yml - api service
stop_grace_period: 30s
healthcheck:
  test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
labels:
  - "traefik.http.services.api.loadbalancer.healthcheck.path=/api/health"
  - "traefik.http.services.api.loadbalancer.healthcheck.interval=10s"
  - "traefik.http.services.api.loadbalancer.healthcheck.timeout=5s"
```

---

## 📋 Variables de Entorno Requeridas

```ini
# Service Discovery (generadas por Coolify)
SERVICE_FQDN_API=<api-subdomain>.<server-ip>.sslip.io
SERVICE_FQDN_WEB=<web-subdomain>.<server-ip>.sslip.io
SERVICE_URL_API=https://<api-subdomain>.<server-ip>.sslip.io
SERVICE_URL_WEB=https://<web-subdomain>.<server-ip>.sslip.io
# Nota: use URLs http:// solo para desarrollo estrictamente local.
# En staging/producción, siempre exponga el tráfico a través de HTTPS.

# Database (REQUERIDO - generar valores seguros)
POSTGRES_DB=dental_saas
POSTGRES_USER=<secure-username>
POSTGRES_PASSWORD=<32-char-hex-password>

# Redis (REQUERIDO)
REDIS_PASSWORD=<32-char-hex-password>

# Auth (REQUERIDO - generar con openssl rand -hex 32)
JWT_SECRET=<64-char-hex-secret>
JWT_REFRESH_SECRET=<64-char-hex-secret>
SETUP_KEY=<32-char-hex-key>

# Frontend
CORS_ORIGIN=https://<web-subdomain>.<server-ip>.sslip.io
VITE_API_URL=https://<api-subdomain>.<server-ip>.sslip.io
```

### Generar Secretos Seguros

```bash
# Password de 32 caracteres hex
openssl rand -hex 16

# Secret de 64 caracteres hex
openssl rand -hex 32
```

---

## 🔐 Acceso SSH para Debugging

### Configuración
```bash
# Variables de entorno (agregar a ~/.zshrc o ~/.bashrc)
export COOLIFY_SSH_USER="root"
export COOLIFY_SSH_HOST="<server-ip>"
export COOLIFY_SSH_KEY_PATH="$HOME/.ssh/coolify/id_rsa"
```

### Comandos Útiles

```bash
# Conectar al servidor
ssh -i $COOLIFY_SSH_KEY_PATH $COOLIFY_SSH_USER@$COOLIFY_SSH_HOST

# Ver estado de contenedores (reemplazar <project-prefix> con el prefijo de tu proyecto)
ssh -i $COOLIFY_SSH_KEY_PATH $COOLIFY_SSH_USER@$COOLIFY_SSH_HOST \
  "docker ps --filter 'name=<project-prefix>' --format '{{.Names}} - {{.Status}}'"

# Ver logs del API
ssh -i $COOLIFY_SSH_KEY_PATH $COOLIFY_SSH_USER@$COOLIFY_SSH_HOST \
  "docker logs <api-container-name> --tail 50"

# Probar health desde dentro del contenedor
ssh -i $COOLIFY_SSH_KEY_PATH $COOLIFY_SSH_USER@$COOLIFY_SSH_HOST \
  "docker exec <api-container-name> wget -qO- http://localhost:3000/api/health"

# Reiniciar Traefik (fix gateway timeout)
ssh -i $COOLIFY_SSH_KEY_PATH $COOLIFY_SSH_USER@$COOLIFY_SSH_HOST \
  "docker restart coolify-proxy"
```

---

## 🧹 Limpieza Completa (Nuclear Option)

Si todo falla, limpiar y redesplegar desde cero:

```bash
# Conectar al servidor
ssh -i $COOLIFY_SSH_KEY_PATH $COOLIFY_SSH_USER@$COOLIFY_SSH_HOST

# Identificar el project ID (buscar el prefijo común en los nombres de contenedores)
docker ps -a --format '{{.Names}}' | grep -oE '^[a-z0-9]+' | sort | uniq -c | sort -rn | head -5

# Parar y eliminar todo del proyecto (reemplazar con tu PROJECT_ID)
PROJECT_ID="<your-project-id>"
docker ps -a --format '{{.ID}}' --filter "name=$PROJECT_ID" | xargs -r docker rm -f
docker volume ls --format '{{.Name}}' | grep "$PROJECT_ID" | xargs -r docker volume rm
docker images --format '{{.ID}}' --filter "reference=${PROJECT_ID}*" | xargs -r docker rmi -f
docker system prune -f

# Luego hacer redeploy desde Coolify UI
```

---

## 📊 Criterios de Éxito

| Check              | Comando                       | Resultado Esperado                              |
| ------------------ | ----------------------------- | ----------------------------------------------- |
| API running        | `docker ps --filter name=api` | Status: Up (no restarting)                      |
| Health endpoint    | `curl <API_URL>/api/health`   | `{"status":"ok"}`                               |
| DB connected       | Ver logs del API              | "🚀 API server running on http://localhost:3000" |
| Frontend loads     | Abrir `<WEB_URL>` en browser  | Página carga sin errores                        |
| Health check works | Ver console del browser       | Sin errores de CSP o fetch                      |

---

## 📚 Referencias

- [Prisma P1000 Error Documentation](https://www.prisma.io/docs/reference/api-reference/error-reference#p1000)
- [Coolify Docker Compose Documentation](https://coolify.io/docs/applications/docker-compose)
- [Traefik Healthcheck Configuration](https://doc.traefik.io/traefik/routing/services/#health-check)
- [Content Security Policy Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

## 🖥️ Desarrollo Local - Troubleshooting

### Docker/Colima no está corriendo

**Síntomas:**
- Error 500 en endpoints que usan base de datos
- Logs: `Can't reach database server at 127.0.0.1:5432`
- Error: `failed to connect to the docker API at unix:///Users/.../.colima/default/docker.sock`

**Causa:**
Docker (Colima en macOS) no está iniciado, por lo que PostgreSQL y Redis no están disponibles.

**Solución:**
```bash
# 1. Iniciar Colima (macOS)
colima start

# 2. Levantar contenedores de desarrollo
cd dental-saas
docker-compose -f docker-compose.dev.yml up -d

# 3. Verificar que PostgreSQL está corriendo
docker exec dental-postgres pg_isready -U dental -d dental_saas

# 4. Reiniciar el servidor API
cd apps/api && pnpm dev
```

**Nota:** Usar `docker-compose.dev.yml` para desarrollo local, NO `docker-compose.yml` (que es para producción/Coolify).

---

*Última actualización: 5 de Enero, 2026*
