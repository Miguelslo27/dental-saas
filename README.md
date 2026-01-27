# 🦷 Alveo System

**Multi-tenant SaaS dental clinic management system** built with modern technologies for scalability, performance, and developer experience.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Subscription Plans](#subscription-plans)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Alveo System is a comprehensive **dental clinic management platform** designed for modern dental practices. Built as a multi-tenant SaaS application, it provides:

- **Patient Management**: Complete patient records with dental charts
- **Appointment Scheduling**: Calendar-based scheduling with conflict detection
- **Doctor Management**: Staff profiles with availability and specialties
- **Lab Work Tracking**: Monitor outsourced dental work
- **Financial Management**: Track expenses, payments, and billing
- **Multi-language Support**: Spanish, English, and Arabic (with RTL support)
- **Secure Authentication**: JWT-based auth with role-based access control
- **Responsive Design**: Mobile-first UI that works on all devices

---

## Features

### Core Features

✅ **Multi-Tenant Architecture** - Isolated data per clinic with row-level security
✅ **Patient Records** - Complete patient information with dental chart
✅ **Appointment Scheduling** - Calendar interface with drag-and-drop
✅ **Doctor Management** - Staff profiles with working hours and specialties
✅ **Lab Work Tracking** - Monitor outsourced dental work status
✅ **Expense Management** - Track clinic expenses and payments
✅ **Financial Reports** - Revenue and expense statistics
✅ **Email Notifications** - Automated reminders and notifications
✅ **PDF Generation** - Patient history and appointment reports
✅ **Data Export** - CSV export for patients and appointments

### Technical Features

🔒 **Security**: JWT authentication, role-based access, CORS protection
🌍 **Internationalization**: i18n support (ES, EN, AR) with RTL
📱 **Responsive**: Mobile-first design with Tailwind CSS
🧪 **Tested**: 1,100+ unit tests + E2E tests with Playwright
🚀 **Performance**: Optimized database queries, Redis caching
📊 **Monitoring**: Health checks and error tracking
🔄 **Real-time Updates**: Zustand state management
📦 **Monorepo**: Turborepo for efficient development

---

## Tech Stack

### Frontend

- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast development server
- **Tailwind CSS 4**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **React Hook Form**: Performant forms with validation
- **Zod**: TypeScript-first schema validation
- **i18next**: Internationalization framework
- **Playwright**: E2E testing framework

### Backend

- **Node.js 22**: LTS version for stability
- **Express 5**: Fast, minimalist web framework
- **TypeScript**: End-to-end type safety
- **Prisma ORM**: Type-safe database client
- **PostgreSQL**: Robust relational database
- **Redis**: Caching and session storage
- **Resend**: Modern email delivery
- **React Email**: Type-safe email templates
- **@react-pdf/renderer**: PDF generation

### Infrastructure

- **Docker**: Containerization
- **Docker Compose**: Local development setup
- **pnpm**: Fast, disk-efficient package manager
- **Turborepo**: High-performance build system
- **Vitest**: Unit testing framework
- **Supertest**: API integration testing

---

## Quick Start

### Prerequisites

- **Node.js** v22.0.0 or higher
- **pnpm** v10.0.0 or higher
- **Docker** & Docker Compose

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Miguelslo27/dental-saas.git
cd dental-saas

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env and configure DATABASE_URL, REDIS_URL, JWT_SECRET, etc.

# 4. Start database services
docker compose -f docker-compose.dev.yml up -d

# 5. Run database migrations
pnpm --filter @dental/database db:migrate

# 6. Start development servers
pnpm dev
```

**Applications will be available at:**
- 🖥️ **API**: http://localhost:5001
- 📱 **App**: http://localhost:5002
- 🌐 **Landing**: http://localhost:5003

### Create Super Admin

After starting the servers, create a super admin account:

```bash
curl -X POST http://localhost:5001/api/v1/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "setupKey": "your-setup-key-from-env",
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "firstName": "Super",
    "lastName": "Admin"
  }'
```

---

## Documentation

Comprehensive documentation is available in the `/docs` directory:

📚 **Guides:**
- [📥 Installation Guide](./docs/INSTALLATION.md) - Complete setup instructions
- [🔐 Environment Variables](./docs/ENVIRONMENT.md) - All configuration options
- [👨‍💻 Development Guide](./docs/DEVELOPMENT.md) - Development workflow and best practices
- [🔌 API Documentation](./docs/API.md) - Complete REST API reference

☁️ **Deployment:**
- [✅ Deployment Checklist](./docs/DEPLOYMENT-CHECKLIST.md) - Step-by-step deployment guide
- [🚀 Production Deployment](./docs/PRODUCTION.md) - SSL, monitoring, backups, and security
- [🚀 Coolify Deployment](./docs/COOLIFY-DEPLOYMENT.md) - Deploy with Coolify
- [🔧 Coolify Troubleshooting](./docs/COOLIFY-TROUBLESHOOTING.md) - Common issues and solutions

📋 **Project:**
- [🗺️ Project Roadmap](./CLAUDE.md) - Development progress and plans

---

## Project Structure

```
dental-saas/
├── apps/
│   ├── api/              # Backend API (Express + TypeScript)
│   │   ├── src/
│   │   │   ├── routes/   # API route handlers
│   │   │   ├── services/ # Business logic
│   │   │   ├── middleware/
│   │   │   ├── emails/   # Email templates
│   │   │   ├── pdfs/     # PDF templates
│   │   │   └── utils/
│   │   └── package.json
│   │
│   ├── app/              # Frontend App (React + Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── stores/   # Zustand stores
│   │   │   ├── lib/      # API clients
│   │   │   └── i18n/     # Translations
│   │   ├── e2e/          # Playwright E2E tests
│   │   └── package.json
│   │
│   └── web/              # Landing Page
│       └── src/
│
├── packages/
│   ├── database/         # Prisma schema and client
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── migrations/
│   │
│   └── shared/           # Shared TypeScript types
│
├── docs/                 # Documentation
├── docker-compose.dev.yml
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## Subscription Plans

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

## Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the [Development Guide](./docs/DEVELOPMENT.md)
- Write tests for new features
- Follow TypeScript strict mode
- Use conventional commits
- Update documentation as needed

---

## Testing

The project has comprehensive test coverage:

- **Unit Tests**: 1,100+ tests across backend and frontend
- **Integration Tests**: API endpoint testing with supertest
- **E2E Tests**: Critical user flows with Playwright

```bash
# Run all tests
pnpm test

# Run backend tests
pnpm --filter @dental/api test

# Run frontend tests
pnpm --filter @dental/app test

# Run E2E tests
pnpm --filter @dental/app test:e2e

# E2E UI mode
pnpm --filter @dental/app test:e2e --ui
```

---

## Commands Reference

```bash
# Development
pnpm dev                                    # Start all apps
pnpm build                                  # Build all apps
pnpm test                                   # Run all tests
pnpm lint                                   # Run linter

# Database
pnpm --filter @dental/database db:migrate  # Run migrations
pnpm --filter @dental/database db:generate # Generate Prisma client
pnpm --filter @dental/database db:studio   # Open Prisma Studio
pnpm --filter @dental/database db:seed     # Seed database
pnpm --filter @dental/database db:reset    # Reset database

# Docker
docker compose -f docker-compose.dev.yml up -d    # Start dev services
docker compose -f docker-compose.dev.yml down     # Stop dev services
docker compose build                               # Build prod images
docker compose up -d                               # Start prod stack

# Backup & Restore
DATABASE_URL=<url> ./scripts/backup-database.sh          # Backup database
DATABASE_URL=<url> ./scripts/restore-database.sh <file>  # Restore from backup

# Environment Validation
./scripts/validate-env.sh [env-file]                     # Validate environment variables
```

---

## Environment Variables

Key environment variables (see [ENVIRONMENT.md](./docs/ENVIRONMENT.md) for complete list):

```env
# Application
PORT=5001
VITE_APP_PORT=5002
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dental"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"

# Email
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@example.com"
```

---

## Architecture Highlights

### Multi-Tenant Design

- **Row-Level Security**: All queries automatically filtered by `tenantId`
- **Data Isolation**: Complete separation between clinics
- **Prisma Extension**: Transparent tenant filtering

### Authentication

- **JWT-based**: Access tokens (15m) + Refresh tokens (7d)
- **Role-based**: OWNER, ADMIN, DOCTOR, STAFF
- **Secure**: bcrypt password hashing, HttpOnly cookies

### State Management

- **Zustand**: Lightweight, performant global state
- **React Hook Form**: Optimized form state
- **React Query**: (Planned) Server state management

---

## Roadmap

See [CLAUDE.md](./CLAUDE.md) for detailed development roadmap and progress.

**Current Phase**: Documentation & Deployment (Phase 15)

**Completed:**
- ✅ Phase 0-13: Core features and landing page
- ✅ Phase 14: Comprehensive testing (1,100+ tests)

**Next:**
- 🔄 Phase 15: Documentation and production deployment
- 📋 Future: Advanced features (rate limiting, 2FA, WebSocket notifications)

---

## Security

- 🔒 JWT authentication with token rotation
- 🛡️ CORS protection
- 🔐 Password hashing with bcrypt
- 🚫 SQL injection prevention (Prisma parameterized queries)
- ✅ Input validation with Zod
- 🔑 Environment-based secrets management
- 👤 Role-based access control (RBAC)

**Security Best Practices:**
- Never commit `.env` files
- Use strong passwords (20+ characters)
- Rotate secrets regularly
- Enable HTTPS in production
- Use secure headers (helmet.js)
- Implement rate limiting (planned)

---

## Performance

- ⚡ Vite for fast development builds
- 🚀 Turborepo for optimized monorepo builds
- 💾 Redis for caching and sessions
- 📊 Database indexes on frequently queried fields
- 🎯 Code splitting and lazy loading
- 🗜️ Gzip compression
- 📈 Pagination for large datasets

---

## Browser Support

- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## Support

- **Documentation**: Check `/docs` folder for guides
- **Issues**: [GitHub Issues](https://github.com/Miguelslo27/dental-saas/issues)
- **Email**: support@yourdomain.com

---

## Acknowledgments

- Built with ❤️ using modern web technologies
- Developed with assistance from [Claude Code](https://claude.com/claude-code)
- Inspired by real-world dental clinic needs

---

**Made with TypeScript, React, and Node.js**

*Last updated: January 27, 2026*
