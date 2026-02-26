# Roadmap - Alveo System

## High Priority

### Odontogram
- [ ] Invert quadrants 3 and 4 (lower arch) so numbering matches standard dental convention

### Patient Budgets (Presupuestos)
- [ ] Allow creating a budget per patient with planned treatments and costs
- [ ] Share budget with patient (PDF or link)
- [ ] When creating an appointment, allow selecting budgeted treatments to execute

### Labwork Improvements
- [ ] Save laboratory name when creating a labwork (autocomplete from previously used labs, or create new)
- [ ] Add labwork list/section to patient detail page

### Production Bugs
- [x] Fix broken images in production: replaced blob URLs with direct `<img src>` URLs using `?token=` query param auth
- [x] Fix hardcoded currency: unified all formatters into shared `formatCurrency()`, include tenant data in login/register responses, sync currency to auth store on settings update (PR #139)
- [x] Fix gateway timeout: add `traefik.docker.network=coolify` label to prevent Traefik from routing via wrong network (PR #152)
- [ ] Harden API startup: eager Prisma init, DB-verified health check, graceful shutdown, connection timeout — see [docs/GATEWAY-TIMEOUT-FIX.md](docs/GATEWAY-TIMEOUT-FIX.md)

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
- [ ] Dashboard: add "Entregas recibidas este mes" stat card showing sum of patient payments received in the current month (separate from monthly revenue which only counts fully-paid items)
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
- [x] Create `PatientPayment` model in Prisma (PR #137)
- [x] Add `isPaid` field to appointments and labworks for FIFO tracking (PR #137)
- [x] Create payment service with FIFO allocation logic (PR #138)
- [x] Validation: reject payments > outstanding balance (PR #138)
- [x] API endpoints: balance, list, create, delete (PR #138)
- [x] Add permissions: `PAYMENTS_VIEW`, `PAYMENTS_CREATE`, `PAYMENTS_DELETE` (PR #137)
- [x] Integration tests for payment routes — 17 tests (PR #138)

**Frontend tasks:**
- [x] Payment history tab/section in patient detail page (PR #140)
- [x] "Register Payment" button + modal (amount input, optional notes, date) (PR #140)
- [x] Show current balance (total debt - total payments) prominently (PR #140)
- [ ] Visual indicator on each work showing paid/unpaid status
- [x] Validation: max amount = current balance, min amount > 0 (PR #140)
- [x] i18n keys for ES/EN/AR (PR #140)
- [x] Frontend tests for payment components — 7 tests (PR #140)

### Labworks
- [ ] Add doctor name to labwork records
- [ ] Add labwork status tracking (e.g. sent, in progress, received)

### Features
- [ ] Clinic user profiles & PIN system — see plan below
- [ ] Onboarding flow for new tenants
- [ ] DoctorPicker component (searchable combobox)

#### Plan: Clinic User Profiles & PIN System

**Goal:** Allow OWNER/ADMIN to create user profiles for clinic staff, with 4-digit PIN authentication for quick switching on shared devices (kiosk mode).

**How it works:**
1. OWNER logs in with email/password (existing flow, unchanged)
2. OWNER/ADMIN creates profiles from a dedicated "Users" management page, assigning roles (STAFF, DOCTOR, CLINIC_ADMIN, ADMIN)
3. Each user sets a 4-digit PIN on first access (mandatory, cannot be empty)
4. After X minutes of inactivity (configurable, default 5 min), the app auto-locks and shows the profile selector screen
5. User selects their profile → enters PIN → backend verifies PIN and issues a **new JWT** with that user's role and permissions
6. The app now operates with the selected user's permissions
7. Profile creation is NOT available from the lock screen — only from the admin section

**Backend tasks:**
- [ ] Add `pinHash` field to User model (nullable — null means PIN not yet set)
- [ ] Add `autoLockMinutes` to TenantSettings (default: 5, 0 = disabled)
- [ ] `PUT /api/auth/pin` — set/update PIN for the current user (requires current PIN if already set)
- [ ] `POST /api/auth/verify-pin` — verify PIN for a given userId, returns new JWT (access + refresh tokens) for that user
- [ ] `GET /api/users/profiles` — list all active users for the profile selector (id, firstName, lastName, avatar, role, hasPinSet) — no auth required beyond tenant context
- [ ] User management endpoints: already exist (`POST /api/users`, `PUT /api/users/:id`, etc.) — verify completeness

**Frontend tasks:**
- [ ] **User management page** (`/users`) — OWNER/ADMIN only: list users, create, edit role, deactivate
- [ ] **Create/edit user form** — firstName, lastName, email, password, role selector
- [ ] **PIN setup screen** — shown when `hasPinSet = false` after selecting profile or on first login; 4-digit input + confirmation
- [ ] **Auto-lock idle timer** — detects mouse/keyboard/touch inactivity, locks app after configured timeout
- [ ] **Profile selector screen** — grid of user cards (avatar, name, role); shown on auto-lock
- [ ] **PIN entry screen** — 4-digit PIN input shown after selecting a profile; on success, switches JWT and redirects to dashboard
- [ ] **Auto-lock setting** — add timeout config to settings page (OWNER/ADMIN only)
- [ ] **Nav item** — add "Users" to sidebar navigation (visible to OWNER/ADMIN)
- [ ] i18n keys for ES/EN/AR
- [ ] FullCalendar integration (using custom view for now)
- [ ] Weekly calendar view
- [ ] Prescriptions component
- [ ] og-image.png (1200x630px) for apps/web/public/
- [ ] Subscriptions and payments (dLocal integration)

### Security & Performance
- [ ] Rate limiting with Redis (persistence and scalability)
- [ ] Rate limiting for password recovery (3 attempts per IP in 15 min)

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

| Feature | Free | Basic ($U 399/mes) | Enterprise ($U 699/mes) |
|---------|------|-------|------------|
| **Price** | $U 0/mes | $U 399/mes | $U 699/mes |
| **Administrators** | 1 | 2 | 5 |
| **Doctors** | 3 | 5 | 10 |
| **Patients** | 50 | 200 | 500 |
| **Storage** | 100MB | 1GB | 5GB |
| **Support** | Community | Email | Priority |
| **Backups** | Manual | Daily | Daily + Export |

### Future: Pricing & Plans
- [ ] 4th plan or add-on packages for clinics needing more patients, doctors, or storage beyond Enterprise limits
- [ ] Internationalization of prices by country (currency conversion, inflation adjustments per region)

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
