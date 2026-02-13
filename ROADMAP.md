# Roadmap - Alveo System

## High Priority

### Production Bugs
- [x] Fix broken images in production: replaced blob URLs with direct `<img src>` URLs using `?token=` query param auth

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

### Clinic & Billing
- [ ] Doctor commission: doctors earn a percentage per consultation/labwork
- [ ] Patient debt screen: dedicated view to see outstanding patient balances
- [ ] Configurable appointment duration (different lengths per appointment type)
- [ ] Patient payment tracking (entregas) — see plan below

#### Plan: Patient Payment Tracking (Entregas)

**Goal:** Allow admin/doctor to record patient payments toward outstanding debt, with automatic FIFO allocation to mark completed works as "Paid".

**How it works:**
1. A patient accumulates debt from completed treatments/labworks (each has a cost)
2. Admin or doctor registers a payment (entrega) for any amount, up to the total debt
3. The system cannot accept a payment greater than the outstanding balance
4. Each payment is stored in a **payment history** (historial de entregas)
5. Payments are allocated FIFO (oldest work first): once cumulative payments cover a work's cost, that work is automatically marked as **Paid**

**Example:**
- Patient has 3 works: Work A ($100), Work B ($100), Work C ($100) → total debt = $300
- Patient pays $50 → no work fully paid yet (cumulative: $50)
- Patient pays $60 → cumulative $110 ≥ $100 → Work A marked as "Paid"
- Patient pays $100 → cumulative $210 ≥ $200 → Work B marked as "Paid"
- Patient pays $90 → cumulative $300 ≥ $300 → Work C marked as "Paid", balance = $0

**Backend tasks:**
- [ ] Create `Payment` model in Prisma (id, patientId, tenantId, amount, date, notes, createdBy, createdAt)
- [ ] Add `paymentStatus` field to billable records (treatments/labworks): `UNPAID` | `PAID`
- [ ] Create payment service with FIFO allocation logic
- [ ] Validation: reject payments > outstanding balance
- [ ] API endpoints: `POST /:clinicSlug/patients/:id/payments` (create), `GET /:clinicSlug/patients/:id/payments` (list history)
- [ ] Add permissions: `PAYMENTS_CREATE`, `PAYMENTS_VIEW`
- [ ] Unit and integration tests for payment service and routes

**Frontend tasks:**
- [ ] Payment history tab/section in patient detail page
- [ ] "Register Payment" button + modal (amount input, optional notes, date)
- [ ] Show current balance (total debt - total payments) prominently
- [ ] Visual indicator on each work showing paid/unpaid status
- [ ] Validation: max amount = current balance, min amount > 0
- [ ] i18n keys for ES/EN/AR
- [ ] Frontend tests for payment components

### Labworks
- [ ] Add doctor name to labwork records
- [ ] Add labwork status tracking (e.g. sent, in progress, received)

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
