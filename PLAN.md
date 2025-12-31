# Dental SaaS - Plan de Desarrollo

## Estado Actual
- **Última fase completada:** PR #13 - Super Admin Backend
- **Fase en progreso:** PR #14 - Super Admin Frontend (pendiente)

---

## Fases Completadas

### ✅ PR #1-12: Migración Base
- API con Express + TypeScript
- Docker + PostgreSQL
- Prisma ORM con schema multi-tenant
- Sistema de autenticación con JWT
- RBAC (Role-Based Access Control)
- Frontend con React + Vite + Tailwind

### ✅ PR #13: Super Admin Backend
- [x] Rol `SUPER_ADMIN` en Prisma enum
- [x] `tenantId` opcional para superadmins
- [x] Middleware `requireSuperAdmin` y `requireAuthAsSuperAdmin`
- [x] Endpoint `/api/admin/setup` (creación única de superadmin)
- [x] Rate limiting en setup (5 intentos, 15 min lockout)
- [x] CRUD de tenants con validación IANA timezone
- [x] CRUD de usuarios cross-tenant
- [x] Estadísticas de plataforma
- [x] DELETE con confirmación (`?confirm=true`)
- [x] Validación global de email para superadmins

---

## Fases Pendientes

### ⏳ PR #14: Super Admin Frontend
- [ ] Página `/admin/setup` - Crear primer superadmin
- [ ] Página `/admin/login` - Login exclusivo superadmin
- [ ] Dashboard `/admin/dashboard` - Estadísticas de plataforma
- [ ] Gestión `/admin/tenants` - CRUD de clínicas
- [ ] Gestión `/admin/users` - CRUD de usuarios cross-tenant

### ⏳ PR #15: Dashboard Principal (Tenant)
- [ ] Vista de citas del día
- [ ] Estadísticas de la clínica
- [ ] Accesos rápidos

### ⏳ PR #16: Gestión de Pacientes
- [ ] Lista de pacientes con búsqueda/filtros
- [ ] Formulario de creación/edición
- [ ] Historial clínico
- [ ] Ficha dental

---

## Mejoras Futuras / Backlog

> Items identificados en PR #13 review para implementar en futuros PRs

### 🧪 Testing (Alta Prioridad)
- [ ] **Tests unitarios para admin routes** - Comentario PR #13
  - Tests para `/api/admin/setup`
  - Tests para `/api/admin/tenants`
  - Tests para `/api/admin/users`
  - Tests para rate limiting

### 📧 Notificaciones
- [ ] **Email de bienvenida al crear tenant** - Comentario PR #13
  - Notificar al owner cuando se crea su clínica
  - Incluir credenciales temporales o link de activación
  - Integrar con servicio de email (SendGrid, Resend, etc.)

### 📝 Auditoría
- [ ] **Audit logging para acciones de superadmin** - Comentario PR #13
  - Tabla `AuditLog` en Prisma
  - Registrar: creación/modificación/eliminación de tenants
  - Registrar: modificación de usuarios
  - Registrar: IP, timestamp, usuario, acción
  - Dashboard de auditoría para superadmin

### 📄 Paginación
- [ ] **Paginación en endpoints de lista** - Comentario PR #13
  - GET `/api/admin/tenants` - Agregar `?page=1&limit=20`
  - GET `/api/admin/users` - Agregar `?page=1&limit=20`
  - Retornar metadata: `{ data, total, page, totalPages }`

### ✅ Validación Adicional
- [ ] **Validación ISO 4217 para currency** - Comentario PR #13
  - Validar códigos de moneda (USD, EUR, MXN, etc.)
  - Lista de códigos válidos o librería de validación

### 🔒 Seguridad
- [ ] **Rate limiting con Redis** - Mejora sobre implementación actual
  - Actual: In-memory (no persiste entre reinicios)
  - Futuro: Redis para persistencia y escalabilidad

### 📊 Optimización
- [ ] **Optimizar endpoint de stats** - Comentario PR #13
  - Actual: Múltiples queries secuenciales
  - Futuro: Considerar vistas materializadas o caching

### 🎨 UX/UI
- [ ] **Confirmación visual para acciones destructivas** - Frontend
  - Modal de confirmación antes de DELETE
  - Doble confirmación para eliminar tenant con usuarios

---

## Notas de Seguridad

⚠️ **IMPORTANTE:** No hay seed file para superadmin por seguridad.

El superadmin se crea vía API:
```bash
curl -X POST http://localhost:3000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dental.com",
    "password": "SuperSecure123!",
    "firstName": "Super",
    "lastName": "Admin",
    "setupKey": "<SETUP_KEY from .env>"
  }'
```

Variables de entorno requeridas:
- `SETUP_KEY` - Clave secreta para crear superadmin (mín. 16 caracteres)

---

## Comandos Útiles

```bash
# Desarrollo
cd apps/api && pnpm dev
cd apps/web && pnpm dev

# Base de datos
pnpm prisma:generate
pnpm prisma:migrate

# Git workflow
git checkout main && git pull
git checkout -b feature/nombre-feature

# PRs
gh pr create --fill
gh pr view <number> --comments
gh pr merge -s -d
```
