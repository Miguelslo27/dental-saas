# 🦷 Alveo System

Sistema de gestión para clínicas dentales - Multi-tenant SaaS.

## Stack Tecnológico

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Shadcn/ui
- **Backend:** Node.js 22 LTS + Express 5 + TypeScript
- **Database:** MySQL 8 + Prisma ORM
- **Cache:** Redis
- **Payments:** Stripe

## Estructura del Proyecto

```
dental-saas/
├── apps/
│   ├── api/          # Backend API (Express + TypeScript)
│   └── web/          # Frontend (React + Vite)
├── packages/
│   ├── database/     # Prisma schema y cliente
│   └── shared/       # Tipos y utilidades compartidas
├── docker-compose.yml
└── turbo.json
```

## Requisitos

- Node.js >= 22.0.0
- pnpm >= 10.0.0
- Docker & Docker Compose

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Iniciar servicios (PostgreSQL + Redis) - usa docker-compose.dev.yml
docker compose -f docker-compose.dev.yml up -d

# Ejecutar migraciones
pnpm --filter @dental/database db:migrate

# Iniciar en modo desarrollo
pnpm dev
```

## Planes de Suscripción

| Plan    | Admins | Doctores | Pacientes | Precio     |
| ------- | ------ | -------- | --------- | ---------- |
| Gratis  | 1      | 3        | 15        | $0/mes     |
| Básico  | 2      | 5        | 25        | $5.99/mes  |
| Empresa | 5      | 10       | 60        | $11.99/mes |

## Licencia

MIT
