# Roadmap - Alveo System

## High Priority

### Security & Performance
- [ ] Rate limiting with Redis (persistence and scalability)
- [ ] Rate limiting for password recovery (3 attempts per IP in 15 min)

## Medium Priority

### Language & Regional Settings
- [ ] Language selector in web landing page and registration form
- [ ] Save language preference on registration
- [ ] Allow language change in settings (post-registration)
- [ ] Detect and use browser's default language
- [ ] Default timezone based on user's location
- [ ] Country dropdown for phone number area code

### UX Improvements
- [x] Smart login form: hide clinic ID field when slug is in URL
- [x] Auto-generate clinic slug from clinic name in registration form
- [ ] Superadmin tables: allow clicking on clinic/user name to view details (not just ••• menu)
- [ ] Improve date/time picker UI (investigate user-friendly packages, replace browser defaults)
- [ ] Phone placeholder based on user's location

## Backlog

### Features
- [ ] Onboarding flow for new tenants
- [ ] User profile page
- [ ] DoctorPicker component (searchable combobox)
- [ ] FullCalendar integration (using custom view for now)
- [ ] Weekly calendar view
- [ ] Prescriptions component
- [ ] og-image.png (1200x630px) for apps/web/public/
- [ ] Subscriptions and payments (dLocal integration)

### Technical
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
