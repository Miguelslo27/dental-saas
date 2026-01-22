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
│   ├── api/              # Express backend (port 3000)
│   │   ├── src/
│   │   │   ├── routes/   # API route handlers
│   │   │   ├── services/ # Business logic
│   │   │   ├── middleware/
│   │   │   ├── emails/   # Email templates (React Email)
│   │   │   ├── pdfs/     # PDF templates (@react-pdf/renderer)
│   │   │   └── utils/
│   │   └── package.json
│   ├── app/              # React frontend (port 5173)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── stores/   # Zustand stores
│   │   │   ├── lib/      # API clients, utilities
│   │   │   └── i18n/     # Internationalization (ES, EN, AR)
│   │   └── package.json
│   └── web/              # Landing page (port 5174)
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
- **Current count:** 338+ tests passing

```bash
# Run specific test file
pnpm --filter @dental/api test src/services/pdf.service.test.ts
pnpm --filter @dental/app test src/lib/pdf-api.test.ts
```

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `RESEND_API_KEY` - Email service (Resend)

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

| App | Port | Package Name |
|-----|------|--------------|
| API | 3000 | @dental/api |
| App | 5173 | @dental/app |
| Web | 5174 | @dental/web |

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
| 13 | Landing Page completa | PENDING | - |
| 14 | Testing E2E | PENDING | - |
| 15 | Documentacion y Deploy | PENDING | - |

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

---

### Phase 8: Subscriptions and Payments (dLocal) - DEFERRED

> **BUSINESS DECISION (13 January 2026):**
> Subscriptions will be **free indefinitely** until the project reaches a stable version.
> All tenants will have access to the "enterprise" plan without limit restrictions.
> dLocal integration will resume when the product is ready for monetization.

## ✅ Task 8.1: Backend - Plans and Limits Service (PR #65)

#### Task 8.2: Backend - dLocal Integration - DEFERRED
Resume when:
- Product is at stable version (v1.0)
- dLocal credentials are available
- Pricing strategy is defined

#### Task 8.3: Frontend - Billing UI - DEFERRED
Resume together with Task 8.2

---

### Phase 13: Landing Page and Marketing - PENDING

> **Current state of `apps/web`:**
> - React 19 + Vite + Tailwind CSS 4 + @tailwindcss/typography
> - Pages: HomePage, PricingPage, TermsPage, PrivacyPage, CookiesPage
> - Routes: `/`, `/precios`, `/terminos`, `/privacidad`, `/cookies`
> - Components: Header, Footer, FAQ, Testimonials, LegalLayout

## ✅ Task 13.1: Color Standardization (PR #73)

## ✅ Task 13.2: Reusable FAQ Component (PR #74)

## ✅ Task 13.3: Testimonials Section (PR #75)

## ✅ Task 13.4: Legal Pages (PR #76)

#### Task 13.5: SEO and Meta Tags (PR #77)
**Branch:** `feat/landing-seo`

Improve SEO with Open Graph, Twitter Cards, and structured data.

- [ ] 13.5.1: Update `apps/web/index.html` - Open Graph meta tags
- [ ] 13.5.2: Add Twitter Card meta tags
- [ ] 13.5.3: Add Schema.org structured data (SoftwareApplication)
- [ ] 13.5.4: Add canonical URL
- [ ] 13.5.5: Create `apps/web/public/og-image.png` (1200x630px) - Share image

**Meta tags to add:**
```html
<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Alveodent - Software de Gestion Dental" />
<meta property="og:description" content="..." />
<meta property="og:image" content="/og-image.png" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />

<!-- Schema.org -->
<script type="application/ld+json">{ "@type": "SoftwareApplication", ... }</script>
```

#### Task 13.6: Mobile Menu (PR #78)
**Branch:** `feat/landing-mobile-menu`

Add hamburger menu for mobile navigation.

- [ ] 13.6.1: Add `mobileMenuOpen` state in Header.tsx
- [ ] 13.6.2: Add hamburger button (visible only on mobile)
- [ ] 13.6.3: Implement dropdown menu with animation
- [ ] 13.6.4: Include all navigation links + CTAs
- [ ] 13.6.5: Close menu on link click or outside click

---

### Phase 14: Testing - PENDING
**Branch:** `feature/testing`

#### Task 14.1: Backend Tests
- [ ] 14.1.1-14.1.6: Vitest, auth tests, tenant tests, plan limits tests, CRUD tests, Stripe webhooks

#### Task 14.2: Frontend Tests
- [ ] 14.2.1-14.2.4: Vitest + RTL, components, hooks, flows

---

### Phase 15: Documentation and Deploy - PENDING
**Branch:** `feature/docs-deploy`

#### Task 15.1: Documentation
- [ ] 15.1.1-15.1.4: Swagger/OpenAPI, installation and configuration guides

#### Task 15.2: Production Preparation
- [ ] 15.2.1-15.2.8: Dockerfiles prod, docker-compose, CI/CD, Stripe prod, SSL, Sentry

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

*Last update: 20 January, 2026*
