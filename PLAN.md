# 🦷 Plan de Migración: Dental Flutter → React/Node.js/PostgreSQL (SaaS)

## Descripción del Proyecto

**Nombre:** Dental Clinic Management System (SaaS)  
**Versión Original:** Flutter + Dart + PocketBase  
**Versión Destino:** React + Node.js + PostgreSQL (Multi-tenant SaaS)  
**Fecha de Inicio:** 29 de Diciembre, 2025  
**Autor:** Mike  

---

## 🏗️ Arquitectura de Aplicaciones

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

---

## 📊 Progreso General

| Fase | Descripción | Estado | PRs |
|------|-------------|--------|-----|
| 0 | Configuración del Proyecto | ✅ | #1-3 |
| 1 | Core Multi-Tenant y Modelos | ✅ | #4-8 |
| 2 | Registro de Tenants y Auth | ✅ | #9-14, #44-48 |
| 3 | Gestión de Doctores | ✅ | #55 |
| 4 | Gestión de Pacientes + Dental Chart | ✅ | #56, #63, #64 |
| 5 | Gestión de Citas | ✅ (CRUD) | #59 |
| 6 | Labworks y Expenses | ✅ | #60 |
| 7 | Estadísticas y Dashboard | ✅ | #61, #62 |
| 8 | Suscripciones y Pagos (Stripe) | ⏳ | - |
| 9 | Configuración del Tenant | ⏳ | - |
| 10 | Backups | ⏳ | - |
| 11 | Generación de PDFs | ⏳ | - |
| 12 | Internacionalización (i18n) | ⏳ | - |
| 13 | Landing Page completa | ⏳ | - |
| 14 | Testing E2E | ⏳ | - |
| 15 | Documentación y Deploy | ⏳ | - |

**Tests:** 216 pasando | **Última actualización:** 13 de Enero, 2026

---

## ⏳ PENDIENTES GLOBALES

### Rate Limiting (Fase 2)
- [ ] 2.2.11: Implementar rate limiting con Redis
- [ ] 2.2.A.6: Rate limiting para password recovery (3 intentos por IP en 15 min)

### Imágenes de Citas (Fase 5)
- [ ] 5.2.1: Configurar Multer para uploads
- [ ] 5.2.2: Crear servicio de almacenamiento (S3)
- [ ] 5.2.3: Crear servicio de tracking de storage por tenant
- [ ] 5.2.4: Crear middleware de verificación de límite de storage
- [ ] 5.2.5-5.2.8: Endpoints de imágenes

### Diferidos
- [ ] 2.4.5: Flujo de onboarding inicial
- [ ] 2.5.9: Página de perfil de usuario
- [ ] 3.2.8: DoctorPicker (Combobox con búsqueda)
- [ ] 5.3.1: FullCalendar (usando vista custom por ahora)
- [ ] 5.3.4: Vista semanal de calendario
- [ ] 5.4.8: Componente de prescripciones

---

## 📦 FASE 8: Suscripciones y Pagos (dLocal) ⏳
**Rama:** `feat/billing-dlocal`  
**Duración estimada:** 3-4 días

### Tarea 8.1: Backend - Servicio de Planes y Límites (EN PROGRESO)
- [ ] 8.1.1: Actualizar schema Prisma (quitar campos Stripe, agregar dLocal)
- [ ] 8.1.2: Crear seed de planes (free, basic, enterprise)
- [ ] 8.1.3: Crear PlanService (CRUD de planes, obtener por nombre)
- [ ] 8.1.4: Crear PlanLimitsService (verificar límites por recurso)
- [ ] 8.1.5: Crear middleware checkPlanLimit para rutas protegidas
- [ ] 8.1.6: Integrar middleware en rutas de doctors, patients
- [ ] 8.1.7: Crear endpoints GET /api/plans, GET /api/billing/subscription
- [ ] 8.1.8: Tests unitarios de PlanService y PlanLimitsService

### Tarea 8.2: Backend - Integración dLocal
- [ ] 8.2.1: Crear DLocalService (cliente HTTP, firma de requests)
- [ ] 8.2.2: Crear endpoint POST /api/billing/create-payment (genera link de pago)
- [ ] 8.2.3: Crear endpoint POST /api/billing/webhook (IPN handler)
- [ ] 8.2.4: Implementar lógica de upgrade/downgrade de plan
- [ ] 8.2.5: Crear cron job para cobros recurrentes mensuales
- [ ] 8.2.6: Crear cron job para verificar suscripciones vencidas
- [ ] 8.2.7: Tests de integración con mocks de dLocal

### Tarea 8.3: Frontend - Billing UI
- [ ] 8.3.1: Crear página /settings/billing
- [ ] 8.3.2: Mostrar plan actual y uso (doctores, pacientes, storage)
- [ ] 8.3.3: Crear componente PlanComparisonCard
- [ ] 8.3.4: Crear flujo de upgrade (selección -> pago -> confirmación)
- [ ] 8.3.5: Mostrar historial de pagos
- [ ] 8.3.6: Crear banner de límite alcanzado
- [ ] 8.3.7: Crear banner de suscripción por vencer

---

## 📦 FASE 9: Configuración del Tenant (Settings) ⏳
**Rama:** `feature/settings`  
**Duración estimada:** 1-2 días

### Tarea 9.1: Backend - Settings del Tenant
- [ ] 9.1.1: Crear endpoints CRUD /api/settings
- [ ] 9.1.2: Implementar settings por defecto al crear tenant
- [ ] 9.1.3: Crear endpoint PUT /api/tenant/profile

### Tarea 9.2: Frontend - Página de Settings
- [ ] 9.2.1-9.2.8: Página de configuración con moneda, idioma, formato fecha, usuarios

---

## 📦 FASE 10: Backups ⏳
**Rama:** `feature/backups`  
**Duración estimada:** 1-2 días

### Tarea 10.1: Backend - Backups
- [ ] 10.1.1-10.1.8: Servicio de backup, endpoints CRUD, cron jobs

### Tarea 10.2: Frontend - Gestión de Backups
- [ ] 10.2.1-10.2.5: UI de backups en settings

---

## 📦 FASE 11: Generación de PDFs ⏳
**Rama:** `feature/pdf-generation`  
**Duración estimada:** 1 día

### Tarea 11.1: Backend
- [ ] 11.1.1-11.1.4: Servicio de PDF, endpoint, template de prescripción

### Tarea 11.2: Frontend
- [ ] 11.2.1-11.2.2: Botón y preview de descarga

---

## 📦 FASE 12: Internacionalización (i18n) ⏳
**Rama:** `feature/i18n`  
**Duración estimada:** 1-2 días

### Tarea 12.1: Configurar i18n
- [ ] 12.1.1-12.1.6: react-i18next, traducciones EN/ES/AR

### Tarea 12.2: Implementar i18n
- [ ] 12.2.1-12.2.3: Reemplazar strings, selector idioma, RTL

---

## 📦 FASE 13: Landing Page y Marketing ⏳
**Rama:** `feature/landing-page`  
**Duración estimada:** 2 días

### Tarea 13.1: Landing Page
- [ ] 13.1.1-13.1.7: Hero, features, pricing, testimonios, FAQ, footer, SEO

### Tarea 13.2: Páginas Legales
- [ ] 13.2.1-13.2.3: Términos, Privacidad, Cookies

---

## 📦 FASE 14: Testing ⏳
**Rama:** `feature/testing`  
**Duración estimada:** 2-3 días

### Tarea 14.1: Tests de Backend
- [ ] 14.1.1-14.1.6: Vitest, tests de auth, tenant, plan limits, CRUD, Stripe webhooks

### Tarea 14.2: Tests de Frontend
- [ ] 14.2.1-14.2.4: Vitest + RTL, componentes, hooks, flujos

---

## 📦 FASE 15: Documentación y Deploy ⏳
**Rama:** `feature/docs-deploy`  
**Duración estimada:** 2 días

### Tarea 15.1: Documentación
- [ ] 15.1.1-15.1.4: Swagger/OpenAPI, guías de instalación y configuración

### Tarea 15.2: Preparar para Producción
- [ ] 15.2.1-15.2.8: Dockerfiles prod, docker-compose, CI/CD, Stripe prod, SSL, Sentry

---

## 🚀 Modelo de Negocio SaaS

### Planes de Suscripción

| Característica | 🆓 Gratis | 💼 Básico | 🏢 Empresa |
|----------------|-----------|-----------|------------|
| **Precio** | $0/mes | $5.99/mes | $11.99/mes |
| **Administradores** | 1 | 2 | 5 |
| **Doctores** | 3 | 5 | 10 |
| **Pacientes** | 15 | 25 | 60 |
| **Almacenamiento** | 100MB | 1GB | 5GB |
| **Soporte** | Comunidad | Email | Prioritario |
| **Backups** | Manual | Diarios | Diarios + Exportación |

---

## 📋 MEJORA FUTURA: Tabla Separada para Dental Chart (v2)

**Cuándo migrar:** Cuando se necesite historial de tratamientos, condiciones estructuradas o reportes agregados.

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

## 🔒 Notas de Seguridad

### Super Admin
- Sin seed file (credenciales nunca en repo)
- SETUP_KEY requerido, auto-disable después de primer uso
- Rutas separadas: `/admin/*` vs `/:clinicSlug/*`

### Multi-Tenant
- Row-Level Security con `WHERE tenant_id = ?`
- Middleware extrae tenantId del JWT
- Prisma Extension para filtrado automático

---

## Mejoras Futuras / Backlog

### Alta Prioridad
- [ ] Rate limiting con Redis (persistencia y escalabilidad)
- [ ] Tests E2E para panel admin
- [ ] Email de bienvenida al crear tenant

### Media Prioridad
- [ ] Audit logging para acciones de superadmin
- [ ] Paginación en endpoints admin
- [ ] 2FA para super admin
- [ ] Dark mode toggle

### Baja Prioridad
- [ ] Dashboard con métricas en tiempo real (WebSocket)
- [ ] Soft delete para tenants
- [ ] Exportar datos de tenant antes de eliminar

---

## 🚨 Coolify Deployment

> ✅ **FUNCIONANDO** - PRs #33-36, #38-40, #43
> 
> 📄 **Guía**: [docs/COOLIFY-DEPLOYMENT.md](docs/COOLIFY-DEPLOYMENT.md)  
> 📄 **Troubleshooting**: [docs/COOLIFY-TROUBLESHOOTING.md](docs/COOLIFY-TROUBLESHOOTING.md)

---

## Leyenda

- [ ] Pendiente
- [x] Completado
- ✅ Fase completada
- ⏳ Pendiente
- 🔄 En progreso

---

*Última actualización: 13 de Enero, 2026*
