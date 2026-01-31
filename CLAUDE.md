# Claude Code Instructions - Alveo System (Dental SaaS)

## Project Overview

**Nombre:** Dental Clinic Management System (SaaS) - Alveodent
**Versión Original:** Flutter + Dart + PocketBase
**Versión Destino:** React + Node.js + PostgreSQL (Multi-tenant SaaS)
**Fecha de Inicio:** 29 de Diciembre, 2025
**Autor:** Mike

Multi-tenant SaaS dental clinic management system migrated from Flutter to React/Node.js/PostgreSQL.

## Tech Stack

- **Frontend (`apps/app`):** React 19 + TypeScript + Vite + Tailwind CSS 4 + Zustand
- **Backend (`apps/api`):** Node.js 22 + Express 5 + TypeScript
- **Database (`packages/database`):** PostgreSQL + Prisma ORM
- **Shared (`packages/shared`):** Shared types and utilities
- **Monorepo:** pnpm workspaces + Turborepo

## Commands

**IMPORTANT:** Always use `pnpm`, never `npm` or `yarn`.

```bash
# Install dependencies
pnpm install

# Development (starts all apps)
pnpm dev

# Build all packages
pnpm build

# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @dental/api test
pnpm --filter @dental/app test

# Watch mode tests
pnpm --filter @dental/api test:watch
pnpm --filter @dental/app test:watch

# Lint
pnpm lint

# Database commands (run from root or packages/database)
pnpm --filter @dental/database db:migrate      # Run migrations
pnpm --filter @dental/database db:generate     # Generate Prisma client
pnpm --filter @dental/database db:studio       # Open Prisma Studio
pnpm --filter @dental/database db:seed         # Seed database
pnpm --filter @dental/database db:reset        # Reset database

# Start Docker services for local development
docker compose -f docker-compose.dev.yml up -d
```

## Project Structure

```
dental-saas/
├── apps/
│   ├── api/              # Express backend (port 5001)
│   │   ├── src/
│   │   │   ├── routes/   # API route handlers
│   │   │   ├── services/ # Business logic
│   │   │   ├── middleware/
│   │   │   ├── emails/   # Email templates (React Email)
│   │   │   ├── pdfs/     # PDF templates (@react-pdf/renderer)
│   │   │   └── utils/
│   │   └── package.json
│   ├── app/              # React frontend (port 5002)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── stores/   # Zustand stores
│   │   │   ├── lib/      # API clients, utilities
│   │   │   └── i18n/     # Internationalization (ES, EN, AR)
│   │   └── package.json
│   └── web/              # Landing page (port 5003)
├── packages/
│   ├── database/         # Prisma schema and client
│   │   └── prisma/
│   │       └── schema.prisma
│   └── shared/           # Shared TypeScript types
├── CLAUDE.md             # Development roadmap and progress
└── turbo.json
```

## Architecture Notes

### Multi-Tenant Design
- Row-Level Security: All queries filtered by `tenantId`
- JWT contains `tenantId` extracted by middleware
- Prisma Extension handles automatic tenant filtering

### Authentication
- JWT-based authentication
- Roles: OWNER, ADMIN, DOCTOR, STAFF
- Super admin uses separate routes (`/admin/*`)

### API Patterns
- Express 5 with async handlers
- Zod for request validation
- Service layer for business logic
- Integration tests use supertest

### Frontend Patterns
- Zustand for state management
- React Hook Form + Zod for forms
- Axios for API calls
- i18n with react-i18next (ES/EN/AR with RTL support)

## Testing

- **Framework:** Vitest
- **Backend:** Unit tests for services, integration tests for routes
- **Frontend:** React Testing Library + jsdom
- **Current count:** 587+ tests passing

```bash
# Run specific test file
pnpm --filter @dental/api test src/services/pdf.service.test.ts
pnpm --filter @dental/app test src/lib/pdf-api.test.ts
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

### Application Ports
- `PORT` - API server port (default: 5001)
- `VITE_APP_PORT` - App frontend port (default: 5002)
- `VITE_WEB_PORT` - Landing page port (default: 5003)

### Database & Services
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `POSTGRES_PORT` - PostgreSQL port (default: 5432)
- `REDIS_PORT` - Redis port (default: 6379)

### Authentication & Security
- `JWT_SECRET` - JWT signing secret (min 32 characters)
- `JWT_ACCESS_EXPIRES_IN` - Access token expiration (default: 15m)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (default: 7d)
- `SETUP_KEY` - Super admin setup key (min 16 characters)

### External Services
- `RESEND_API_KEY` - Email service (Resend)
- `EMAIL_FROM` - Email sender address

### Other
- `NODE_ENV` - Environment (development/production/test)
- `CORS_ORIGIN` - Allowed CORS origin (cannot be "*" in production)
- `VITE_API_URL` - API URL for frontend apps

## Git Workflow

- Main branch: `main`
- Feature branches: `feat/feature-name` or `feature/feature-name`
- PRs to `main` with descriptive titles
- Commits co-authored by Claude Code

## Code Style

- TypeScript strict mode
- ESLint + Prettier
- Spanish for user-facing strings (i18n keys)
- English for code, comments, and commits
- No emojis in code unless explicitly requested

## Quick Reference

| App | Port | Env Variable | Package Name |
|-----|------|--------------|--------------|
| API | 5001 | `PORT` | @dental/api |
| App | 5002 | `VITE_APP_PORT` | @dental/app |
| Web | 5003 | `VITE_WEB_PORT` | @dental/web |

**Note:** All ports are configurable via `.env` file.

---

## Development Progress

| Fase | Descripcion | Estado | PRs |
|------|-------------|--------|-----|
| 0 | Configuracion del Proyecto | DONE | #1-3 |
| 1 | Core Multi-Tenant y Modelos | DONE | #4-8 |
| 2 | Registro de Tenants y Auth | DONE | #9-14, #44-48, #72 |
| 3 | Gestion de Doctores | DONE | #55 |
| 4 | Gestion de Pacientes + Dental Chart | DONE | #56, #63, #64 |
| 5 | Gestion de Citas | DONE (CRUD) | #59 |
| 6 | Labworks y Expenses | DONE | #60 |
| 7 | Estadisticas y Dashboard | DONE | #61, #62 |
| 8 | Suscripciones y Pagos (dLocal) | DEFERRED | #65 |
| 9 | Configuracion del Tenant | DONE | #66, #67 |
| 10 | Export Data | DONE | #68 |
| 11 | Generacion de PDFs | DONE | #69, #70 |
| 12 | Internacionalizacion (i18n) | DONE | #71 |
| 13 | Landing Page completa | DONE | #73-78 |
| 14 | Testing | DONE | #79-101 |
| 15 | Documentacion y Deploy | DONE | #102-103 |

---

## Pending Tasks

### Global Pending Items

#### Rate Limiting (Phase 2)
- [ ] 2.2.11: Implementar rate limiting con Redis
- [ ] 2.2.A.6: Rate limiting para password recovery (3 intentos por IP en 15 min)

#### Appointment Images (Phase 5)
- [ ] 5.2.1: Configurar Multer para uploads
- [ ] 5.2.2: Crear servicio de almacenamiento (S3)
- [ ] 5.2.3: Crear servicio de tracking de storage por tenant
- [ ] 5.2.4: Crear middleware de verificacion de limite de storage
- [ ] 5.2.5-5.2.8: Endpoints de imagenes

#### Deferred Items
- [ ] 2.4.5: Flujo de onboarding inicial
- [ ] 2.5.9: Pagina de perfil de usuario
- [ ] 3.2.8: DoctorPicker (Combobox con busqueda)
- [ ] 5.3.1: FullCalendar (usando vista custom por ahora)
- [ ] 5.3.4: Vista semanal de calendario
- [ ] 5.4.8: Componente de prescripciones
- [ ] 13.5.A: og-image.png (1200x630px) para apps/web/public/

---

### Phase 8: Subscriptions and Payments (dLocal) - DEFERRED

#### ✅ Task 8.1: Backend - Plans and Limits Service (PR #65)
#### Task 8.2: Backend - dLocal Integration - DEFERRED
#### Task 8.3: Frontend - Billing UI - DEFERRED

---

### Phase 13: Landing Page and Marketing - DONE
**PRs:** #73-78

---

### Phase 14: Testing - DONE
**PRs:** #79-101
**Final state:** 338 backend tests + 851 frontend tests + 4 E2E suites with Playwright

#### ✅ Epic 14.1: Frontend Unit Tests - Zustand Stores (PRs #79-85)
#### ✅ Epic 14.2: Frontend Unit Tests - API Clients (PRs #86-92)
#### ✅ Epic 14.3: Frontend Unit Tests - Hooks & Utils (PR #93)
#### ✅ Epic 14.4: Frontend Component Tests - Auth (PR #94)
#### ✅ Epic 14.5: Frontend Component Tests - CRUD Pages (PRs #95-98)
#### ✅ Epic 14.6: Frontend Component Tests - Forms & UI (PRs #99-100) - Epic 14.6.2 DEFERRED
#### ✅ Epic 14.7: E2E Tests with Playwright (PR #101)

---

### Phase 15: Documentation and Deploy - DONE
**PRs:** #102-103, #105-107

#### ✅ Task 15.1: Documentation (PR #102)
Complete documentation suite: INSTALLATION.md, ENVIRONMENT.md, DEVELOPMENT.md, API.md, README.md

#### ✅ Task 15.2: Production Preparation (PR #103)
CI/CD pipeline, PRODUCTION.md guide, backup/restore scripts, .env.production.example, SSL setup

#### ✅ Task 15.3: Production Deployment Fixes (PRs #105-107)
**PR #105:** Fixed CI pipeline issues
- Excluded test files from production build (tsconfig.app.json)
- Fixed pnpm version conflict in GitHub Actions
- Added ESLint config for apps/web
- Fixed DATABASE_URL for Prisma generation in CI
- Relaxed linting rules (no-explicit-any, no-unused-vars as warnings)
- All CI checks passing: Lint ✅, Test Backend (338) ✅, Test Frontend (851) ✅, Build ✅

**PR #106:** URL-encoded database passwords in connection strings
- Added POSTGRES_PASSWORD_ENCODED and REDIS_PASSWORD_ENCODED variables
- Fixed DATABASE_URL and REDIS_URL to use URL-encoded passwords
- Plain passwords (/, +, =) were breaking URL parsing
- docs/PRODUCTION-PASSWORD-FIX.md with migration guide

**PR #107:** Hotfix for API startup crash loop
- Removed automatic migrations from container startup
- API now starts directly without wait-for-db.sh script
- Migrations applied manually in production (14 tables)
- Future migrations run via Coolify post-deployment hook or manually

**PR #111:** Added favicon to app (PR #111)
- Copied favicon.svg from apps/web to apps/app
- Updated index.html to use /favicon.svg
- Consistent branding across web and app

**PR #110:** Fixed PostgreSQL DNS conflict (PR #110)
- Renamed PostgreSQL service from "postgres" to "dental-postgres"
- Resolved DNS conflict with Coolify's PostgreSQL instance
- Updated DATABASE_URL to use new hostname
- Fixed authentication errors in production

**PR #112:** Fixed dropdown menu positioning in tables
- Created useDropdownPosition hook for viewport-aware positioning
- Updated AdminUsersPage and AdminTenantsPage
- Dropdowns now open upward when near bottom of viewport
- Fixes visual bug where menus were cut off by pagination

**PR #113:** Fixed dropdown overflow with fixed positioning
- Changed dropdown positioning from absolute to fixed
- Calculate exact coordinates using getBoundingClientRect()
- Dropdowns no longer clipped by table's overflow-hidden
- Works correctly with both many and few table records
- Proper state cleanup in all close scenarios

**PR #114:** Added Uruguayan peso (UYU) currency and Montevideo timezone
- Added UYU (Peso Uruguayo) to currencies list
- Added America/Montevideo to timezones list
- Sorted currencies alphabetically for better UX
- Enables proper regional settings for Uruguayan clinics

---

## SaaS Business Model

### Subscription Plans

| Feature | Free | Basic | Enterprise |
|---------|------|-------|------------|
| **Price** | $0/month | $5.99/month | $11.99/month |
| **Administrators** | 1 | 2 | 5 |
| **Doctors** | 3 | 5 | 10 |
| **Patients** | 15 | 25 | 60 |
| **Storage** | 100MB | 1GB | 5GB |
| **Support** | Community | Email | Priority |
| **Backups** | Manual | Daily | Daily + Export |

---

## Future Improvements / Backlog

### High Priority
- [ ] Rate limiting with Redis (persistence and scalability)
- [ ] E2E tests for admin panel
- [ ] Welcome email when creating tenant

### Medium Priority
- [ ] Audit logging for superadmin actions
- [ ] Pagination in admin endpoints
- [ ] 2FA for super admin
- [ ] Dark mode toggle

### Low Priority
- [ ] Dashboard with real-time metrics (WebSocket)
- [ ] Soft delete for tenants
- [ ] Export tenant data before deletion

---

## Future Enhancement: Separate Table for Dental Chart (v2)

**When to migrate:** When treatment history, structured conditions, or aggregated reports are needed.

```prisma
model ToothRecord {
  id          String   @id @default(cuid())
  patientId   String
  toothNumber String   // ISO 3950 (FDI)
  condition   ToothCondition?
  notes       String?
  treatment   String?
  severity    Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String

  @@unique([patientId, toothNumber])
}

enum ToothCondition {
  HEALTHY, CARIES, FILLED, CROWN, EXTRACTION_NEEDED, MISSING, IMPLANT, ROOT_CANAL, BRIDGE
}
```

---

## Security Notes

### Super Admin
- No seed file (credentials never in repo)
- SETUP_KEY required, auto-disable after first use
- Separate routes: `/admin/*` vs `/:clinicSlug/*`

### Multi-Tenant
- Row-Level Security with `WHERE tenant_id = ?`
- Middleware extracts tenantId from JWT
- Prisma Extension for automatic filtering

---

## Coolify Deployment

> **WORKING** - PRs #33-36, #38-40, #43
>
> **Guide**: [docs/COOLIFY-DEPLOYMENT.md](docs/COOLIFY-DEPLOYMENT.md)
> **Troubleshooting**: [docs/COOLIFY-TROUBLESHOOTING.md](docs/COOLIFY-TROUBLESHOOTING.md)

---

*Last update: 31 January, 2026 - Production fixes: DNS conflict resolution, favicon addition, and dropdown menu positioning*
