# 🚀 Guía de Deployment en Coolify - Dental SaaS

## Índice
1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Arquitectura de Servicios](#arquitectura-de-servicios)
3. [Requisitos Previos](#requisitos-previos)
4. [Configuración de Coolify](#configuración-de-coolify)
5. [Variables de Entorno](#variables-de-entorno)
6. [Dockerfiles](#dockerfiles)
7. [Paso a Paso del Deployment](#paso-a-paso-del-deployment)
8. [Configuración de Dominio y SSL](#configuración-de-dominio-y-ssl)
9. [Verificación Post-Deploy](#verificación-post-deploy)
10. [Troubleshooting](#troubleshooting)

---

## Resumen del Proyecto

| Componente | Tecnología | Puerto |
|------------|------------|--------|
| **Frontend (web)** | React 19 + Vite + Tailwind CSS 4 | 5173 (dev) / 80 (prod) |
| **Backend (api)** | Node.js 22 + Express 5 + TypeScript | 3000 |
| **Base de Datos** | PostgreSQL 16 | 5432 |
| **Cache/Sessions** | Redis 7 | 6379 |
| **ORM** | Prisma 7 | - |

### Estructura del Monorepo
```
dental-saas/
├── apps/
│   ├── api/          # Backend Express
│   └── web/          # Frontend React
├── packages/
│   ├── database/     # Prisma schema y migraciones
│   └── shared/       # Tipos compartidos
└── docker-compose.yml
```

---

## Arquitectura de Servicios

```
┌─────────────────────────────────────────────────────────────────┐
│                         COOLIFY                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐     ┌─────────────┐                            │
│  │   Web App   │────▶│   API App   │                            │
│  │   (React)   │     │  (Express)  │                            │
│  │  :80/443    │     │   :3000     │                            │
│  └─────────────┘     └──────┬──────┘                            │
│                             │                                    │
│              ┌──────────────┴──────────────┐                    │
│              ▼                             ▼                    │
│       ┌─────────────┐              ┌─────────────┐              │
│       │  PostgreSQL │              │    Redis    │              │
│       │    :5432    │              │    :6379    │              │
│       └─────────────┘              └─────────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Requisitos Previos

### En tu servidor Coolify
- [ ] Coolify v4+ instalado y funcionando
- [ ] Acceso SSH al servidor
- [ ] Dominio configurado (ej: `dental-app.com`)
- [ ] Subdominios para API (ej: `api.dental-app.com`)

### En el repositorio
- [ ] Dockerfiles creados (ver sección [Dockerfiles](#dockerfiles))
- [ ] Variables de entorno documentadas
- [ ] Build scripts funcionando (`pnpm build`)

---

## Configuración de Coolify

### Opción A: Docker Compose (Recomendada)

Coolify soporta docker-compose nativamente. Necesitamos crear un `docker-compose.prod.yml`:

```yaml
# docker-compose.prod.yml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - dental-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    # NOTA DE SEGURIDAD: La password será visible en `docker inspect`.
    # Para producción de alto riesgo, considerar usar Redis ACL o secrets de Docker.
    command: ["redis-server", "--requirepass", "${REDIS_PASSWORD}", "--appendonly", "yes"]
    volumes:
      - redis_data:/data
    networks:
      - dental-network
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: ./apps/api/Dockerfile
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      CORS_ORIGIN: ${CORS_ORIGIN}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      SETUP_KEY: ${SETUP_KEY}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - dental-network

  web:
    build:
      context: .
      dockerfile: ./apps/web/Dockerfile
      args:
        VITE_API_URL: ${VITE_API_URL}
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - api
    networks:
      - dental-network

networks:
  dental-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

### Opción B: Servicios Separados

Crear cada servicio individualmente en Coolify:

1. **PostgreSQL** - Usar el servicio de base de datos de Coolify
2. **Redis** - Usar el servicio de Redis de Coolify  
3. **API** - Aplicación Docker con Dockerfile
4. **Web** - Aplicación Docker con Dockerfile

---

## Variables de Entorno

### Variables Requeridas (Producción)

```bash
# ===========================================
# BASE DE DATOS (PostgreSQL)
# ===========================================
POSTGRES_DB=dental_saas
POSTGRES_USER=dental
POSTGRES_PASSWORD=<generar-con-openssl-rand-base64-32>

# ===========================================
# REDIS
# ===========================================
REDIS_PASSWORD=<generar-con-openssl-rand-base64-32>

# ===========================================
# API (Backend)
# ===========================================
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://dental:<POSTGRES_PASSWORD>@postgres:5432/dental_saas?schema=public
REDIS_URL=redis://:<REDIS_PASSWORD>@redis:6379
CORS_ORIGIN=https://dental-app.com

# JWT (CRÍTICO: Generar secrets únicos)
JWT_SECRET=<generar-con-openssl-rand-base64-64>
JWT_REFRESH_SECRET=<generar-con-openssl-rand-base64-64>

# Super Admin Setup
SETUP_KEY=<clave-secreta-16-caracteres-minimo>

# ===========================================
# FRONTEND (Build-time)
# ===========================================
VITE_API_URL=https://api.dental-app.com
```

### Generar Secrets Seguros

```bash
# Para passwords de DB
openssl rand -base64 32

# Para JWT secrets (más largos)
openssl rand -base64 64

# Para SETUP_KEY
openssl rand -hex 16
```

---

## Dockerfiles

### Dockerfile para API (apps/api/Dockerfile)

```dockerfile
# apps/api/Dockerfile
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ============================================
# STAGE 1: Install dependencies
# ============================================
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# ============================================
# STAGE 2: Build
# ============================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .

# Generate Prisma client
WORKDIR /app/packages/database
RUN pnpm db:generate

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build

# Build API
WORKDIR /app/apps/api
RUN pnpm build

# ============================================
# STAGE 3: Production
# ============================================
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/database/generated ./packages/database/generated
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Install production dependencies only
# NOTA: En monorepos pnpm, --prod puede fallar al resolver dependencias internas.
# Si hay errores de módulos faltantes, usar: pnpm install --frozen-lockfile (sin --prod)
RUN pnpm install --prod --frozen-lockfile

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 api
USER api

WORKDIR /app/apps/api
EXPOSE 3000

# Run migrations and start
CMD ["sh", "-c", "cd /app/packages/database && npx prisma migrate deploy && cd /app/apps/api && node dist/index.js"]
```

### Dockerfile para Web (apps/web/Dockerfile)

```dockerfile
# apps/web/Dockerfile
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ============================================
# STAGE 1: Install dependencies
# ============================================
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# ============================================
# STAGE 2: Build
# ============================================
FROM base AS builder
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build

# Build web app
WORKDIR /app/apps/web
RUN pnpm build

# ============================================
# STAGE 3: Production with Nginx
# ============================================
FROM nginx:alpine AS runner

# Copy nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Create non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Config (apps/web/nginx.conf)

```nginx
# apps/web/nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    # Content-Security-Policy - Ajustar según las necesidades del frontend
    # (puede requerir 'unsafe-inline' para algunos frameworks CSS-in-JS)
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self';" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback - all routes go to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
```

---

## Paso a Paso del Deployment

### 1. Preparar el Repositorio

```bash
# 1. Crear los Dockerfiles (ver sección anterior)
mkdir -p apps/api apps/web

# 2. Crear nginx.conf para el frontend
# (copiar contenido de la sección anterior)

# 3. Crear docker-compose.prod.yml
# (copiar contenido de la sección anterior)

# 4. Commit y push
git add .
git commit -m "chore: add production Dockerfiles for Coolify deployment"
git push origin main
```

### 2. Configurar Coolify

#### A) Crear Proyecto
1. En Coolify Dashboard → **New Project**
2. Nombre: `dental-saas`
3. Descripción: `Dental Clinic Management System`

#### B) Agregar PostgreSQL
1. En el proyecto → **New Resource** → **Database** → **PostgreSQL**
2. Configurar:
   - Name: `dental-postgres`
   - Version: `16-alpine`
   - Database: `dental_saas`
   - Username: `dental`
   - Password: `<GENERATE>`
3. **Deploy**
4. Copiar la **connection string interna**

#### C) Agregar Redis
1. **New Resource** → **Database** → **Redis**
2. Configurar:
   - Name: `dental-redis`
   - Version: `7-alpine`
   - Password: `<GENERATE>`
3. **Deploy**
4. Copiar la **connection string interna**

#### D) Agregar API (Backend)
1. **New Resource** → **Application**
2. Source: **GitHub** (conectar repo)
3. Configurar:
   - Name: `dental-api`
   - Branch: `main`
   - Build Pack: **Dockerfile**
   - Dockerfile Location: `./apps/api/Dockerfile`
   - Base Directory: `/`
4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<connection-string-postgres-interna>
   REDIS_URL=<connection-string-redis-interna>
   CORS_ORIGIN=https://dental-app.com
   JWT_SECRET=<generar>
   JWT_REFRESH_SECRET=<generar>
   SETUP_KEY=<generar>
   ```
5. **Domain:** `api.dental-app.com`
6. **Port:** `3000`
7. **Deploy**

#### E) Agregar Web (Frontend)
1. **New Resource** → **Application**
2. Source: **GitHub** (mismo repo)
3. Configurar:
   - Name: `dental-web`
   - Branch: `main`
   - Build Pack: **Dockerfile**
   - Dockerfile Location: `./apps/web/Dockerfile`
   - Base Directory: `/`
4. **Build Arguments:**
   ```
   VITE_API_URL=https://api.dental-app.com
   ```
5. **Domain:** `dental-app.com`
6. **Port:** `80`
7. **Deploy**

### 3. Post-Deployment

```bash
# 1. Verificar que la API está corriendo
curl https://api.dental-app.com/health

# 2. Configurar Super Admin
# Navegar a https://dental-app.com/admin/setup

# 3. Verificar frontend
# Navegar a https://dental-app.com
```

---

## Configuración de Dominio y SSL

### En Coolify
Coolify genera certificados SSL automáticamente con Let's Encrypt.

1. Ir a cada servicio → **Settings** → **Domain**
2. Configurar:
   - Web: `dental-app.com` y `www.dental-app.com`
   - API: `api.dental-app.com`
3. Habilitar **SSL** y **Force HTTPS**

### DNS (en tu proveedor de dominio)

```
# Tipo A para el dominio principal
dental-app.com       A     <IP-SERVIDOR-COOLIFY>
www.dental-app.com   A     <IP-SERVIDOR-COOLIFY>
api.dental-app.com   A     <IP-SERVIDOR-COOLIFY>

# O usar CNAME si tienes un hostname de Coolify
dental-app.com       CNAME your-coolify-hostname.com
```

---

## Verificación Post-Deploy

### Checklist

- [ ] **PostgreSQL**
  - [ ] Servicio running
  - [ ] Healthcheck passing
  - [ ] Backups configurados

- [ ] **Redis**
  - [ ] Servicio running
  - [ ] Healthcheck passing

- [ ] **API**
  - [ ] Health endpoint: `curl https://api.dental-app.com/health`
  - [ ] Logs sin errores
  - [ ] Conexión a DB verificada
  - [ ] Migraciones aplicadas

- [ ] **Web**
  - [ ] App carga correctamente
  - [ ] Login funciona
  - [ ] Super Admin setup completado

- [ ] **SSL**
  - [ ] Certificados válidos
  - [ ] HTTPS forzado
  - [ ] Mixed content check

---

## Troubleshooting

### Error: "Cannot connect to database"

```bash
# Verificar que postgres está running
docker ps | grep postgres

# Verificar connection string (en Coolify)
# La URL interna debe usar el nombre del servicio, no localhost
# ✅ postgresql://dental:pass@dental-postgres:5432/dental_saas
# ❌ postgresql://dental:pass@localhost:5432/dental_saas
```

### Error: "Prisma migrate deploy failed"

```bash
# Conectar al contenedor de API
docker exec -it <container-id> sh

# Ejecutar migraciones manualmente
cd /app/packages/database
npx prisma migrate deploy
```

### Error: "CORS error" en frontend

Verificar que `CORS_ORIGIN` en la API coincide con el dominio del frontend:
```
CORS_ORIGIN=https://dental-app.com
```

### Error: Build falla por memoria

En Coolify, aumentar recursos del servidor o ajustar límites:
- Settings → Resources → Memory Limit: 2GB+

### Logs

```bash
# Ver logs de un servicio en Coolify
# Dashboard → Service → Logs

# O via SSH
docker logs <container-name> -f --tail 100
```

---

## Próximos Pasos

1. [ ] Configurar backups automáticos de PostgreSQL
2. [ ] Configurar monitoring (Uptime Kuma o similar)
3. [ ] Configurar alertas de errores (Sentry)
4. [ ] Configurar CDN para assets estáticos
5. [ ] Configurar rate limiting en producción
6. [ ] Documentar proceso de rollback

---

## Referencias

- [Coolify Documentation](https://coolify.io/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
