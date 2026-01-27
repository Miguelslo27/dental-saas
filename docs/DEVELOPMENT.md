# Development Guide - Alveo System

Comprehensive guide for developers working on the Alveo System dental SaaS application.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style & Standards](#code-style--standards)
- [Testing](#testing)
- [Database Management](#database-management)
- [API Development](#api-development)
- [Frontend Development](#frontend-development)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

Before starting development, ensure you have:
- Completed the [Installation Guide](./INSTALLATION.md)
- Configured your [Environment Variables](./ENVIRONMENT.md)
- Running PostgreSQL and Redis services

### Quick Start

```bash
# Clone and install
git clone https://github.com/Miguelslo27/dental-saas.git
cd dental-saas
pnpm install

# Start database services
docker compose -f docker-compose.dev.yml up -d

# Run migrations
pnpm --filter @dental/database db:migrate

# Start development servers
pnpm dev
```

---

## Project Structure

```
dental-saas/
├── apps/
│   ├── api/                    # Backend API (Express + TypeScript)
│   │   ├── src/
│   │   │   ├── routes/         # API route handlers
│   │   │   ├── services/       # Business logic layer
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── emails/         # Email templates (React Email)
│   │   │   ├── pdfs/          # PDF templates (@react-pdf/renderer)
│   │   │   └── utils/          # Utility functions
│   │   └── package.json
│   │
│   ├── app/                    # Frontend App (React + TypeScript)
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── pages/          # Page components
│   │   │   ├── stores/         # Zustand state management
│   │   │   ├── lib/            # API clients, utilities
│   │   │   └── i18n/           # Internationalization
│   │   ├── e2e/                # Playwright E2E tests
│   │   └── package.json
│   │
│   └── web/                    # Landing Page (React + TypeScript)
│       └── src/
│           ├── components/     # Landing page components
│           └── pages/          # Landing pages
│
├── packages/
│   ├── database/               # Prisma schema and client
│   │   └── prisma/
│   │       ├── schema.prisma   # Database schema
│   │       └── migrations/     # Migration files
│   │
│   └── shared/                 # Shared TypeScript types
│       └── src/
│           └── types/          # Shared type definitions
│
├── docs/                       # Documentation
├── CLAUDE.md                   # Development roadmap
└── turbo.json                  # Turborepo configuration
```

### Key Directories

- **`apps/api/src/routes`**: API endpoints organized by resource
- **`apps/api/src/services`**: Business logic separated from route handlers
- **`apps/app/src/stores`**: Zustand stores for state management
- **`apps/app/src/lib`**: API client functions and utilities
- **`packages/database/prisma`**: Database schema and migrations

---

## Development Workflow

### Branch Strategy

- **`main`**: Production-ready code
- **`feature/*`**: New features
- **`test/*`**: Test additions
- **`fix/*`**: Bug fixes
- **`docs/*`**: Documentation updates

### Commit Messages

Follow conventional commits:

```
feat(api): add patient search endpoint
fix(app): resolve date picker timezone issue
test(app): add unit tests for PatientFormModal
docs: update installation guide
refactor(api): extract email service logic
```

**Format**: `type(scope): description`

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Process

1. Create feature branch from `main`
2. Make changes and commit
3. Push branch and create PR
4. Ensure all tests pass
5. Request review
6. Squash and merge to `main`

**PR Title Format**:
```
feat(app): add patient export feature
```

---

## Code Style & Standards

### TypeScript

- **Strict mode** enabled
- Use `interface` for object shapes
- Use `type` for unions, intersections, utilities
- Avoid `any` - use `unknown` if necessary
- Document complex functions with JSDoc

```typescript
// Good
interface Patient {
  id: string
  firstName: string
  lastName: string
  email?: string
}

// Avoid
const patient: any = {...}
```

### Naming Conventions

- **Variables/Functions**: `camelCase`
- **Types/Interfaces**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Components**: `PascalCase`
- **Files**: `kebab-case.ts` or `PascalCase.tsx`

```typescript
// Variables
const patientCount = 10

// Constants
const MAX_FILE_SIZE = 5_000_000

// Types
interface UserProfile {}
type ApiResponse<T> = {...}

// Components
function PatientCard() {}
```

### ESLint & Prettier

```bash
# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

### Language Guidelines

- **Code**: English (variables, functions, comments)
- **User-facing strings**: Spanish (UI text, error messages)
- **Commits/PRs**: English
- **Documentation**: English

---

## Testing

### Test Structure

```
apps/app/src/
├── components/
│   └── patients/
│       ├── PatientCard.tsx
│       └── PatientCard.test.tsx        # Co-located tests
├── pages/
│   └── patients/
│       ├── PatientsPage.tsx
│       └── PatientsPage.test.tsx
└── lib/
    ├── patient-api.ts
    └── patient-api.test.ts
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @dental/api test
pnpm --filter @dental/app test

# Watch mode
pnpm --filter @dental/app test:watch

# Run specific test file
pnpm --filter @dental/app test src/components/patients/PatientCard.test.tsx

# E2E tests
pnpm --filter @dental/app test:e2e

# E2E UI mode
pnpm --filter @dental/app test:e2e --ui
```

### Test Guidelines

**Unit Tests:**
- Test individual functions and components
- Mock external dependencies
- Focus on behavior, not implementation

**Integration Tests:**
- Test API endpoints with supertest
- Use test database
- Test complete request/response cycles

**E2E Tests:**
- Test user flows end-to-end
- Use Playwright
- Test critical paths only

**Example Test:**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PatientCard } from './PatientCard'

describe('PatientCard', () => {
  it('should display patient name', () => {
    const patient = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
    }

    render(<PatientCard patient={patient} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
```

---

## Database Management

### Prisma Commands

```bash
# Generate Prisma client
pnpm --filter @dental/database db:generate

# Create migration
pnpm --filter @dental/database db:migrate:create

# Run migrations
pnpm --filter @dental/database db:migrate

# Open Prisma Studio (GUI)
pnpm --filter @dental/database db:studio

# Seed database
pnpm --filter @dental/database db:seed

# Reset database (⚠️ deletes all data)
pnpm --filter @dental/database db:reset
```

### Schema Changes

1. Edit `packages/database/prisma/schema.prisma`
2. Create migration: `pnpm --filter @dental/database db:migrate:create`
3. Name migration descriptively
4. Review generated SQL in `migrations/` folder
5. Apply migration: `pnpm --filter @dental/database db:migrate`
6. Generate client: `pnpm --filter @dental/database db:generate`

### Multi-Tenant Pattern

All models must include `tenantId`:

```prisma
model Patient {
  id        String   @id @default(cuid())
  tenantId  String   // Required for multi-tenancy
  firstName String
  lastName  String

  // Add index for tenant queries
  @@index([tenantId])
}
```

**Prisma Extension** automatically filters queries by `tenantId`:

```typescript
// Automatically filtered by tenant
const patients = await prisma.patient.findMany()
```

---

## API Development

### Creating a New Endpoint

1. **Define route** in `apps/api/src/routes/`:

```typescript
// apps/api/src/routes/patients.ts
import { Router } from 'express'
import * as patientService from '../services/patient.service'

const router = Router()

router.get('/', async (req, res) => {
  const patients = await patientService.getPatients(req.tenantId)
  res.json({ data: patients })
})

export default router
```

2. **Implement service** in `apps/api/src/services/`:

```typescript
// apps/api/src/services/patient.service.ts
import { prisma } from '@dental/database'

export async function getPatients(tenantId: string) {
  return prisma.patient.findMany({
    where: { tenantId },
  })
}
```

3. **Add validation** with Zod:

```typescript
import { z } from 'zod'

const createPatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
})

// In route handler
const data = createPatientSchema.parse(req.body)
```

4. **Add tests**:

```typescript
// apps/api/src/services/patient.service.test.ts
import { describe, it, expect } from 'vitest'
import * as patientService from './patient.service'

describe('patientService', () => {
  it('should get patients by tenant', async () => {
    const patients = await patientService.getPatients('tenant1')
    expect(patients).toBeInstanceOf(Array)
  })
})
```

### API Response Format

**Success:**
```json
{
  "data": {...}
}
```

**Error:**
```json
{
  "error": "Error message"
}
```

**List with pagination:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

---

## Frontend Development

### Creating a New Page

1. **Create page component** in `apps/app/src/pages/`:

```tsx
// apps/app/src/pages/patients/PatientsPage.tsx
export function PatientsPage() {
  return (
    <div>
      <h1>Patients</h1>
    </div>
  )
}
```

2. **Add route** in `apps/app/src/App.tsx`:

```tsx
<Route path="/patients" element={<PatientsPage />} />
```

3. **Create Zustand store** in `apps/app/src/stores/`:

```typescript
// apps/app/src/stores/patients.store.ts
import { create } from 'zustand'

interface PatientsState {
  patients: Patient[]
  loading: boolean
  fetchPatients: () => Promise<void>
}

export const usePatientsStore = create<PatientsState>((set) => ({
  patients: [],
  loading: false,
  fetchPatients: async () => {
    set({ loading: true })
    const patients = await getPatients()
    set({ patients, loading: false })
  },
}))
```

4. **Create API client** in `apps/app/src/lib/`:

```typescript
// apps/app/src/lib/patient-api.ts
import { api } from './api'

export async function getPatients() {
  const { data } = await api.get('/patients')
  return data.data
}
```

### State Management

Use Zustand for global state:

```typescript
// In component
const { patients, fetchPatients } = usePatientsStore()

useEffect(() => {
  fetchPatients()
}, [fetchPatients])
```

### Styling

Use Tailwind CSS classes:

```tsx
<div className="p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold text-gray-900">
    Title
  </h1>
</div>
```

### Internationalization

```typescript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()

  return <h1>{t('patients.title')}</h1>
}
```

---

## Common Tasks

### Add a New npm Package

```bash
# Install to specific workspace
pnpm --filter @dental/api add express-rate-limit
pnpm --filter @dental/app add react-query

# Install to root
pnpm add -D typescript

# Install to all workspaces
pnpm add -w lodash
```

### Update Dependencies

```bash
# Update all dependencies
pnpm update

# Update specific package
pnpm update react

# Check outdated packages
pnpm outdated
```

### Generate Types from Prisma

```bash
pnpm --filter @dental/database db:generate
```

### Create Database Backup

```bash
# Backup
docker compose -f docker-compose.dev.yml exec -T postgres pg_dump -U dental dental_dev > backup.sql

# Restore
docker compose -f docker-compose.dev.yml exec -T postgres psql -U dental dental_dev < backup.sql
```

### Debug API Requests

```bash
# Enable debug logging
DEBUG=express:* pnpm --filter @dental/api dev

# Or use VS Code debugger with breakpoints
```

---

## Troubleshooting

### TypeScript Errors

```bash
# Rebuild TypeScript
pnpm build

# Clear TypeScript cache
rm -rf node_modules/.cache
```

### Prisma Issues

```bash
# Regenerate Prisma client
pnpm --filter @dental/database db:generate

# Reset database
pnpm --filter @dental/database db:reset
```

### Port Already in Use

```bash
# Find process
lsof -i :5001

# Kill process
kill -9 <PID>
```

### Clear All Caches

```bash
# Clear pnpm cache
pnpm store prune

# Clear node_modules
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# Reinstall
pnpm install
```

---

## Best Practices

### Security

- ✅ Never commit `.env` files
- ✅ Use parameterized queries (Prisma handles this)
- ✅ Validate all user input with Zod
- ✅ Sanitize file uploads
- ✅ Use HTTPS in production
- ✅ Implement rate limiting

### Performance

- ✅ Use database indexes for frequently queried fields
- ✅ Implement pagination for large lists
- ✅ Cache frequently accessed data with Redis
- ✅ Optimize images (use WebP, lazy loading)
- ✅ Code splitting for frontend routes

### Code Quality

- ✅ Write tests for new features
- ✅ Keep functions small and focused
- ✅ Use TypeScript strict mode
- ✅ Document complex logic
- ✅ Review PRs carefully

---

## Additional Resources

- [Installation Guide](./INSTALLATION.md)
- [Environment Variables](./ENVIRONMENT.md)
- [API Documentation](./API.md)
- [Deployment Guide](./COOLIFY-DEPLOYMENT.md)
- [Project Roadmap](../CLAUDE.md)

---

*Last updated: January 27, 2026*
