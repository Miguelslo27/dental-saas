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

### Authentication & Authorization
- JWT-based authentication
- Roles: SUPER_ADMIN, OWNER, ADMIN, CLINIC_ADMIN, DOCTOR, STAFF
- Super admin uses separate routes (`/admin/*`)
- **RBAC (Role-Based Access Control):**
  - Granular permission system with 50+ permissions
  - Permissions: `PATIENTS_CREATE`, `LABWORKS_UPDATE`, `TENANT_DELETE`, etc.
  - Backend: `requirePermission()` middleware for route protection
  - Frontend: `usePermissions()` hook and `<Can>` component for UI
  - Permission hierarchy:
    - **STAFF:** Read-only access (view patients, appointments, labworks, expenses)
    - **DOCTOR:** STAFF + edit dental charts + view statistics
    - **CLINIC_ADMIN:** Full CRUD on operational resources (patients, appointments, doctors, labworks, expenses) but no user management, settings, or data export
    - **ADMIN:** Full CRUD on all resources including users and settings
    - **OWNER:** ADMIN + tenant profile, billing, promote to owner, delete tenant

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
- **Current count:** 420 backend + 892 frontend = 1,312 tests passing

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

## Development Status

**Current State:** Production-ready SaaS application deployed on Coolify

All core features completed (15 phases):
- Multi-tenant architecture with row-level security
- Authentication & authorization (JWT, RBAC with 6 roles)
- Patient management with dental charts (9 statuses, odontogram)
- Appointments, doctors, labworks, expenses
- Dashboard with statistics
- PDF generation & data export (multi-language)
- Internationalization (ES, EN, AR with RTL)
- Landing page & marketing site
- Welcome email for new tenants
- CI/CD pipeline & production deployment

**Test Coverage:** 1,312 passing tests (420 backend + 892 frontend)

---

## Roadmap

### High Priority

#### Security & Performance
- [ ] Rate limiting with Redis (persistence and scalability)
- [ ] Rate limiting for password recovery (3 attempts per IP in 15 min)

### Medium Priority

#### Language & Regional Settings
- [ ] Language selector in web landing page and registration form
- [ ] Save language preference on registration
- [ ] Allow language change in settings (post-registration)
- [ ] Detect and use browser's default language
- [ ] Default timezone based on user's location
- [ ] Country dropdown for phone number area code

#### UX Improvements
- [ ] Superadmin tables: allow clicking on clinic/user name to view details (not just ••• menu)
- [ ] Improve date/time picker UI (investigate user-friendly packages, replace browser defaults)
- [ ] Phone placeholder based on user's location

### Backlog

#### Features
- [ ] Onboarding flow for new tenants
- [ ] User profile page
- [ ] DoctorPicker component (searchable combobox)
- [ ] FullCalendar integration (using custom view for now)
- [ ] Weekly calendar view
- [ ] Prescriptions component
- [ ] og-image.png (1200x630px) for apps/web/public/
- [ ] Subscriptions and payments (dLocal integration)

#### Technical
- [ ] E2E tests for admin panel
- [ ] Audit logging for superadmin actions
- [ ] Pagination in admin endpoints
- [ ] 2FA for super admin
- [ ] Dark mode toggle
- [ ] Dashboard with real-time metrics (WebSocket)
- [ ] Soft delete for tenants
- [ ] Export tenant data before deletion

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

## Future Epics (Large-Scale Initiatives)

### Epic: Desktop Application (Windows / Mac / Linux)
**Goal:** Native desktop app with offline-first capabilities

**Key Features:**
- [ ] Cross-platform desktop app (Electron or Tauri)
- [ ] UI/UX similar to web application
- [ ] Offline-first architecture with local database (SQLite)
- [ ] Automatic sync when online (conflict resolution strategy)
- [ ] Background sync service
- [ ] Offline indicators and sync status
- [ ] Local data encryption
- [ ] Auto-updates mechanism

**Technical Considerations:**
- Sync engine design (operational transformation or CRDT)
- Conflict resolution for appointments, patient records, etc.
- Local storage limits and cleanup strategy
- Migration path from web-only to hybrid usage

---

### Epic: Mobile Applications (iOS / Android)
**Goal:** Two mobile apps - one for clinic staff, one for patients

---

#### App 1: DentalClinic Pro (Admin & Doctors) - Multi-role

**Target Users:** Clinic administrators and doctors

**Shared Features (All Roles):**
- [ ] Login with role detection (Admin/Doctor)
- [ ] Multi-language support (ES/EN/AR)
- [ ] Push notifications
- [ ] Offline reading + sync queue
- [ ] Biometric authentication

**Admin Features:**
- [ ] View/manage all clinic appointments (daily/weekly agenda)
- [ ] Patient check-in functionality
- [ ] Create/edit/cancel appointments
- [ ] Search patients and view basic info
- [ ] Register payments on-the-spot
- [ ] View and register daily expenses
- [ ] View pending labworks
- [ ] Quick access to patient contacts (call/WhatsApp)
- [ ] Send appointment reminders
- [ ] Dashboard: daily summary (appointments, income, expenses)

**Doctor Features:**
- [ ] View only ASSIGNED appointments (daily/weekly)
- [ ] Mark appointments as completed
- [ ] View complete patient file before/during consultation
- [ ] Dental chart viewer (read-only on mobile, edit on desktop)
- [ ] Complete treatment history
- [ ] View notes from previous appointments
- [ ] Access patient documents/PDFs
- [ ] Add quick notes post-consultation
- [ ] Register treatments performed (simplified UI)
- [ ] Mark labworks as sent/received

---

#### App 2: DentalClinic (Patients) - Separate App

**Target Users:** Patients (end users)

**Key Features:**
- [ ] View upcoming appointments
- [ ] Appointment history
- [ ] Medical/dental history viewer
- [ ] Treatment records and dental chart (read-only)
- [ ] Expenses and payment history
- [ ] Push notifications for appointment reminders
- [ ] Document viewer (PDFs, prescriptions, treatment plans)
- [ ] Profile management
- [ ] Multi-language support (ES/EN/AR)
- [ ] Request appointment (pending approval by clinic)

**Authentication:**
- [ ] Patient-specific auth flow (separate from clinic staff)
- [ ] Biometric authentication support
- [ ] Secure token storage

---

**Technical Stack Options:**
- React Native (leverage existing React knowledge)
- Flutter (native performance)
- Progressive Web App (PWA) as MVP

**Offline Strategy:**
- Clinic Staff App: More critical - read offline + queue changes for sync
- Patient App: Read-only offline for recent data

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

Application deployed and running in production.

**Guides:**
- [docs/COOLIFY-DEPLOYMENT.md](docs/COOLIFY-DEPLOYMENT.md)
- [docs/COOLIFY-TROUBLESHOOTING.md](docs/COOLIFY-TROUBLESHOOTING.md)

---

*Last update: 11 February, 2026 - Roadmap cleanup, removed completed tasks*
