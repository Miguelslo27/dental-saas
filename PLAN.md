# 🦷 Plan de Migración: Dental Flutter → React/Node.js/PostgreSQL (SaaS)

## Descripción del Proyecto

**Nombre:** Dental Clinic Management System (SaaS)  
**Versión Original:** Flutter + Dart + PocketBase  
**Versión Destino:** React + Node.js + PostgreSQL (Multi-tenant SaaS)  
**Fecha de Inicio:** 29 de Diciembre, 2025  
**Autor:** Mike  

---

## ✅ BUGS RESUELTOS

### BUG-001: Link de email de bienvenida no funciona ✅ RESUELTO
- **Prioridad:** ALTA
- **Descripción:** El email de bienvenida dirige a `http://[url]/[slug]/login` pero esa ruta no mostraba nada
- **Solución:** Añadida ruta `/:clinicSlug/login` en App.tsx (PR #51)
- **PR:** #51

### BUG-002: Login redirige a landing page en lugar de dashboard ✅ RESUELTO
- **Prioridad:** ALTA
- **Descripción:** Después del login exitoso, el usuario era redirigido a la landing page en lugar del panel de gestión
- **Solución:** 
  1. Separación de apps: `apps/app` (panel) y `apps/web` (landing) - PR #51
  2. Ruta `/` ahora muestra `HomePage` envuelto en `ProtectedRoute` - PR #52
  3. Si no autenticado → redirige a `/login`
  4. Si autenticado → muestra dashboard (HomePage)
- **PRs:** #51, #52

---

## 🏗️ Arquitectura de Aplicaciones

### Progreso de Implementación
- ✅ `apps/api` - Backend completo
- ✅ `apps/web` - Landing page (puerto 5174)
- ✅ `apps/app` - Panel de gestión (puerto 5173)

### Estructura del Monorepo

```
dental-saas/
├── apps/
│   ├── api/          # Backend Express + TypeScript (puerto 3000)
│   ├── app/          # Panel de gestión de clínica (puerto 5173)
│   └── web/          # Landing page / Marketing site (puerto 5174)
├── packages/
│   ├── database/     # Prisma schema y cliente
│   └── shared/       # Tipos y utilidades compartidas
```

### apps/app - Panel de Gestión (SPA Autenticada)
- **Propósito:** Panel de gestión para usuarios de clínicas dentales
- **Acceso:** Requiere autenticación (login)
- **Rutas principales:**
  - `/login` - Página de inicio de sesión
  - `/register` - Registro de nueva clínica
  - `/dashboard` - Dashboard principal post-login
  - `/doctors`, `/patients`, `/appointments`, etc.
- **Puerto desarrollo:** 5173
- **URL producción:** `app.alveodent.com` (subdominio)

### apps/web - Landing Page (Sitio Público)
- **Propósito:** Marketing, pricing, información del producto
- **Acceso:** Público, sin autenticación
- **Rutas principales:**
  - `/` - Landing page principal
  - `/pricing` - Planes y precios
  - `/features` - Características del producto
  - `/contact` - Formulario de contacto
- **Redirecciones externas:**
  - "Iniciar Sesión" → `app.alveodent.com/login`
  - "Comenzar Prueba" → `app.alveodent.com/register`
  - "Registrarse" → `app.alveodent.com/register`
- **Puerto desarrollo:** 5174
- **URL producción:** `alveodent.com` (dominio principal)

### Variables de Entorno por App

```env
# apps/app (.env)
VITE_API_URL="http://localhost:3000"

# apps/web (.env)
VITE_APP_URL="http://localhost:5173"  # URL del panel de gestión
```

---

## 🚀 Modelo de Negocio SaaS

### Planes de Suscripción

| Característica      | 🆓 Gratis  | 💼 Básico  | 🏢 Empresa             |
| ------------------- | --------- | --------- | --------------------- |
| **Precio**          | $0/mes    | $5.99/mes | $11.99/mes            |
| **Administradores** | 1         | 2         | 5                     |
| **Doctores**        | 3         | 5         | 10                    |
| **Pacientes**       | 15        | 25        | 60                    |
| **Almacenamiento**  | 100MB     | 1GB       | 5GB                   |
| **Soporte**         | Comunidad | Email     | Prioritario           |
| **Backups**         | Manual    | Diarios   | Diarios + Exportación |
| **Reportes**        | Básicos   | Completos | Completos + Custom    |

### Arquitectura Multi-Tenant

```
┌─────────────────────────────────────────────────────────────────┐
│                        DENTAL SaaS                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Tenant A   │  │  Tenant B   │  │  Tenant C   │  ...         │
│  │  (Clínica1) │  │  (Clínica2) │  │  (Clínica3) │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                │                │                      │
│         ▼                ▼                ▼                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Base de Datos Compartida                     │   │
│  │         (Row-level isolation por tenant_id)               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Resumen del Proyecto Original

Dental es una aplicación de gestión para clínicas dentales con las siguientes características:
- Gestión de pacientes (datos demográficos, historial dental)
- Gestión de citas (calendario, notas pre/post operatorias, prescripciones)
- Gestión de doctores (días de trabajo, permisos)
- Trabajos de laboratorio (seguimiento, pagos)
- Gastos y recibos
- Estadísticas y dashboards
- Sistema de permisos y roles (admin/user)
- Soporte multi-idioma
- Backups
- Fotos adjuntas a citas
- Generación de PDFs (prescripciones)
- Sincronización offline/online

---

## Stack Tecnológico

### Frontend
- **Framework:** React 19 (última versión estable) con TypeScript
- **Build Tool:** Vite 6+
- **Estado:** Zustand
- **UI Library:** Shadcn/ui + Tailwind CSS 4
- **Routing:** React Router v7
- **Forms:** React Hook Form + Zod
- **Calendario:** FullCalendar
- **Charts:** Recharts
- **HTTP Client:** Axios + TanStack Query (React Query)
- **Pagos:** Stripe.js

### Backend
- **Runtime:** Node.js 22 LTS
- **Framework:** Express.js 5 con TypeScript
- **ORM:** Prisma 6
- **Autenticación:** JWT + bcrypt
- **Validación:** Zod
- **Upload de archivos:** Multer + S3 compatible
- **Pagos:** Stripe SDK
- **Emails:** Nodemailer + plantillas React Email
- **Documentación API:** Swagger/OpenAPI
- **Jobs/Queue:** BullMQ (para emails, backups, etc.)

### Base de Datos
- **RDBMS:** PostgreSQL 16+
- **Migraciones:** Prisma Migrate
- **Cache:** Redis (para sesiones, rate limiting, queues)

### DevOps
- **Contenedores:** Docker + Docker Compose
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint 9 + Prettier
- **CI/CD:** GitHub Actions

---

## PRs Completados

### PR #1-12: Configuración Base y Autenticación ✅
- ✅ Setup inicial del monorepo
- ✅ Docker Compose (PostgreSQL + Redis)
- ✅ Prisma schema con multi-tenancy
- ✅ API Express con TypeScript
- ✅ Autenticación JWT (login, registro, refresh tokens)
- ✅ RBAC con roles (OWNER, ADMIN, DOCTOR, STAFF)
- ✅ Frontend React con Tailwind + Shadcn/ui
- ✅ Páginas de login/registro con clinicSlug
- ✅ Conexión a base de datos corregida

### PR #13: Super Admin Backend API ✅
- ✅ Role `SUPER_ADMIN` añadido al enum
- ✅ `tenantId` opcional para superadmins
- ✅ Middleware `requireSuperAdmin`
- ✅ Endpoint `/api/admin/setup` (one-time, auto-disable)
- ✅ Endpoints CRUD para tenants y users
- ✅ Estadísticas de plataforma
- ✅ Rate limiting en `/api/admin/setup` (5 intentos, 15 min lockout)
- ✅ Confirmación `?confirm=true` para DELETE tenant
- ✅ Validación de timezone (IANA)
- ✅ Prevenir cambio de role a SUPER_ADMIN via PATCH
- ✅ Validación global de email para superadmins
- ✅ Respuestas JSON estandarizadas

### PR #14: Super Admin Frontend Panel ✅
- ✅ Admin store (Zustand) para autenticación con sessionStorage
- ✅ Servicio API para endpoints de admin
- ✅ AdminLayout con navegación sidebar
- ✅ Página /admin/setup (creación one-time del superadmin)
- ✅ Página /admin/login (login exclusivo para superadmin)
- ✅ Página /admin/dashboard (estadísticas de plataforma)
- ✅ Página /admin/tenants (gestión de clínicas)
- ✅ Página /admin/users (gestión de usuarios)
- ✅ Rutas integradas en App.tsx
- ✅ Index route redirect /admin → /admin/dashboard
- ✅ Error feedback al usuario (sin console.error)
- ✅ Backdrop para cerrar dropdowns

### PR #15: Fix tsconfig baseUrl deprecation ✅
- ✅ Eliminado `baseUrl` de tsconfig (apps/api, apps/web, packages/shared)
- ✅ Actualizado `paths` para usar rutas relativas desde el directorio del tsconfig

### PR #16: Add missing lucide-react dependency ✅
- ✅ Añadida dependencia `lucide-react` faltante en apps/web
- ✅ Corregido error de Vite "Failed to resolve import lucide-react"

### PR #17: Coolify Deployment Guide ✅
- ✅ Documentación completa para deployment en Coolify (`docs/COOLIFY-DEPLOYMENT.md`)
- ✅ Dockerfiles multi-stage para API y Web
- ✅ Docker Compose de producción
- ✅ Configuración Nginx con headers de seguridad (CSP, Referrer-Policy, Permissions-Policy)
- ✅ Variables de entorno y generación de secrets
- ✅ Guía paso a paso para configurar servicios en Coolify
- ✅ Sección de troubleshooting

### PR #18: Testing Strategy ✅
- ✅ Estrategia de testing completa para las 14 fases del proyecto
- ✅ Convenciones de naming y ubicación de tests
- ✅ Matriz de cobertura objetivo por fase
- ✅ Configuración CI/CD Pipeline para GitHub Actions

### PR #19: Coolify Production Files ✅
- ✅ `docker-compose.prod.yml` creado
- ✅ `apps/api/Dockerfile` con multi-stage build
- ✅ `apps/web/Dockerfile` con nginx
- ✅ `apps/web/nginx.conf` con headers de seguridad
- ✅ Build local validado (API y Web)
- ✅ Fix import no usado en AdminUsersPage.tsx
- ✅ PR: https://github.com/Miguelslo27/dental-saas/pull/19

### PR #38: Fix VITE_API_URL inconsistency ✅
- ✅ Bug: En producción, `/admin/setup` hacía request a URL incorrecta (404)
- ✅ Causa: Inconsistencia en cómo se definía `VITE_API_URL` (con/sin `/api` suffix)
- ✅ Fix: Estandarizar que `VITE_API_URL` sea la URL base SIN `/api`
- ✅ Modificados: `api.ts` y `admin-api.ts` para añadir `/api` explícitamente al baseURL
- ✅ PR: https://github.com/Miguelslo27/dental-saas/pull/38

### PR #39: Fix API_URL typo in refresh token ✅
- ✅ Bug: Build fallaba con `TS2304: Cannot find name 'API_URL'`
- ✅ Causa: Variable renombrada a `API_BASE_URL` pero una referencia quedó sin actualizar
- ✅ Fix: Corregir nombre de variable y añadir `/api` prefix al endpoint de refresh
- ✅ PR: https://github.com/Miguelslo27/dental-saas/pull/39

### PR #40: API Healthcheck and Traefik labels ✅
- ✅ Bug: Gateway Timeout después de cada deploy
- ✅ Causa: Traefik ruteaba tráfico antes de que el API estuviera listo
- ✅ Fix: Añadir Docker healthcheck con `start_period: 30s` para migrations
- ✅ Fix: Añadir Traefik labels para healthcheck-aware routing
- ✅ PR: https://github.com/Miguelslo27/dental-saas/pull/40

### PR #43: Document post-deploy proxy restart solution ✅
- ✅ Bug: Gateway timeout persistente después de deploys en Coolify
- ✅ Causa: coolify-proxy container necesita reiniciarse para reconocer nuevos healthchecks
- ✅ Fix: Documentado workaround en COOLIFY-TROUBLESHOOTING.md
- ✅ PR: https://github.com/Miguelslo27/dental-saas/pull/43

### PR #44: Password Recovery for Super Admin + Rename to Alveo System ✅
- ✅ Modelo `PasswordResetToken` en Prisma con hash SHA-256
- ✅ Template `PasswordResetEmail.tsx` con React Email
- ✅ Endpoint `POST /api/admin/auth/forgot-password` (seguro contra enumeración)
- ✅ Endpoint `POST /api/admin/auth/reset-password` (validación, hash, invalidación de refresh tokens)
- ✅ `AdminForgotPasswordPage.tsx` y `AdminResetPasswordPage.tsx` en frontend
- ✅ 12 tests unitarios para password recovery
- ✅ Rename proyecto: "Dental SaaS" → "Alveo System" (38 archivos)
- ✅ PR: https://github.com/Miguelslo27/dental-saas/pull/44

### PR #45: Dedicated Login Endpoint for Super Admin ✅
- ✅ Bug: AdminLoginPage usaba endpoint de tenant (`/api/auth/login`) que requiere clinicSlug
- ✅ Fix: Crear `POST /api/admin/auth/login` dedicado para SUPER_ADMIN
- ✅ Fix: AdminLoginPage usa `adminApiClient` en vez de `apiClient`
- ✅ Refactor: Extraer `cleanupOldRefreshTokens` a `auth.service.ts` (DRY)
- ✅ Fix: Añadir `createdAt` a respuesta de login
- ✅ PR: https://github.com/Miguelslo27/dental-saas/pull/45

### PR #46: Backend - Tenant User Management ✅
- ✅ CRUD completo para usuarios del tenant (`/api/users`)
- ✅ Verificación de límites de plan (owners, admins, doctors, staff)
- ✅ Endpoint GET /api/users/stats para conteo por rol
- ✅ 16 tests unitarios
- ✅ PR: https://github.com/Miguelslo27/dental-saas/pull/46

### PR #47: Frontend - Landing Page and Registration ✅
- ✅ Landing page con pricing de los 3 planes
- ✅ Formulario de registro de tenant
- ✅ Página de confirmación de registro
- ✅ PR: https://github.com/Miguelslo27/dental-saas/pull/47

### PR #48: Password Recovery for Tenant Users ✅
- ✅ Endpoint `POST /api/auth/forgot-password` (requiere email + clinicSlug)
- ✅ Endpoint `POST /api/auth/reset-password` (validación de token, hash, expiración)
- ✅ Módulo compartido `apps/api/src/utils/password-reset.ts` (DRY refactor)
- ✅ `ForgotPasswordPage.tsx` y `ResetPasswordPage.tsx` en frontend
- ✅ Link "¿Olvidaste tu contraseña?" en LoginPage
- ✅ 16 tests unitarios (70 tests totales en API)
- ✅ PR: https://github.com/Miguelslo27/dental-saas/pull/48

### PR #55: Frontend - Doctors Management ✅
- ✅ Cliente API para doctores (`doctor-api.ts`)
- ✅ Zustand store para gestión de estado (`doctors.store.ts`)
- ✅ AppLayout con sidebar responsive para tenant users
- ✅ DoctorsPage con listado, búsqueda y filtros
- ✅ DoctorCard, DoctorFormModal, ConfirmDialog components
- ✅ Integración con límites de plan (banner de upgrade)
- ✅ Accesibilidad: ARIA attributes, escape key handlers, stopPropagation
- ✅ PR: https://github.com/Miguelslo27/dental-saas/pull/55

### PR #56: Frontend - Patients Management ✅
- ✅ Cliente API para pacientes (`patient-api.ts`)
- ✅ Zustand store para gestión de estado (`patients.store.ts`)
- ✅ PatientsPage con listado, búsqueda y filtros
- ✅ PatientCard, PatientFormModal components
- ✅ Validación de fecha de nacimiento (no futura)
- ✅ Integración con límites de plan (15 pacientes free)
- ✅ PR: https://github.com/Miguelslo27/dental-saas/pull/56

### PR #59: Phase 5 - Appointments Management ✅
- ✅ Backend: appointment.service.ts con CRUD completo y detección de conflictos
- ✅ Backend: 54 tests de integración (190 tests totales en API)
- ✅ Backend: 7 tipos de status soportados
- ✅ Frontend: appointment-api.ts con tipos TypeScript
- ✅ Frontend: appointments.store.ts (Zustand)
- ✅ Frontend: AppointmentsPage con navegación mensual
- ✅ Frontend: AppointmentCard con badges de status
- ✅ Frontend: AppointmentFormModal con selectores de paciente/doctor
- ✅ Fix: vitest.config.ts - zombie process issue resuelto
- ✅ 14 comentarios de Copilot review atendidos
- ✅ PR: https://github.com/Miguelslo27/dental-saas/pull/59

### PR #64: Upgrade Dental Chart to react-odontogram ✅
- ✅ Reemplazado componente DentalChart custom por librería `react-odontogram`
- ✅ Visualización SVG realista de dientes con notación FDI
- ✅ Soporte para dientes primarios (temporales)
- ✅ ToothNoteModal inline con accesibilidad mejorada (useId, autoFocus, type="button")
- ✅ 7 comentarios de Copilot review atendidos
- ✅ ~300 líneas de código custom eliminadas
- ✅ PR: https://github.com/Miguelslo27/dental-saas/pull/64

---

## Notas Técnicas: Super Admin

### Seguridad del Super Admin
1. **Sin seed file**: Las credenciales nunca van al repositorio
2. **SETUP_KEY**: Variable de entorno requerida para crear superadmin
3. **Auto-disable**: El endpoint de setup se deshabilita después del primer uso
4. **Rutas separadas**: `/admin/*` completamente separado de `/:clinicSlug/*`

### Variables de Entorno Requeridas
```env
# Super Admin Setup
SETUP_KEY="tu-clave-secreta-de-16-caracteres-minimo"
```

### Flujo de Setup del Super Admin
1. Configurar `SETUP_KEY` en `.env`
2. Navegar a `/admin/setup`
3. Completar formulario con setupKey + credenciales
4. El endpoint se auto-deshabilita
5. Login via `/admin/login`

---

## Fases del Proyecto

---

## 📦 FASE 0: Configuración del Proyecto ✅ COMPLETADA
**Rama:** `feature/initial-setup`  
**Estado:** Completada (PRs #1, #2, #3)

### Tarea 0.1: Crear estructura del monorepo ✅
- [x] 0.1.1: Crear carpeta raíz del proyecto (`dental-saas`)
- [x] 0.1.2: Inicializar workspace con pnpm
- [x] 0.1.3: Crear estructura de carpetas (`/apps/api`, `/apps/web`, `/packages/shared`, `/packages/database`)
- [x] 0.1.4: Configurar pnpm-workspace.yaml
- [x] 0.1.5: Crear .gitignore global
- [x] 0.1.6: Crear README.md del proyecto
- [x] 0.1.7: Configurar Turborepo para monorepo

### Tarea 0.2: Configurar Backend (Node.js 22 LTS) ✅
- [x] 0.2.1: Inicializar proyecto Node.js con TypeScript en `/apps/api`
- [x] 0.2.2: Instalar dependencias core (express@5, typescript, prisma, zod)
- [x] 0.2.3: Configurar tsconfig.json con ES2024
- [x] 0.2.4: Configurar ESLint 9 flat config y Prettier
- [x] 0.2.5: Crear estructura de carpetas (src/routes, src/controllers, src/services, src/middleware)
- [x] 0.2.6: Configurar scripts de package.json (dev, build, start)

### Tarea 0.3: Configurar Frontend (React 19) ✅
- [x] 0.3.1: Crear app React 19 con Vite 6 + TypeScript en `/apps/web`
- [x] 0.3.2: Instalar y configurar Tailwind CSS 4
- [x] 0.3.3: Instalar y configurar Shadcn/ui
- [x] 0.3.4: Configurar ESLint 9 y Prettier
- [x] 0.3.5: Crear estructura de carpetas (src/components, src/pages, src/hooks, src/stores, src/api)
- [x] 0.3.6: Configurar React Router v7

### Tarea 0.4: Configurar Base de Datos y Cache ✅
- [x] 0.4.1: Crear docker-compose.yml con PostgreSQL + Redis
- [x] 0.4.2: Crear package `/packages/database` para Prisma
- [x] 0.4.3: Inicializar Prisma en /packages/database
- [x] 0.4.4: Crear schema.prisma inicial vacío
- [x] 0.4.5: Configurar variables de entorno (.env.example)

### Tarea 0.5: Configurar Docker para desarrollo ✅
- [x] 0.5.1: Crear Dockerfile para API
- [x] 0.5.2: Crear Dockerfile para Web
- [x] 0.5.3: Actualizar docker-compose.yml con servicios de desarrollo
- [x] 0.5.4: Documentar comandos de desarrollo en README

---

## 📦 FASE 1: Core Multi-Tenant y Modelos Base ✅ COMPLETADA
**Rama:** `feature/multi-tenant-core`  
**Estado:** Completada (PRs #4, #5, #6, #7, #8)

### Tarea 1.1: Definir Schema de Prisma - Core SaaS ✅
- [x] 1.1.1: Crear modelo Plan
- [x] 1.1.2: Crear modelo Tenant
- [x] 1.1.3: Crear modelo Subscription
- [x] 1.1.4: Crear modelo User con tenantId
- [x] 1.1.5: Crear modelo PaymentMethod
- [x] 1.1.6: Crear modelo Invoice
- [x] 1.1.7: Crear seed de planes iniciales (free, basic, enterprise)

### Tarea 1.2: Definir Schema de Prisma - Entidades de Negocio ✅
- [x] 1.2.1: Crear modelo Doctor con tenantId
- [x] 1.2.2: Crear modelo Patient con tenantId
- [x] 1.2.3: Crear modelo Appointment con tenantId
- [x] 1.2.4: Crear modelo AppointmentImage con tenantId
- [x] 1.2.5: Crear tabla de unión AppointmentDoctor
- [x] 1.2.6: Crear modelo Labwork con tenantId
- [x] 1.2.7: Crear modelo Expense con tenantId
- [x] 1.2.8: Crear modelo TenantSetting
- [x] 1.2.9: Crear modelo UserPermission
- [x] 1.2.10: Crear modelo AuditLog
- [x] 1.2.11: Crear modelo Backup
- [x] 1.2.12: Ejecutar primera migración de Prisma

### Tarea 1.3: Crear servidor Express básico con Multi-Tenant ✅
- [x] 1.3.1: Crear app.ts con configuración de Express 5
- [x] 1.3.2: Configurar CORS con whitelist
- [x] 1.3.3: Configurar middleware de JSON parsing
- [x] 1.3.4: Crear middleware de error handling global
- [x] 1.3.5: Crear health check endpoint (/api/health)
- [x] 1.3.6: Configurar logger (pino)
- [x] 1.3.7: Crear middleware de extracción de tenant
- [x] 1.3.8: Crear middleware de inyección de tenantId en Prisma queries

### Tarea 1.4: Crear utilidades base ✅
- [x] 1.4.1: Crear cliente Prisma singleton con tenant isolation
- [x] 1.4.2: Crear cliente Redis
- [x] 1.4.3: Crear tipos compartidos en /packages/shared
- [x] 1.4.4: Crear helpers de respuesta API
- [x] 1.4.5: Crear esquemas Zod base para validación
- [x] 1.4.6: Crear servicio de verificación de límites de plan

### Tarea 1.5: CRUD de Entidades Base (API) ✅
- [x] 1.5.1: Crear CRUD completo de Patient (/api/patients) - PR #6
- [x] 1.5.2: Crear CRUD completo de Doctor (/api/doctors) - PR #7
- [x] 1.5.3: Crear CRUD completo de Appointment (/api/appointments) - PR #8

---

## 📦 FASE 2: Registro de Tenants y Autenticación 🔄 EN PROGRESO
**Rama:** `feature/authentication`  
**Estado:** Backend Auth completado (PRs #9-12), Super Admin completado (PRs #13-14)

### Tarea 2.1: Backend - Registro de Tenants (Onboarding) ✅
**Nota:** Completado como parte del PR #44 (Password Recovery). El endpoint `/api/auth/register` crea tenants y envía emails de bienvenida.

#### Subtareas:
- [x] 2.1.1: Instalar dependencias (resend, @react-email/components)
- [x] 2.1.2: Crear servicio de email (`src/services/email.service.ts`)
  - Inicializar cliente Resend con API key desde env
  - Función `sendWelcomeEmail(to, firstName, clinicName, loginUrl)`
  - Manejo de errores y logging
- [x] 2.1.3: Crear template de bienvenida (`src/emails/WelcomeEmail.tsx`)
  - Usar componentes de @react-email/components (Html, Container, Text, Button, etc.)
  - Props: firstName, clinicName, loginUrl
  - Diseño profesional con logo y branding
- [x] 2.1.4: Crear endpoint GET /api/tenants/check-slug/:slug
  - Verificar disponibilidad de slug
  - Retornar { available: boolean, suggestions?: string[] }
- [x] 2.1.5: Modificar POST /api/auth/register para enviar email de bienvenida
  - Llamar a `sendWelcomeEmail()` después de crear usuario (async, no bloquea respuesta)
  - Log de error si falla el envío (no afecta registro)
- [x] 2.1.6: Añadir variables de entorno
  - `RESEND_API_KEY` - API key de Resend
  - `EMAIL_FROM` - Dirección de envío (ej: "Alveo System <noreply@tudominio.com>")

#### Notas técnicas - Resend:
- SDK: `npm install resend`
- Uso básico:
  ```typescript
  import { Resend } from 'resend';
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'Dental <noreply@dental.com>',
    to: ['user@email.com'],
    subject: 'Welcome!',
    react: WelcomeEmail({ firstName: 'John' }), // o html: '<p>...</p>'
  });
  ```
### Tarea 2.2: Backend - Autenticación ✅ (PR #9)
- [x] 2.2.1: Instalar bcrypt y jsonwebtoken
- [x] 2.2.2: Crear servicio de hash de contraseñas (bcrypt 12 rounds)
- [x] 2.2.3: Crear servicio de generación/verificación JWT
- [x] 2.2.4: Crear endpoint POST /api/auth/login
- [x] 2.2.5: Crear endpoint POST /api/auth/refresh-token
- [x] 2.2.6: Crear endpoint GET /api/auth/me
- [x] 2.2.7: Crear endpoint POST /api/auth/forgot-password (para usuarios de tenant) ✅ PR #48
- [x] 2.2.8: Crear endpoint POST /api/auth/reset-password (para usuarios de tenant) ✅ PR #48
- [x] 2.2.9: Crear middleware de autenticación
- [x] 2.2.10: Crear middleware de autorización por rol (OWNER/ADMIN/DOCTOR/STAFF)
- [ ] 2.2.11: Implementar rate limiting con Redis

### Tarea 2.2.A: Password Recovery para Super Admin ✅ (PRs #44, #45)
**Descripción:** Implementar flujo de recuperación de contraseña para SUPER_ADMIN usando Resend.

#### Modelo de Datos (Prisma)
Añadir modelo `PasswordResetToken` al schema:
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  tokenHash String   @unique // SHA-256 hash del token
  expiresAt DateTime
  usedAt    DateTime? // null si no se ha usado
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([expiresAt])
  @@map("password_reset_tokens")
}
```

#### Archivos a crear/modificar:
1. `packages/database/prisma/schema.prisma` - Añadir PasswordResetToken
2. `apps/api/src/emails/PasswordResetEmail.tsx` - Template del email
3. `apps/api/src/services/email.service.ts` - Añadir sendPasswordResetEmail()
4. `apps/api/src/routes/admin/auth.ts` - NUEVO: Rutas de auth para admin
5. `apps/web/src/pages/admin/AdminForgotPasswordPage.tsx` - Formulario de solicitud
6. `apps/web/src/pages/admin/AdminResetPasswordPage.tsx` - Formulario de reset

#### Subtareas Backend:
- [x] 2.2.A.1: Añadir modelo PasswordResetToken a schema.prisma
- [x] 2.2.A.2: Ejecutar migración `pnpm prisma migrate dev --name add_password_reset_tokens`
- [x] 2.2.A.3: Crear template PasswordResetEmail.tsx
  - Props: firstName, resetUrl, expiresInMinutes
  - Diseño minimalista, instrucciones claras
  - Mensaje de seguridad ("Si no solicitaste esto, ignora el email")
- [x] 2.2.A.4: Añadir sendPasswordResetEmail() a email.service.ts
  - Params: to, firstName, resetUrl
  - Subject: "Reset your Alveo System password"
- [x] 2.2.A.5: Crear router /api/admin/auth con:
  - POST /api/admin/auth/login (autenticación dedicada para SUPER_ADMIN)
  - POST /api/admin/auth/forgot-password
  - POST /api/admin/auth/reset-password
- [ ] 2.2.A.6: Añadir rate limiting (3 intentos por IP en 15 min)
- [x] 2.2.A.7: Tests unitarios para endpoints (12 tests)

#### Subtareas Frontend:
- [x] 2.2.A.8: Crear AdminForgotPasswordPage.tsx
- [x] 2.2.A.9: Crear AdminResetPasswordPage.tsx
- [x] 2.2.A.10: Añadir link "¿Olvidaste tu contraseña?" en AdminLoginPage
- [x] 2.2.A.11: Añadir rutas en App.tsx
- [x] 2.2.A.12: Usar adminApiClient en AdminLoginPage (fix endpoint correcto)

#### Seguridad:
- Token de un solo uso (marcado con usedAt después de usar)
- Expiración corta (15 minutos)
- Rate limiting para prevenir enumeración de usuarios (PENDIENTE)
- Respuesta genérica en forgot-password (no revelar si email existe)
- Invalidación de todos los refresh tokens al cambiar contraseña
- Hash del token en DB (no guardar token plano)
- cleanupOldRefreshTokens extraído a auth.service.ts (DRY)

### Tarea 2.2.B: Password Recovery para Tenant Users ✅
**Descripción:** Implementar flujo de recuperación de contraseña para usuarios de clínicas (tenant users).

#### Diferencias con Super Admin Flow:
- Los endpoints van en `/api/auth/*` (no `/api/admin/auth/*`)
- El forgot-password require `clinicSlug` para identificar el tenant
- El reset-password NO necesita validar role (acepta cualquier usuario de tenant)
- La URL de reset incluye el clinicSlug: `/{clinicSlug}/reset-password?token=xxx`

#### Archivos a crear/modificar:
1. `apps/api/src/routes/auth.ts` - Añadir endpoints forgot-password y reset-password
2. `apps/api/src/routes/auth.test.ts` - NUEVO: Tests para password recovery de tenant users
3. `apps/web/src/pages/auth/ForgotPasswordPage.tsx` - Formulario de solicitud
4. `apps/web/src/pages/auth/ResetPasswordPage.tsx` - Formulario de reset
5. `apps/web/src/App.tsx` - Añadir rutas

#### Subtareas Backend:
- [x] 2.2.B.1: Crear POST /api/auth/forgot-password
  - Params: `{ email, clinicSlug }`
  - Buscar user por email + tenantId (resuelto via slug)
  - Generar token, hashear, guardar en PasswordResetToken
  - Enviar email con link: `/{clinicSlug}/reset-password?token=xxx`
  - Respuesta genérica para evitar email enumeration
- [x] 2.2.B.2: Crear POST /api/auth/reset-password
  - Params: `{ token, password }`
  - Validar token hash, expiración, usedAt, user isActive
  - NO validar rol (cualquier tenant user puede resetear)
  - Actualizar password, marcar token usado, invalidar refresh tokens
- [x] 2.2.B.3: Tests unitarios (15 tests)

#### Subtareas Frontend:
- [x] 2.2.B.4: Crear ForgotPasswordPage.tsx (requiere email + clinicSlug)
- [x] 2.2.B.5: Crear ResetPasswordPage.tsx
- [x] 2.2.B.6: Añadir link "¿Olvidaste tu contraseña?" en LoginPage
- [x] 2.2.B.7: Añadir rutas en App.tsx

### Tarea 2.3: Backend - Gestión de Usuarios del Tenant ✅ (PR #46)
- [x] 2.3.1: Crear endpoint GET /api/users (admin only)
- [x] 2.3.2: Crear endpoint GET /api/users/:id
- [x] 2.3.3: Crear endpoint POST /api/users
- [x] 2.3.4: Crear endpoint PUT /api/users/:id
- [x] 2.3.5: Crear endpoint DELETE /api/users/:id
- [x] 2.3.6: Crear endpoint PUT /api/users/:id/role (cambio de rol)
- [x] 2.3.7: Crear user.service.ts con verificación de límites de plan
- [x] 2.3.8: Crear endpoint GET /api/users/stats (conteo por rol y límites)
- [x] 2.3.9: Tests unitarios (16 tests)

### Tarea 2.4: Frontend - Landing Page y Registro ✅ (PR #47)
- [x] 2.4.1: Crear layout de landing page
- [x] 2.4.2: Crear página de pricing con los 3 planes
- [x] 2.4.3: Crear formulario de registro de tenant (ya existía RegisterPage.tsx)
- [x] 2.4.4: Crear página de confirmación de registro
- [ ] 2.4.5: Implementar flujo de onboarding inicial (diferido a fase posterior)

### Tarea 2.5: Frontend - Autenticación ✅ (Ya implementado)
- [x] 2.5.1: Crear página de Login (LoginPage.tsx)
- [x] 2.5.2: Crear página de Forgot Password (admin flow)
- [x] 2.5.3: Crear página de Reset Password (admin flow)
- [x] 2.5.4: Crear store de autenticación (Zustand) (auth.store.ts)
- [x] 2.5.5: Crear hook useAuth (useAuth.ts)
- [x] 2.5.6: Crear componente ProtectedRoute (ProtectedRoute.tsx)
- [x] 2.5.7: Crear interceptor de Axios para tokens (api.ts)
- [x] 2.5.8: Implementar refresh token automático (api.ts interceptor)
- [ ] 2.5.9: Crear página de perfil de usuario (diferido a fase 4)

### Tarea 2.6: Super Admin ✅ (PRs #13, #14)
- [x] 2.6.1: Backend - Role SUPER_ADMIN y middleware
- [x] 2.6.2: Backend - Endpoint /api/admin/setup (one-time)
- [x] 2.6.3: Backend - CRUD de tenants y users
- [x] 2.6.4: Backend - Estadísticas de plataforma
- [x] 2.6.5: Frontend - Admin store y API service
- [x] 2.6.6: Frontend - AdminLayout con sidebar
- [x] 2.6.7: Frontend - Páginas setup, login, dashboard, tenants, users

---

## 📦 FASE 3: Gestión de Doctores (con límites de plan) ✅ COMPLETADA
**Rama Backend:** `feature/doctors-management` ✅ COMPLETADO  
**Rama Frontend:** `feature/doctors-frontend` ✅ COMPLETADO (PR #55)
**Duración estimada:** 2 días

### Tarea 3.1: Backend - CRUD Doctores ✅ COMPLETADO
- [x] 3.1.1: Crear esquemas Zod para Doctor (`apps/api/src/routes/doctors.ts`)
- [x] 3.1.2: Crear servicio DoctorService con tenant isolation (`apps/api/src/services/doctor.service.ts`)
- [x] 3.1.3: Crear middleware de verificación de límite de doctores por plan (`checkDoctorLimit()`)
- [x] 3.1.4: Crear endpoint GET /api/doctors
- [x] 3.1.5: Crear endpoint GET /api/doctors/:id
- [x] 3.1.6: Crear endpoint POST /api/doctors
- [x] 3.1.7: Crear endpoint PUT /api/doctors/:id
- [x] 3.1.8: Crear endpoint DELETE /api/doctors/:id (soft delete)
- [x] 3.1.9: Crear endpoint PUT /api/doctors/:id/restore
- [x] 3.1.10: Crear endpoint GET /api/doctors/stats
- [x] 3.1.11: Tests unitarios (641 líneas en `doctors.test.ts`)

### Tarea 3.2: Frontend - Gestión de Doctores ✅ COMPLETADA
**PR:** #55 (Merged)

#### Archivos a crear:
1. `apps/app/src/lib/doctor-api.ts` - Cliente API para doctores
2. `apps/app/src/stores/doctors.store.ts` - Zustand store
3. `apps/app/src/pages/doctors/DoctorsPage.tsx` - Página principal de listado
4. `apps/app/src/components/doctors/DoctorCard.tsx` - Card para mostrar doctor
5. `apps/app/src/components/doctors/DoctorFormModal.tsx` - Modal crear/editar
6. `apps/app/src/components/doctors/DoctorPicker.tsx` - Selector de doctor (para citas)
7. `apps/app/src/components/layout/AppLayout.tsx` - Layout con sidebar para tenant users
8. `apps/app/src/App.tsx` - Añadir rutas `/doctors`

#### Subtareas:
- [x] 3.2.1: Crear `doctor-api.ts` con funciones:
  - `getDoctors(params?)` - Lista paginada con búsqueda
  - `getDoctorById(id)` - Obtener doctor por ID
  - `createDoctor(data)` - Crear nuevo doctor
  - `updateDoctor(id, data)` - Actualizar doctor
  - `deleteDoctor(id)` - Soft delete
  - `restoreDoctor(id)` - Restaurar doctor eliminado
  - `getDoctorStats()` - Estadísticas y límites
- [x] 3.2.2: Crear `doctors.store.ts` (Zustand):
  - Estado: `doctors`, `loading`, `error`, `stats`
  - Acciones: `fetchDoctors`, `addDoctor`, `updateDoctor`, `removeDoctor`
- [x] 3.2.3: Crear `AppLayout.tsx` con sidebar:
  - Navegación: Dashboard, Doctores, Pacientes, Citas, Configuración
  - User menu con logout
  - Responsive (mobile hamburger menu)
- [x] 3.2.4: Crear `DoctorsPage.tsx`:
  - Header con título y botón "Nuevo Doctor"
  - Barra de búsqueda
  - Grid de DoctorCards
  - Estado vacío cuando no hay doctores
  - Banner de límite alcanzado
- [x] 3.2.5: Crear `DoctorCard.tsx`:
  - Avatar (iniciales si no hay foto)
  - Nombre, especialidad, teléfono
  - Días de trabajo (badges)
  - Botones: Editar, Eliminar
- [x] 3.2.6: Crear `DoctorFormModal.tsx`:
  - Campos: firstName, lastName, email, phone, specialty, licenseNumber
  - Campos: workingDays (checkboxes), workingHours (start/end)
  - Campos: consultingRoom, bio, hourlyRate
  - Validación con React Hook Form + Zod
  - Modo crear vs editar
- [x] 3.2.7: Crear modal de confirmación de eliminación (reutilizable)
- [ ] 3.2.8: Crear `DoctorPicker.tsx` (para uso en citas):
  - Dropdown/Combobox con búsqueda
  - Mostrar nombre y especialidad
- [x] 3.2.9: Actualizar `App.tsx`:
  - Añadir ruta `/doctors` con ProtectedRoute
  - Añadir AppLayout como wrapper

#### Tipos TypeScript (`doctor-api.ts`):
```typescript
interface Doctor {
  id: string
  tenantId: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  specialty: string | null
  licenseNumber: string | null
  workingDays: string[]
  workingHours: { start: string; end: string } | null
  consultingRoom: string | null
  avatar: string | null
  bio: string | null
  hourlyRate: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface DoctorStats {
  total: number
  active: number
  limit: number
  canAdd: boolean
}

interface CreateDoctorData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  specialty?: string
  licenseNumber?: string
  workingDays?: string[]
  workingHours?: { start: string; end: string }
  consultingRoom?: string
  bio?: string
  hourlyRate?: number
}
```

---

## 📦 FASE 4: Gestión de Pacientes (con límites de plan) ✅ COMPLETADA
**Rama:** `feature/patients-management` ✅ COMPLETADO  
**PR:** #56 ✅ MERGED  
**Duración estimada:** 2 días  
**Fecha completada:** 10 de Enero, 2026

### Tarea 4.1: Backend - CRUD Pacientes ✅ COMPLETADO
- [x] 4.1.1: Crear esquemas Zod para Patient
- [x] 4.1.2: Crear servicio PatientService con tenant isolation
- [x] 4.1.3: Crear middleware de verificación de límite de pacientes por plan
- [x] 4.1.4: Crear endpoint GET /api/patients
- [x] 4.1.5: Crear endpoint GET /api/patients/:id
- [x] 4.1.6: Crear endpoint POST /api/patients
- [x] 4.1.7: Crear endpoint PUT /api/patients/:id
- [x] 4.1.8: Crear endpoint DELETE /api/patients/:id (soft delete)
- [x] 4.1.9: Crear endpoint PUT /api/patients/:id/restore
- [x] 4.1.10: Crear endpoint GET /api/patients/stats
- [x] 4.1.11: Tests unitarios con DOB future validation (136 tests total)

### Tarea 4.2: Frontend - Gestión de Pacientes ✅ COMPLETADO
**PR:** #56 (Merged)

#### Archivos creados:
1. [x] `apps/app/src/lib/patient-api.ts` - Cliente API para pacientes
2. [x] `apps/app/src/stores/patients.store.ts` - Zustand store
3. [x] `apps/app/src/pages/patients/PatientsPage.tsx` - Página principal de listado
4. [x] `apps/app/src/components/patients/PatientCard.tsx` - Card para mostrar paciente
5. [x] `apps/app/src/components/patients/PatientFormModal.tsx` - Modal crear/editar
6. [x] `apps/app/src/App.tsx` - Añadir rutas `/patients`

#### Subtareas:
- [x] 4.2.1: Crear `patient-api.ts` con funciones CRUD
- [x] 4.2.2: Crear `patients.store.ts` (Zustand)
- [x] 4.2.3: Crear `PatientsPage.tsx` con grid y filtros
- [x] 4.2.4: Crear `PatientCard.tsx` con información básica
- [x] 4.2.5: Crear `PatientFormModal.tsx` con validación DOB
- [x] 4.2.6: Añadir DOB future validation (frontend + backend)
- [x] 4.2.7: Implementar plan limit banner (15 pacientes free)
- [x] 4.2.8: Integrar en App.tsx con ProtectedRoute
- [x] 4.2.9: Validación de email único por tenant

### Tarea 4.3: Dental Chart (Odontograma) ✅ COMPLETADO
**Estado:** Implementado con JSON en Patient
**Rama:** `feature/phase4-dental-chart`
**PR:** #63

#### Implementación Actual (v1 - JSON)
- [x] 4.3.1: Añadir campo `teeth Json?` al modelo Patient
- [x] 4.3.2: Crear endpoint GET/PATCH /api/patients/:id/teeth
- [x] 4.3.3: Crear componente visual DentalChart (interactivo)
- [x] 4.3.4: Implementar selección de dientes con notación ISO 3950 (FDI)
- [x] 4.3.5: Implementar modal de notas por diente (ToothNoteModal)
- [x] 4.3.6: Integrar en vista de detalle de paciente (PatientDetailPage)
- [x] 4.3.7: Añadir toggle dientes permanentes/temporales
- [x] 4.3.8: Tests de API (12 nuevos tests, 216 total)

#### Notación ISO 3950 (FDI)
```
Permanentes (32 dientes):
  Superior derecho: 18-17-16-15-14-13-12-11
  Superior izquierdo: 21-22-23-24-25-26-27-28
  Inferior izquierdo: 31-32-33-34-35-36-37-38
  Inferior derecho: 48-47-46-45-44-43-42-41

Temporales (20 dientes):
  Superior derecho: 55-54-53-52-51
  Superior izquierdo: 61-62-63-64-65
  Inferior izquierdo: 71-72-73-74-75
  Inferior derecho: 85-84-83-82-81
```

---

### 📋 MEJORA FUTURA: Tabla Separada para Dental Chart (v2)

**Cuándo migrar:** Cuando se necesite historial de tratamientos, condiciones estructuradas o reportes agregados.

#### Beneficios de tabla separada (`ToothRecord`)
1. **Historial:** Mantener versiones de cada nota (quién la modificó, cuándo)
2. **Estructura:** Campos específicos (condition, treatment, severity, etc.)
3. **Reportes:** Queries SQL directas ("pacientes con caries en molar 16")
4. **Integraciones:** Vincular tratamientos/citas a dientes específicos
5. **Imágenes:** Asociar radiografías/fotos a dientes individuales

#### Arquitectura Propuesta (v2)

```prisma
model ToothRecord {
  id          String   @id @default(cuid())
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  toothNumber String   // "11", "21", "55", etc. (ISO 3950)
  
  // Información estructurada
  condition   ToothCondition?  // HEALTHY, CARIES, MISSING, CROWN, etc.
  notes       String?
  treatment   String?
  severity    Int?             // 1-5 scale
  
  // Historial
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String   // userId
  
  // Índices
  @@unique([patientId, toothNumber])  // Un registro por diente por paciente
  @@index([patientId])
  @@index([condition])
}

enum ToothCondition {
  HEALTHY
  CARIES
  FILLED
  CROWN
  EXTRACTION_NEEDED
  MISSING
  IMPLANT
  ROOT_CANAL
  BRIDGE
}
```

#### Endpoints v2
- GET /api/patients/:id/dental-chart → Lista completa de registros
- GET /api/patients/:id/teeth/:toothNumber → Registro específico
- PUT /api/patients/:id/teeth/:toothNumber → Crear/actualizar registro
- GET /api/patients/:id/teeth/:toothNumber/history → Historial de cambios
- GET /api/reports/dental?condition=CARIES → Reporte agregado

#### Migración de v1 a v2
```typescript
// Script de migración
for (const patient of patients) {
  if (patient.teeth) {
    for (const [toothNumber, notes] of Object.entries(patient.teeth)) {
      await prisma.toothRecord.create({
        data: {
          patientId: patient.id,
          toothNumber,
          notes,
          createdBy: 'migration'
        }
      });
    }
  }
}
```

---

## 📦 FASE 5: Gestión de Citas (con límites de storage) 🔄 EN PROGRESO
**Rama:** `feature/phase5-appointments-management`  
**PR:** #59 ✅ MERGED  
**Duración estimada:** 4 días  
**Fecha inicio:** 10 de Enero, 2026

### Tarea 5.1: Backend - CRUD Citas ✅ COMPLETADO
- [x] 5.1.1: Crear esquemas Zod para Appointment
- [x] 5.1.2: Crear servicio AppointmentService (`appointment.service.ts`)
- [x] 5.1.3: Crear endpoint GET /api/appointments
- [x] 5.1.4: Crear endpoint GET /api/appointments/:id
- [x] 5.1.5: Crear endpoint POST /api/appointments
- [x] 5.1.6: Crear endpoint PUT /api/appointments/:id
- [x] 5.1.7: Crear endpoint DELETE /api/appointments/:id (soft delete)
- [x] 5.1.8: Crear endpoint PUT /api/appointments/:id/mark-done
- [x] 5.1.9: Crear endpoint GET /api/appointments/stats
- [x] 5.1.10: Crear endpoint PUT /api/appointments/:id/restore
- [x] 5.1.11: Detección de conflictos de horario por doctor
- [x] 5.1.12: Tests unitarios (54 tests, 190 totales en API)

### Tarea 5.2: Backend - Imágenes de Citas ⏳ PENDIENTE
- [ ] 5.2.1: Configurar Multer para uploads
- [ ] 5.2.2: Crear servicio de almacenamiento (S3)
- [ ] 5.2.3: Crear servicio de tracking de storage por tenant
- [ ] 5.2.4: Crear middleware de verificación de límite de storage
- [ ] 5.2.5: Crear endpoint POST /api/appointments/:id/images
- [ ] 5.2.6: Crear endpoint DELETE /api/appointments/:id/images/:imageId
- [ ] 5.2.7: Crear endpoint GET /api/appointments/:id/images
- [ ] 5.2.8: Crear endpoint GET /api/storage/usage

### Tarea 5.3: Frontend - Vista de Calendario ✅ COMPLETADO (Básico)
- [ ] 5.3.1: Instalar y configurar FullCalendar (DIFERIDO - usando vista custom)
- [x] 5.3.2: Crear página de calendario (AppointmentsPage.tsx)
- [x] 5.3.3: Implementar vista mensual con navegación
- [ ] 5.3.4: Implementar vista semanal (DIFERIDO)
- [x] 5.3.5: Implementar navegación entre fechas (mes anterior/siguiente)
- [x] 5.3.6: Mostrar citas con filtros de status
- [x] 5.3.7: Filtrar por doctor y paciente

### Tarea 5.4: Frontend - CRUD de Citas ✅ COMPLETADO
- [x] 5.4.1: Crear store de citas (`appointments.store.ts` - Zustand)
- [x] 5.4.2: Crear cliente API (`appointment-api.ts`)
- [x] 5.4.3: Crear formulario de cita (`AppointmentFormModal.tsx`)
- [x] 5.4.4: Crear componente AppointmentCard (`AppointmentCard.tsx`)
- [x] 5.4.5: Implementar marcar cita como completada
- [ ] 5.4.6: Implementar upload de imágenes (DEPENDE de 5.2)
- [ ] 5.4.7: Implementar galería de imágenes (DEPENDE de 5.2)
- [ ] 5.4.8: Crear componente de prescripciones (DIFERIDO)

---

## 📦 FASE 6: Trabajos de Laboratorio y Gastos ✅ COMPLETADA
**Rama:** `feature/phase6-labworks-expenses`  
**Duración estimada:** 2 días
**Fecha de Implementación:** 12 de Enero, 2026
**PR:** #60 (Merged)

### Tarea 6.1: Backend - Labworks ✅
- [x] 6.1.1: Crear esquemas Zod para Labwork
- [x] 6.1.2: Crear servicio LabworkService (`labwork.service.ts`)
- [x] 6.1.3: Crear endpoints CRUD /api/labworks (`labworks.ts`)
- [x] 6.1.4: Crear endpoint de estadísticas de labworks

### Tarea 6.2: Backend - Expenses ✅
- [x] 6.2.1: Crear esquemas Zod para Expense
- [x] 6.2.2: Crear servicio ExpenseService (`expense.service.ts`)
- [x] 6.2.3: Crear endpoints CRUD /api/expenses (`expenses.ts`)
- [x] 6.2.4: Crear endpoint de estadísticas de gastos

### Tarea 6.3: Frontend - Labworks ✅
- [x] 6.3.1: Crear API client (`labwork-api.ts`) y store de labworks (`labworks.store.ts`)
- [x] 6.3.2: Crear página de listado de labworks (`LabworksPage.tsx`)
- [x] 6.3.3: Crear formulario de labwork (`LabworkFormModal.tsx`)
- [x] 6.3.4: Implementar filtros por estado de pago y entrega
- [x] 6.3.5: Crear componente de tarjeta (`LabworkCard.tsx`)

### Tarea 6.4: Frontend - Expenses ✅
- [x] 6.4.1: Crear API client (`expense-api.ts`) y store de expenses (`expenses.store.ts`)
- [x] 6.4.2: Crear página de listado de expenses (`ExpensesPage.tsx`)
- [x] 6.4.3: Crear formulario de expense (`ExpenseFormModal.tsx`) con items y tags
- [x] 6.4.4: Implementar tags y filtros
- [x] 6.4.5: Crear componente de tarjeta (`ExpenseCard.tsx`)

### Migración de Base de Datos
- [x] Migración `20260112001606_add_labworks_expenses` aplicada
- [x] Modelos Labwork y Expense añadidos al schema de Prisma
- [x] Relaciones con Patient y Tenant establecidas

---

## 📦 FASE 7: Estadísticas y Dashboard
**Rama:** `feature/statistics-dashboard`  
**Duración estimada:** 2 días

### Tarea 7.1: Backend - Endpoints de Estadísticas
- [ ] 7.1.1: Crear endpoint GET /api/stats/overview
- [ ] 7.1.2: Crear endpoint GET /api/stats/revenue
- [ ] 7.1.3: Crear endpoint GET /api/stats/appointments
- [ ] 7.1.4: Crear endpoint GET /api/stats/patients-growth
- [ ] 7.1.5: Crear endpoint GET /api/stats/doctors-performance
- [ ] 7.1.6: Crear middleware para restringir reportes según plan

### Tarea 7.2: Frontend - Dashboard
- [ ] 7.2.1: Crear página de dashboard
- [ ] 7.2.2: Crear componente de tarjetas de resumen
- [ ] 7.2.3: Crear gráfico de ingresos (Recharts)
- [ ] 7.2.4: Crear gráfico de citas
- [ ] 7.2.5: Crear widget de próximas citas
- [ ] 7.2.6: Crear widget de pagos pendientes
- [ ] 7.2.7: Crear widget de uso del plan
- [ ] 7.2.8: Mostrar features bloqueados con CTA de upgrade

---

## 📦 FASE 8: Suscripciones y Pagos (Stripe)
**Rama:** `feature/billing-stripe`  
**Duración estimada:** 3-4 días

### Tarea 8.1: Backend - Integración Stripe
- [ ] 8.1.1: Instalar Stripe SDK
- [ ] 8.1.2: Crear servicio StripeService
- [ ] 8.1.3: Crear endpoint POST /api/billing/create-checkout-session
- [ ] 8.1.4: Crear endpoint POST /api/billing/create-portal-session
- [ ] 8.1.5: Crear endpoint POST /api/billing/webhook
- [ ] 8.1.6: Implementar handler para subscription.created
- [ ] 8.1.7: Implementar handler para subscription.updated
- [ ] 8.1.8: Implementar handler para subscription.deleted
- [ ] 8.1.9: Implementar handler para invoice.paid
- [ ] 8.1.10: Implementar handler para invoice.payment_failed
- [ ] 8.1.11: Crear endpoint GET /api/billing/subscription
- [ ] 8.1.12: Crear endpoint GET /api/billing/invoices
- [ ] 8.1.13: Crear job para emails de recordatorio de pago

### Tarea 8.2: Backend - Gestión de Límites por Plan
- [ ] 8.2.1: Crear servicio PlanLimitsService
- [ ] 8.2.2: Implementar método canAddDoctor(tenantId)
- [ ] 8.2.3: Implementar método canAddPatient(tenantId)
- [ ] 8.2.4: Implementar método canAddAdmin(tenantId)
- [ ] 8.2.5: Implementar método canUploadFile(tenantId, fileSize)
- [ ] 8.2.6: Implementar método getCurrentUsage(tenantId)
- [ ] 8.2.7: Crear cron job para verificar suscripciones vencidas

### Tarea 8.3: Frontend - Billing
- [ ] 8.3.1: Crear página de billing/suscripción
- [ ] 8.3.2: Mostrar plan actual y uso
- [ ] 8.3.3: Crear componente de comparación de planes
- [ ] 8.3.4: Implementar botón de upgrade con Stripe Checkout
- [ ] 8.3.5: Implementar botón de acceso a Stripe Customer Portal
- [ ] 8.3.6: Mostrar historial de facturas
- [ ] 8.3.7: Crear banners de advertencia cuando se acercan los límites
- [ ] 8.3.8: Crear modal de bloqueo cuando se exceden los límites

---

## 📦 FASE 9: Configuración del Tenant (Settings)
**Rama:** `feature/settings`  
**Duración estimada:** 1-2 días

### Tarea 9.1: Backend - Settings del Tenant
- [ ] 9.1.1: Crear endpoints CRUD /api/settings
- [ ] 9.1.2: Implementar settings por defecto al crear tenant
- [ ] 9.1.3: Crear endpoint PUT /api/tenant/profile

### Tarea 9.2: Frontend - Página de Settings
- [ ] 9.2.1: Crear página de configuración del tenant
- [ ] 9.2.2: Implementar configuración de moneda
- [ ] 9.2.3: Implementar footer de prescripciones
- [ ] 9.2.4: Implementar configuración de teléfono
- [ ] 9.2.5: Implementar selector de idioma
- [ ] 9.2.6: Implementar configuración de formato de fecha
- [ ] 9.2.7: Crear sección de gestión de usuarios del tenant
- [ ] 9.2.8: Crear sección de perfil del tenant

---

## 📦 FASE 10: Backups (con restricciones por plan)
**Rama:** `feature/backups`  
**Duración estimada:** 1-2 días

### Tarea 10.1: Backend - Backups
- [ ] 10.1.1: Crear servicio de backup de datos del tenant
- [ ] 10.1.2: Crear endpoint POST /api/backups/create
- [ ] 10.1.3: Crear endpoint GET /api/backups
- [ ] 10.1.4: Crear endpoint GET /api/backups/:id/download
- [ ] 10.1.5: Crear endpoint POST /api/backups/:id/restore
- [ ] 10.1.6: Crear endpoint DELETE /api/backups/:id
- [ ] 10.1.7: Crear cron job para backups automáticos
- [ ] 10.1.8: Crear cron job para limpiar backups expirados

### Tarea 10.2: Frontend - Gestión de Backups
- [ ] 10.2.1: Crear sección de backups en settings
- [ ] 10.2.2: Implementar lista de backups
- [ ] 10.2.3: Implementar crear backup manual
- [ ] 10.2.4: Implementar descargar backup
- [ ] 10.2.5: Implementar restaurar backup

---

## 📦 FASE 11: Generación de PDFs
**Rama:** `feature/pdf-generation`  
**Duración estimada:** 1 día

### Tarea 11.1: Backend - Generación de PDFs
- [ ] 11.1.1: Instalar librería de PDF
- [ ] 11.1.2: Crear servicio de generación de PDF
- [ ] 11.1.3: Crear endpoint GET /api/prescriptions/:appointmentId/pdf
- [ ] 11.1.4: Crear template de prescripción con branding del tenant

### Tarea 11.2: Frontend - Descarga de PDFs
- [ ] 11.2.1: Implementar botón de descarga de prescripción
- [ ] 11.2.2: Implementar preview de prescripción

---

## 📦 FASE 12: Internacionalización (i18n)
**Rama:** `feature/i18n`  
**Duración estimada:** 1-2 días

### Tarea 12.1: Configurar i18n
- [ ] 12.1.1: Instalar react-i18next
- [ ] 12.1.2: Configurar i18n
- [ ] 12.1.3: Extraer strings del proyecto original
- [ ] 12.1.4: Crear archivo de traducción inglés
- [ ] 12.1.5: Crear archivo de traducción español
- [ ] 12.1.6: Crear archivo de traducción árabe

### Tarea 12.2: Implementar i18n
- [ ] 12.2.1: Reemplazar strings hardcodeados
- [ ] 12.2.2: Implementar selector de idioma
- [ ] 12.2.3: Implementar soporte RTL (árabe)

---

## 📦 FASE 13: Landing Page y Marketing
**Rama:** `feature/landing-page`  
**Duración estimada:** 2 días

### Tarea 13.1: Landing Page
- [ ] 13.1.1: Crear hero section
- [ ] 13.1.2: Crear sección de features
- [ ] 13.1.3: Crear sección de pricing con los 3 planes
- [ ] 13.1.4: Crear sección de testimonios
- [ ] 13.1.5: Crear sección de FAQ
- [ ] 13.1.6: Crear footer con links legales
- [ ] 13.1.7: Optimizar para SEO

### Tarea 13.2: Páginas Legales
- [ ] 13.2.1: Crear página de Términos de Servicio
- [ ] 13.2.2: Crear página de Política de Privacidad
- [ ] 13.2.3: Crear página de Política de Cookies

---

## 📦 FASE 14: Testing
**Rama:** `feature/testing`  
**Duración estimada:** 2-3 días

### Tarea 14.1: Tests de Backend
- [ ] 14.1.1: Configurar Vitest para backend
- [ ] 14.1.2: Crear tests de autenticación
- [ ] 14.1.3: Crear tests de registro de tenant
- [ ] 14.1.4: Crear tests de límites de plan
- [ ] 14.1.5: Crear tests de CRUD con tenant isolation
- [ ] 14.1.6: Crear tests de webhooks de Stripe

### Tarea 14.2: Tests de Frontend
- [ ] 14.2.1: Configurar Vitest + React Testing Library
- [ ] 14.2.2: Crear tests de componentes principales
- [ ] 14.2.3: Crear tests de hooks
- [ ] 14.2.4: Crear tests de flujos de usuario

---

## 📦 FASE 15: Documentación y Deploy
**Rama:** `feature/docs-deploy`  
**Duración estimada:** 2 días

### Tarea 15.1: Documentación
- [ ] 15.1.1: Documentar API con Swagger/OpenAPI
- [ ] 15.1.2: Crear documentación de instalación
- [ ] 15.1.3: Crear documentación de configuración
- [ ] 15.1.4: Crear guía de usuario

### Tarea 15.2: Preparar para Producción
- [ ] 15.2.1: Crear Dockerfile de producción para API
- [ ] 15.2.2: Crear Dockerfile de producción para Web
- [ ] 15.2.3: Crear docker-compose de producción
- [ ] 15.2.4: Configurar variables de entorno de producción
- [ ] 15.2.5: Configurar CI/CD con GitHub Actions
- [ ] 15.2.6: Configurar Stripe en modo producción
- [ ] 15.2.7: Configurar dominio y SSL
- [ ] 15.2.8: Configurar monitoreo (Sentry para errores)

---

## Estimación Total

| Fase      | Descripción                        | Duración Estimada |
| --------- | ---------------------------------- | ----------------- |
| Fase 0    | Configuración del Proyecto         | ✅ Completada      |
| Fase 1    | Core Multi-Tenant y Modelos        | ✅ Completada      |
| Fase 2    | Registro de Tenants y Auth         | 🔄 En progreso     |
| Fase 3    | Gestión de Doctores                | 2 días            |
| Fase 4    | Gestión de Pacientes               | 3 días            |
| Fase 5    | Gestión de Citas                   | 4 días            |
| Fase 6    | Labworks y Expenses                | 2 días            |
| Fase 7    | Estadísticas y Dashboard           | 2 días            |
| Fase 8    | **Suscripciones y Pagos (Stripe)** | 3-4 días          |
| Fase 9    | Settings del Tenant                | 1-2 días          |
| Fase 10   | Backups                            | 1-2 días          |
| Fase 11   | PDFs                               | 1 día             |
| Fase 12   | i18n                               | 1-2 días          |
| Fase 13   | **Landing Page y Marketing**       | 2 días            |
| Fase 14   | Testing                            | 2-3 días          |
| Fase 15   | Docs y Deploy                      | 2 días            |
| **TOTAL** |                                    | **~32-40 días**   |

---

## Arquitectura de Seguridad Multi-Tenant

### Principios de Aislamiento

1. **Row-Level Security**: Todas las queries incluyen `WHERE tenant_id = ?`
2. **Middleware de Tenant**: Extrae `tenantId` del JWT y lo inyecta en el contexto
3. **Prisma Extension**: Automáticamente filtra por tenant en todas las operaciones
4. **Validación de Límites**: Antes de crear recursos, se verifica el plan

### Ejemplo de Prisma Extension para Tenant Isolation

```typescript
const prismaWithTenant = (tenantId: string) => {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async create({ args, query }) {
          args.data = { ...args.data, tenantId };
          return query(args);
        },
        // ... otros métodos
      },
    },
  });
};
```

---

## 🧪 Estrategia de Testing por Fase

### Convenciones Generales

| Tipo de Test        | Ubicación                               | Naming                  | Herramienta                    |
| ------------------- | --------------------------------------- | ----------------------- | ------------------------------ |
| **Unitarios API**   | `apps/api/src/**/*.test.ts`             | `*.test.ts`             | Vitest                         |
| **Integración API** | `apps/api/src/**/*.integration.test.ts` | `*.integration.test.ts` | Vitest + Supertest             |
| **Unitarios Web**   | `apps/web/src/**/*.test.tsx`            | `*.test.tsx`            | Vitest + React Testing Library |
| **E2E**             | `apps/web/e2e/*.spec.ts`                | `*.spec.ts`             | Playwright                     |

### Comandos de Testing

```bash
# API
pnpm --filter @dental/api test              # Todos los tests
pnpm --filter @dental/api test:unit         # Solo unitarios
pnpm --filter @dental/api test:integration  # Solo integración

# Web
pnpm --filter @dental/web test              # Unitarios
pnpm --filter @dental/web test:e2e          # E2E con Playwright

# Monorepo completo
pnpm test                                   # Todos los tests de todos los packages
```

---

### FASE 0: Configuración del Proyecto ✅

#### Tests Unitarios
- [ ] Configuración de Vitest funciona en api y web
- [ ] Helper functions de respuesta API
- [ ] Validación de esquemas Zod base

#### Tests de Integración
- [ ] Health check endpoint `/api/health` retorna 200
- [ ] Conexión a PostgreSQL exitosa
- [ ] Conexión a Redis exitosa

#### Tests E2E
- [ ] App React carga sin errores
- [ ] Rutas base funcionan

---

### FASE 1: Core Multi-Tenant y Modelos Base ✅

#### Tests Unitarios
```
apps/api/src/
├── services/
│   ├── prisma.service.test.ts       # Singleton, tenant isolation
│   ├── redis.service.test.ts        # Conexión y operaciones básicas
│   └── plan-limits.service.test.ts  # Verificación de límites
├── middleware/
│   ├── tenant.middleware.test.ts    # Extracción de tenant del JWT
│   └── error-handler.test.ts        # Manejo de errores
└── utils/
    ├── api-response.test.ts         # Helpers de respuesta
    └── validators.test.ts           # Esquemas Zod
```

#### Tests de Integración
```
apps/api/src/routes/
├── patients.integration.test.ts
│   ├── GET /api/patients - Lista pacientes del tenant
│   ├── GET /api/patients - NO lista pacientes de otro tenant
│   ├── POST /api/patients - Crea con tenantId correcto
│   ├── PUT /api/patients/:id - Solo edita del mismo tenant
│   └── DELETE /api/patients/:id - Solo elimina del mismo tenant
├── doctors.integration.test.ts
│   └── (misma estructura que patients)
└── appointments.integration.test.ts
    └── (misma estructura que patients)
```

#### Tests E2E
- N/A (no hay UI para esta fase)

---

### FASE 2: Registro de Tenants y Autenticación

#### Tests Unitarios
```
apps/api/src/
├── services/
│   ├── auth.service.test.ts
│   │   ├── hashPassword() genera hash válido
│   │   ├── verifyPassword() valida correctamente
│   │   ├── generateAccessToken() genera JWT válido
│   │   ├── generateRefreshToken() genera token de refresco
│   │   └── verifyToken() valida y decodifica JWT
│   └── email.service.test.ts
│       ├── sendWelcomeEmail() llama a Resend con params correctos
│       └── Maneja errores de Resend gracefully
├── middleware/
│   ├── auth.middleware.test.ts
│   │   ├── Rechaza request sin token
│   │   ├── Rechaza token expirado
│   │   ├── Rechaza token inválido
│   │   └── Añade user al request con token válido
│   └── rbac.middleware.test.ts
│       ├── requireRole() valida roles correctamente
│       └── requirePermission() valida permisos
└── routes/
    └── auth.routes.test.ts
        └── Validación de schemas (email, password strength)
```

```
apps/web/src/
├── stores/
│   └── auth.store.test.ts
│       ├── login() guarda tokens y user
│       ├── logout() limpia estado
│       └── isAuthenticated computed correcto
├── hooks/
│   └── useAuth.test.ts
│       └── Retorna estado y métodos correctos
└── components/
    └── ProtectedRoute.test.tsx
        ├── Redirige a login si no autenticado
        └── Renderiza children si autenticado
```

#### Tests de Integración
```
apps/api/src/routes/
├── auth.integration.test.ts
│   ├── POST /api/auth/register
│   │   ├── Crea tenant, user y subscription
│   │   ├── Rechaza email duplicado
│   │   ├── Rechaza slug duplicado
│   │   └── Valida campos requeridos
│   ├── POST /api/auth/login
│   │   ├── Retorna tokens con credenciales válidas
│   │   ├── Rechaza password incorrecto
│   │   ├── Rechaza email no existente
│   │   └── Incluye user info sin passwordHash
│   ├── POST /api/auth/refresh-token
│   │   ├── Genera nuevo access token
│   │   ├── Rechaza refresh token inválido
│   │   └── Rechaza refresh token expirado
│   ├── GET /api/auth/me
│   │   ├── Retorna user autenticado
│   │   └── Rechaza sin autenticación
│   └── POST /api/auth/forgot-password
│       ├── Envía email si usuario existe
│       └── No revela si email no existe (seguridad)
└── admin.integration.test.ts
    ├── POST /api/admin/setup
    │   ├── Crea super admin con SETUP_KEY válido
    │   ├── Rechaza SETUP_KEY inválido
    │   └── Se auto-deshabilita después del primer uso
    ├── GET /api/admin/tenants
    │   ├── Solo accesible por SUPER_ADMIN
    │   └── Lista todos los tenants
    └── GET /api/admin/stats
        └── Retorna estadísticas de plataforma
```

#### Tests E2E
```
apps/web/e2e/
├── auth.spec.ts
│   ├── Usuario puede registrar nueva clínica
│   ├── Usuario puede hacer login
│   ├── Usuario puede hacer logout
│   ├── Muestra error con credenciales inválidas
│   ├── Redirige a login en rutas protegidas
│   └── Refresh token funciona automáticamente
└── admin.spec.ts
    ├── Super admin puede completar setup inicial
    ├── Super admin puede hacer login
    ├── Super admin ve dashboard con stats
    ├── Super admin puede listar tenants
    └── Super admin puede crear/editar/eliminar tenants
```

---

### FASE 3: Gestión de Doctores

#### Tests Unitarios
```
apps/api/src/
├── services/
│   └── doctor.service.test.ts
│       ├── create() valida límites de plan
│       ├── findAll() filtra por tenant
│       └── delete() es soft delete
└── middleware/
    └── plan-limits.middleware.test.ts
        └── Rechaza cuando se excede límite de doctores
```

```
apps/web/src/
├── stores/
│   └── doctors.store.test.ts
├── components/
│   ├── DoctorCard.test.tsx
│   ├── DoctorForm.test.tsx
│   └── DoctorPicker.test.tsx
└── pages/
    └── DoctorsPage.test.tsx
```

#### Tests de Integración
```
apps/api/src/routes/
└── doctors.integration.test.ts
    ├── GET /api/doctors - Lista solo doctores del tenant
    ├── POST /api/doctors - Respeta límite de plan
    ├── POST /api/doctors - Rechaza al exceder límite
    ├── PUT /api/doctors/:id - Solo edita del mismo tenant
    ├── DELETE /api/doctors/:id - Soft delete
    └── PUT /api/doctors/:id/restore - Restaura doctor
```

#### Tests E2E
```
apps/web/e2e/
└── doctors.spec.ts
    ├── Usuario puede ver lista de doctores
    ├── Usuario puede crear doctor
    ├── Usuario puede editar doctor
    ├── Usuario puede eliminar doctor
    ├── Muestra mensaje de upgrade al alcanzar límite
    └── Búsqueda y filtros funcionan
```

---

### FASE 4: Gestión de Pacientes

#### Tests Unitarios
```
apps/api/src/
├── services/
│   └── patient.service.test.ts
│       ├── create() valida límites de plan
│       ├── findAll() soporta paginación
│       └── updateTeethChart() guarda JSON válido
```

```
apps/web/src/
├── components/
│   ├── PatientCard.test.tsx
│   ├── PatientForm.test.tsx
│   ├── DentalChart.test.tsx
│   │   ├── Renderiza 32 dientes
│   │   ├── Selección de diente funciona
│   │   └── Guarda notas por diente
│   └── PatientPicker.test.tsx
└── pages/
    └── PatientDetailPage.test.tsx
```

#### Tests de Integración
```
apps/api/src/routes/
└── patients.integration.test.ts
    ├── GET /api/patients - Paginación funciona
    ├── GET /api/patients - Búsqueda por nombre
    ├── POST /api/patients - Respeta límite de plan
    ├── GET /api/patients/:id/appointments - Lista citas del paciente
    └── PUT /api/patients/:id/teeth-chart - Guarda chart dental
```

#### Tests E2E
```
apps/web/e2e/
└── patients.spec.ts
    ├── Usuario puede ver lista de pacientes
    ├── Usuario puede crear paciente
    ├── Usuario puede ver detalle de paciente
    ├── Usuario puede editar chart dental
    ├── Paginación funciona correctamente
    └── Muestra mensaje de upgrade al alcanzar límite
```

---

### FASE 5: Gestión de Citas

#### Tests Unitarios
```
apps/api/src/
├── services/
│   ├── appointment.service.test.ts
│   │   ├── create() asocia doctores correctamente
│   │   ├── markAsDone() actualiza estado
│   │   └── getCalendarData() formatea para FullCalendar
│   └── storage.service.test.ts
│       ├── uploadImage() guarda en S3
│       ├── deleteImage() elimina de S3
│       └── getUsage() calcula storage usado
```

```
apps/web/src/
├── components/
│   ├── Calendar.test.tsx
│   │   ├── Renderiza FullCalendar
│   │   ├── Vista mensual funciona
│   │   ├── Vista semanal funciona
│   │   └── Navegación entre fechas
│   ├── AppointmentForm.test.tsx
│   ├── AppointmentCard.test.tsx
│   └── ImageGallery.test.tsx
└── hooks/
    └── useCalendar.test.ts
```

#### Tests de Integración
```
apps/api/src/routes/
├── appointments.integration.test.ts
│   ├── GET /api/appointments/calendar - Formato correcto
│   ├── POST /api/appointments - Crea con múltiples doctores
│   ├── PUT /api/appointments/:id/mark-done - Actualiza estado
│   └── GET /api/appointments/by-doctor/:id - Filtra por doctor
└── appointment-images.integration.test.ts
    ├── POST /api/appointments/:id/images - Upload funciona
    ├── POST /api/appointments/:id/images - Rechaza al exceder storage
    ├── DELETE /api/appointments/:id/images/:imageId - Elimina imagen
    └── GET /api/storage/usage - Retorna uso correcto
```

#### Tests E2E
```
apps/web/e2e/
└── appointments.spec.ts
    ├── Usuario puede ver calendario
    ├── Usuario puede crear cita desde calendario
    ├── Usuario puede ver detalle de cita
    ├── Usuario puede subir imágenes
    ├── Usuario puede marcar cita como completada
    └── Filtro por doctor funciona
```

---

### FASE 6: Labworks y Expenses

#### Tests Unitarios
```
apps/api/src/services/
├── labwork.service.test.ts
│   └── getStats() calcula totales correctamente
└── expense.service.test.ts
    └── getByCategory() agrupa por categoría
```

#### Tests de Integración
```
apps/api/src/routes/
├── labworks.integration.test.ts
│   ├── CRUD básico funciona
│   └── Filtro por estado de pago
└── expenses.integration.test.ts
    ├── CRUD básico funciona
    └── Filtro por tags
```

#### Tests E2E
```
apps/web/e2e/
└── labworks-expenses.spec.ts
    ├── Usuario puede gestionar labworks
    └── Usuario puede gestionar gastos
```

---

### FASE 7: Estadísticas y Dashboard

#### Tests Unitarios
```
apps/api/src/services/
└── stats.service.test.ts
    ├── getOverview() calcula métricas
    ├── getRevenue() agrupa por período
    └── Respeta restricciones de plan
```

```
apps/web/src/components/
├── StatCard.test.tsx
├── RevenueChart.test.tsx
└── UpcomingAppointments.test.tsx
```

#### Tests de Integración
```
apps/api/src/routes/
└── stats.integration.test.ts
    ├── GET /api/stats/overview - Retorna métricas
    ├── GET /api/stats/revenue - Datos de ingresos
    └── Bloquea reportes avanzados en plan gratuito
```

#### Tests E2E
```
apps/web/e2e/
└── dashboard.spec.ts
    ├── Dashboard carga con datos
    ├── Gráficos se renderizan
    └── CTA de upgrade visible en plan gratuito
```

---

### FASE 8: Suscripciones y Pagos (Stripe)

#### Tests Unitarios
```
apps/api/src/services/
├── stripe.service.test.ts
│   ├── createCheckoutSession() genera URL válida
│   ├── createPortalSession() genera URL válida
│   └── constructEvent() valida webhook signature
└── plan-limits.service.test.ts
    ├── canAddDoctor() verifica límites
    ├── canAddPatient() verifica límites
    └── getCurrentUsage() retorna uso actual
```

#### Tests de Integración
```
apps/api/src/routes/
└── billing.integration.test.ts
    ├── POST /api/billing/create-checkout-session
    │   └── Genera sesión de Stripe (mock)
    ├── POST /api/billing/webhook
    │   ├── subscription.created actualiza DB
    │   ├── subscription.updated cambia plan
    │   ├── subscription.deleted cancela suscripción
    │   └── Rechaza signature inválida
    └── GET /api/billing/subscription
        └── Retorna suscripción actual
```

#### Tests E2E
```
apps/web/e2e/
└── billing.spec.ts
    ├── Usuario ve plan actual
    ├── Usuario puede iniciar upgrade (redirect a Stripe)
    ├── Usuario ve historial de facturas
    └── Banner de advertencia aparece al acercarse a límites
```

**Nota:** Para E2E de Stripe, usar Stripe CLI en modo test o mocks.

---

### FASE 9: Settings del Tenant

#### Tests Unitarios
```
apps/api/src/services/
└── settings.service.test.ts
    └── getDefaults() retorna valores por defecto
```

```
apps/web/src/pages/
└── SettingsPage.test.tsx
    └── Formularios de configuración
```

#### Tests de Integración
```
apps/api/src/routes/
└── settings.integration.test.ts
    ├── GET /api/settings - Retorna config del tenant
    ├── PUT /api/settings - Actualiza config
    └── PUT /api/tenant/profile - Actualiza perfil
```

#### Tests E2E
```
apps/web/e2e/
└── settings.spec.ts
    ├── Usuario puede cambiar moneda
    ├── Usuario puede cambiar idioma
    └── Usuario puede actualizar perfil de clínica
```

---

### FASE 10: Backups

#### Tests Unitarios
```
apps/api/src/services/
└── backup.service.test.ts
    ├── createBackup() genera archivo JSON
    ├── restoreBackup() importa datos
    └── Respeta restricciones de plan
```

#### Tests de Integración
```
apps/api/src/routes/
└── backups.integration.test.ts
    ├── POST /api/backups/create - Crea backup
    ├── GET /api/backups/:id/download - Descarga backup
    ├── POST /api/backups/:id/restore - Restaura
    └── Plan gratuito: solo manual
```

#### Tests E2E
```
apps/web/e2e/
└── backups.spec.ts
    ├── Usuario puede crear backup manual
    ├── Usuario puede descargar backup
    └── Plan Enterprise ve backups automáticos
```

---

### FASE 11: PDFs

#### Tests Unitarios
```
apps/api/src/services/
└── pdf.service.test.ts
    ├── generatePrescription() genera PDF válido
    └── Incluye branding del tenant
```

#### Tests de Integración
```
apps/api/src/routes/
└── prescriptions.integration.test.ts
    └── GET /api/prescriptions/:id/pdf - Retorna PDF
```

#### Tests E2E
```
apps/web/e2e/
└── prescriptions.spec.ts
    └── Usuario puede descargar prescripción PDF
```

---

### FASE 12: i18n

#### Tests Unitarios
```
apps/web/src/
├── i18n/
│   └── i18n.test.ts
│       ├── Carga traducciones correctamente
│       └── Fallback a inglés funciona
└── components/
    └── LanguageSelector.test.tsx
```

#### Tests E2E
```
apps/web/e2e/
└── i18n.spec.ts
    ├── Cambia idioma a español
    ├── Cambia idioma a árabe (RTL)
    └── Preferencia persiste en localStorage
```

---

### FASE 13: Landing Page

#### Tests Unitarios
```
apps/web/src/components/landing/
├── Hero.test.tsx
├── PricingTable.test.tsx
└── FAQ.test.tsx
```

#### Tests E2E
```
apps/web/e2e/
└── landing.spec.ts
    ├── Landing page carga correctamente
    ├── Pricing muestra 3 planes
    ├── CTA de registro funciona
    └── Links legales funcionan
```

---

### Matriz de Cobertura Objetivo

| Fase             | Unitarios | Integración | E2E | Cobertura Objetivo |
| ---------------- | --------- | ----------- | --- | ------------------ |
| 0 - Setup        | 5         | 3           | 2   | 80%                |
| 1 - Multi-Tenant | 15        | 12          | -   | 85%                |
| 2 - Auth         | 25        | 20          | 10  | 90%                |
| 3 - Doctores     | 10        | 6           | 6   | 85%                |
| 4 - Pacientes    | 15        | 8           | 8   | 85%                |
| 5 - Citas        | 20        | 12          | 10  | 85%                |
| 6 - Labworks     | 8         | 6           | 4   | 80%                |
| 7 - Dashboard    | 10        | 5           | 4   | 80%                |
| 8 - Stripe       | 15        | 10          | 5   | 85%                |
| 9 - Settings     | 5         | 4           | 4   | 80%                |
| 10 - Backups     | 8         | 5           | 3   | 80%                |
| 11 - PDFs        | 3         | 2           | 1   | 75%                |
| 12 - i18n        | 5         | -           | 3   | 80%                |
| 13 - Landing     | 5         | -           | 4   | 75%                |

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: dental_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U test -d dental_test"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    env:
      DATABASE_URL: postgresql://test:test@localhost:5432/dental_test?schema=public
      REDIS_URL: redis://localhost:6379
      NODE_ENV: test
      JWT_SECRET: test-jwt-secret-for-ci
      JWT_REFRESH_SECRET: test-jwt-refresh-secret-for-ci

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm db:generate
      - run: pnpm db:migrate:deploy
      - run: pnpm test
      - run: pnpm test:e2e

      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
```

---

## Notas Importantes

1. **Migración de Datos:** Si hay datos existentes en PocketBase, se necesitará crear un script de migración. Cada dataset importado creará un nuevo tenant.

2. **Funcionalidad Offline:** Para la versión web SaaS, el offline no es prioritario. Se puede considerar PWA con Service Workers en una fase futura.

3. **Multi-Tenancy:** Se usa "shared database, shared schema" con row-level isolation por `tenant_id`. Es más económico y escalable para SaaS.

4. **Stripe:** Se recomienda usar Stripe Checkout para pagos y Stripe Customer Portal para gestión de suscripciones. Minimiza el trabajo de desarrollo.

5. **Subdominios vs Paths:** 
   - Opción A: `clinica1.dental.app` (requiere wildcard SSL)
   - Opción B: `app.dental.app/clinica1` (más simple)
   - Recomendación: Empezar con Opción B, migrar a A si es necesario.

6. **Rate Limiting:** Implementar rate limiting por tenant para evitar abuso del plan gratuito.

7. **Audit Log:** Importante para compliance y debugging en entorno multi-tenant.

---

## Leyenda de Estado

- [ ] Pendiente
- [x] Completado
- 🔄 En progreso
- ⏸️ Pausado
- ❌ Cancelado

---

## Mejoras Futuras / Backlog

> Items identificados en PR reviews para implementar en futuros PRs

### De PR #14 (Super Admin Frontend)
1. **Endpoint separado para login admin** - El login actual usa /auth/login y verifica rol en cliente. Crear endpoint /admin/auth/login que valide SUPER_ADMIN en servidor
2. **Token refresh automático** - Implementar lógica de refresh en interceptor de axios cuando token expire
3. **Componente FilterBar reutilizable** - Extraer filtros duplicados de TenantsPage y UsersPage en componente genérico
4. **Componente Pagination reutilizable** - Extraer paginación duplicada en componente genérico
5. **Confirmación modal custom** - Reemplazar window.confirm con modal estilizado para acciones destructivas
6. **Mejorar seguridad de tokens** - Considerar encriptación de tokens en sessionStorage para panel admin
7. **Renombrar variable data a tenantsData/usersData** - Nombres más descriptivos en componentes

### De PR #13 (Super Admin Backend)
8. **Operaciones bulk más seguras** - Optimizar eliminación de tenants con muchos registros
9. **Mejorar manejo de errores en cascada** - Capturar errores específicos de cada operación
10. **Índices de base de datos** - Agregar índices en queries frecuentes

### 🧪 Testing (Alta Prioridad)
11. **Tests unitarios para admin routes** - Tests para /api/admin/setup, /api/admin/tenants, /api/admin/users, rate limiting
12. **Tests E2E para panel admin** - Cubrir flujos críticos con Playwright

### 📧 Notificaciones
13. **Email de bienvenida al crear tenant** - Notificar al owner cuando se crea su clínica, incluir credenciales o link de activación

### 📝 Auditoría
14. **Audit logging para acciones de superadmin** - Tabla AuditLog, registrar creación/modificación/eliminación de tenants y usuarios

### 📄 Paginación
15. **Paginación en endpoints de lista** - GET /api/admin/tenants y /api/admin/users con ?page=1&limit=20

### ✅ Validación Adicional
16. **Validación ISO 4217 para currency** - Validar códigos de moneda (USD, EUR, MXN, etc.)

### 🔒 Seguridad
17. **Rate limiting con Redis** - Actual: in-memory. Futuro: Redis para persistencia y escalabilidad
18. **Confirmación de email para super admin**
19. **2FA para super admin**
20. **Restringir CSP a HTTPS only** - Actual: `connect-src 'self' https: http:` permite HTTP para staging sin SSL. Cuando tengamos dominio con certificados SSL para todos los ambientes (incluyendo staging), revertir a `connect-src 'self' https:` en `apps/web/nginx.conf` (PR #36)

### 📊 Optimización
21. **Optimizar endpoint de stats** - Considerar vistas materializadas o caching
22. **Dashboard con métricas en tiempo real** - WebSocket para actualizaciones live
23. **Filtros avanzados** - Por fecha de creación, tipo de plan, etc.
24. **Soft delete para tenants** - En lugar de borrar, marcar como eliminados
25. **Exportar datos de tenant** - Funcionalidad de backup antes de eliminar

### 🎨 UI/UX
26. **Dark mode toggle en panel admin**

---

## 🚨 Coolify Deployment

> ✅ **RESUELTO** - El deployment a Coolify funciona correctamente.
> 
> **Problemas resueltos:**
> - PR #33: Agregar migraciones de Prisma (faltaba `prisma/migrations/`)
> - PR #34: Fix hostname de PostgreSQL (`dental-postgres` para evitar conflicto con `coolify-db`)
> - PR #35: Fix URL de health check en HomePage (usar `VITE_API_URL`)
> - PR #36: Fix CSP para permitir HTTP en staging
> 
> 📄 **Guía de Troubleshooting**: [docs/COOLIFY-TROUBLESHOOTING.md](docs/COOLIFY-TROUBLESHOOTING.md)

**Estado actual**: 🟢 FUNCIONANDO

---

*Última actualización: 4 de Enero, 2026*
