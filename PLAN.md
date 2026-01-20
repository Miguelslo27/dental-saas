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
| 2 | Registro de Tenants y Auth | ✅ | #9-14, #44-48, #72 |
| 3 | Gestión de Doctores | ✅ | #55 |
| 4 | Gestión de Pacientes + Dental Chart | ✅ | #56, #63, #64 |
| 5 | Gestión de Citas | ✅ (CRUD) | #59 |
| 6 | Labworks y Expenses | ✅ | #60 |
| 7 | Estadísticas y Dashboard | ✅ | #61, #62 |
| 8 | Suscripciones y Pagos (dLocal) | ⏸️ DIFERIDO | #65 |
| 9 | Configuración del Tenant | ✅ | #66, #67 |
| 10 | Export Data | ✅ | #68 |
| 11 | Generación de PDFs | ✅ | #69, #70 |
| 12 | Internacionalización (i18n) | ✅ | #71 |
| 13 | Landing Page completa | ⏳ | - |
| 14 | Testing E2E | ⏳ | - |
| 15 | Documentación y Deploy | ⏳ | - |

**Tests:** 338 pasando | **Última actualización:** 20 de Enero, 2026

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

## 📦 FASE 8: Suscripciones y Pagos (dLocal) ⏸️ DIFERIDO

> **⚠️ DECISIÓN DE NEGOCIO (13 Enero 2026):**  
> Las suscripciones serán **gratuitas por tiempo ilimitado** hasta que el proyecto alcance una versión estable.
> Todos los tenants tendrán acceso al plan "enterprise" sin restricciones de límites.
> La integración con dLocal se retomará cuando el producto esté listo para monetización.

### ✅ Tarea 8.1: Backend - Servicio de Planes y Límites (PR #65)
- Infraestructura de billing creada (esquema, servicios, rutas)
- PlanService y PlanLimitsService funcionando
- Middleware checkPlanLimit disponible pero NO aplicado
- DLocalService skeleton listo para cuando se necesite

### ⏸️ Tarea 8.2: Backend - Integración dLocal (DIFERIDO)
Retomar cuando:
- El producto esté en versión estable (v1.0)
- Se tengan las credenciales de dLocal
- Se defina estrategia de pricing

### ⏸️ Tarea 8.3: Frontend - Billing UI (DIFERIDO)
Retomar junto con Tarea 8.2

---

## 📦 FASE 9: Configuración del Tenant (Settings) ✅
**Duración estimada:** 1-2 días

### ✅ Tarea 9.1: Backend - Settings del Tenant (PR #66)
- TenantSettings model added to Prisma schema
- TenantSettingsService with CRUD and defaults
- GET/PUT /api/settings (OWNER/ADMIN for PUT)
- GET/PUT /api/tenant/profile (OWNER only for PUT)
- Auto-creation of default settings on tenant registration
- 33 new tests (10 service + 23 routes)

### ✅ Tarea 9.2: Frontend - Página de Settings (PR #67)
- settings-api.ts with GET/PUT for /api/settings and /api/tenant/profile
- settings.store.ts with Zustand for state management
- SettingsPage with 3 tabs: Clinic Profile, Preferences, Business Hours
- ClinicProfileForm for tenant profile (OWNER only)
- PreferencesForm for localization and notifications (OWNER/ADMIN)
- BusinessHoursForm for working days and hours (OWNER/ADMIN)
- Route /settings registered in App.tsx
- 12 unit tests for SettingsPage

---

## 📦 FASE 10: Export Data ✅
**Rama:** `feat/export-data`  
**Duración estimada:** 1 día

> **Decisión:** Implementar "Export My Data" en lugar de backups server-side para evitar consumo de recursos mientras el servicio es gratuito.

### ✅ Tarea 10.1: Backend - Export Endpoint (PR #68)
- ExportService to collect all tenant data
- GET /api/export (OWNER/ADMIN) returns JSON with Content-Disposition
- 8 unit tests

### ✅ Tarea 10.2: Frontend - Export Button (PR #68)
- export-api.ts with download function
- DataExportForm component in Settings
- New "Datos" tab (4th tab)
- 3 new tests

---

## 📦 FASE 11: Generación de PDFs ✅
**Rama:** `feat/pdf-service`  
**Duración estimada:** 1-2 días

> **Librería elegida:** `@react-pdf/renderer` - Permite crear PDFs con componentes React.
> Compatible con el stack actual (ya usamos React para emails con @react-email/components).

### ✅ Tarea 11.1: Backend - PDF Service y Endpoints (PR #69)
- @react-pdf/renderer installed
- PdfService with generatePdf(template, data): Buffer
- AppointmentReceiptPdf template (clinic header, patient info, appointment details, cost, doctor signature)
- PatientHistoryPdf template (patient data, dental chart summary, appointment history table)
- GET /api/appointments/:id/pdf endpoint (STAFF+)
- GET /api/patients/:id/history-pdf endpoint (STAFF+)
- 20 unit tests for PdfService
- 11 integration tests for PDF endpoints

### ✅ Tarea 11.2: Frontend - Botones de Descarga (PR #70)
- pdf-api.ts with downloadAppointmentPdf and downloadPatientHistoryPdf
- "Descargar PDF" button in AppointmentCard menu
- "Exportar PDF" button in PatientDetailPage header
- Loading states while PDFs are generated
- 7 unit tests for pdf-api functions

---

## 📦 FASE 12: Internacionalización (i18n) ✅
**Rama:** `feature/i18n`
**Duración estimada:** 1-2 días

### ✅ Tarea 12.1: Configurar i18n (PR #71)
- react-i18next + i18next + i18next-browser-languagedetector installed
- i18n configuration with language detection and localStorage persistence
- Translation files for ES (Spanish), EN (English), AR (Arabic)
- 150+ translation keys per language

### ✅ Tarea 12.2: Implementar i18n (PR #71)
- LanguageSelector component (dropdown + buttons variants)
- RTL support for Arabic (dir attribute, CSS adjustments)
- PreferencesForm integrated with i18n language switching
- AppointmentsPage translated as example
- 8 unit tests for i18n configuration

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

*Última actualización: 20 de Enero, 2026*
