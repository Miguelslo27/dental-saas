# History

Completed work log. Tasks flow: `ROADMAP.md` → `IN_PROGRESS.md` → `HISTORY.md`.

Newest first. Each entry references the PR(s) that delivered the work.

---

## 2026-04

### Odontogram fixes: primary-teeth quadrants + per-patient toggle persistence — 2026-04-20
**PR:** [#171](https://github.com/Miguelslo27/dental-saas/pull/171)

#### Part 1: Primary-teeth quadrants (FDI)
Primary teeth were being stored and displayed with permanent-teeth quadrants (1–4) instead of the correct FDI notation (5–8). Root cause: the `react-odontogram` overlay instance with `maxTeeth={5}` reports FDI without differentiating permanent/primary.

- `remapPrimaryFdi` helper in `apps/app/src/pages/patients/odontogram-utils.ts` converts 1→5, 2→6, 3→7, 4→8 before persisting
- Dedicated `handlePrimaryOdontogramChange` handler and tooltip for primary chart
- CSS state-coloring rules scoped to `.odontogram-primary`
- Unit test for the helper

#### Part 2: Persistence of the "Show primary teeth" toggle
Toggle was stored in React local state and reset on every reload — useless for clinicians seeing the same patient multiple times.

- Prisma migration `20260420155523_add_show_primary_teeth_to_patient` adds `showPrimaryTeeth` column to `Patient`
- `createPatient()` defaults to `true` if patient age < 12, `false` otherwise
- Dedicated `PATCH /patients/:id/show-primary-teeth` endpoint (`updatePatientShowPrimaryTeeth()` service)
- Zod schema on the route
- 8 backend tests (enable/disable, 400, 404, 401, age-based defaults)
- `updateShowPrimaryTeeth()` in `patient-api` + 3 tests
- `PatientDetailPage` initializes from DB; optimistic toggle with `Loader2` spinner and inline error rollback
- i18n keys ES/EN/AR (`patients.showPrimaryTeethError`)

**Known follow-ups (not in PR):**
- Existing records saved with keys 11–45 are not auto-migrated. Decision deferred on whether to re-map historically or allow manual re-edit.
- Pre-existing patients default to `showPrimaryTeeth = false` (no age-based backfill). One click resolves it per patient.

---

### Doctor Detail Page — 2026-04-16
**PR:** [#170](https://github.com/Miguelslo27/dental-saas/pull/170)

- `DoctorDetailPage` with header, contact info, schedule, bio, and edit modal
- `DoctorAppointmentsSection` mirroring the `PatientAppointmentsSection` pattern (shows patient name, filters, actions)
- Route `/doctors/:id` registered in `App.tsx`
- "Ver detalle" link on `DoctorCard`
- Edit appointment modal integrated with conflict error handling

---

### Hotfix: Appointment conflict error handling — 2026-04-10
**PR:** [#169](https://github.com/Miguelslo27/dental-saas/pull/169)

Appointment conflict errors were swallowed and never surfaced to the user on create/edit.

- Backend verified: `excludeAppointmentId` works correctly on update (no self-conflict bug)
- Added backend tests: edit appointment without time change, edit to free time slot
- Error banner displayed inside the modal (above form, below header)
- `PatientDetailPage` uses `getAppointmentApiErrorMessage()` instead of raw axios message
- `AppointmentsPage` passes store error to modal and clears on open/close
- Error messages use i18n keys with `getUserLanguage()` fallback to `'es'` (workaround for `LanguageDetector` defaulting to browser language)
- i18n error keys added to ES/EN/AR (`appointments.errors.*`)

**Finding carried to ROADMAP:** `i18next-browser-languagedetector` detects the browser language instead of the app preference. Root fix tracked in `ROADMAP.md` under Medium Priority → Language & Regional Settings.

---

### E2E Testing suite (Playwright) — 2026-04-10
**PR:** [#168](https://github.com/Miguelslo27/dental-saas/pull/168)

46/46 end-to-end tests covering all major flows. Run with `cd apps/app && npx playwright test e2e/phase*.spec.ts`.

| Phase | File | Tests |
|-------|------|-------|
| 1. Auth & navigation | `phase1-auth-navigation.spec.ts` | 7/7 |
| 2. Patients (CRUD) | `phase2-patients.spec.ts` | 7/7 |
| 3. Doctors | `phase3-doctors.spec.ts` | 5/5 |
| 4. Appointments | `phase4-appointments.spec.ts` | 6/6 |
| 5. Labworks | `phase5-labworks.spec.ts` | 5/5 |
| 6. Expenses | `phase6-expenses.spec.ts` | 5/5 |
| 7–9. Dashboard, settings & cross-module | `phase7-9-dashboard-settings-crossmodule.spec.ts` | 10/10 |

**Findings:**
- Registration redirects directly to the dashboard (no `/register/success` step)
- i18n uses the browser language — headless Chromium defaults to English, so all selectors are bilingual (ES/EN)
- Login is occasionally flaky (~1/5 runs) due to API timing — resolved with retry

---

## 2026-03

### Epic: Link labwork to appointment with price-included option — 2026-03-09
**PRs:** [#166](https://github.com/Miguelslo27/dental-saas/pull/166), [#167](https://github.com/Miguelslo27/dental-saas/pull/167)

**Problem:** When a consultation and a labwork were created, both were added separately to the patient's debt even when the labwork price was already included in the consultation price — causing double-charging.

**Solution:** Allow linking a labwork to an existing appointment for the same patient. If `priceIncludedInAppointment` is set, the labwork price does not contribute to the debt.

**Data model (PR #166):**
- `Labwork.appointmentId` (nullable FK to `Appointment`)
- `Labwork.priceIncludedInAppointment` (boolean, default `false`)
- Relation `Appointment.labworks → Labwork[]`
- Reversible migration verified against existing data

**Backend (PR #166):**
- `getPatientBalance()` excludes labworks with `priceIncludedInAppointment === true` from `totalDebt`
- `recalculatePaidStatus()` excludes those labworks from the FIFO pool and auto-marks them `isPaid = true`
- `labwork.service.ts` validates that `appointmentId` belongs to the same patient/tenant and that `priceIncludedInAppointment` can only be `true` when `appointmentId` is present
- Zod schemas updated; unit + integration tests for balance, FIFO, and routes

**Frontend (PR #167):**
- Appointment selector in `LabworkFormModal`, appearing after patient selection
- "Precio incluido en la consulta" checkbox with informational note
- Pre-selection of linked appointment when editing
- "Incluido en consulta" badge on `LabworkCard`
- i18n: ES/EN/AR keys added

**Bugfix bundled in PR #167:** axios interceptor was redirecting to "session expired" instead of surfacing credential errors on login.

---

## 2026-02

### Production hardening: Gateway timeout fix — 2026-02-20
**PR:** [#152](https://github.com/Miguelslo27/dental-saas/pull/152)

Intermittent gateway timeouts after deploys. Root cause: Traefik was picking a random Docker network when routing to the API container.

- Added `traefik.docker.network` label to pin the correct network
- Deployed and verified: timeouts resolved in production
- Background docs: `docs/GATEWAY-TIMEOUT-FIX.md`

---

### Patient payment tracking (Entregas) — 2026-02-14 to 2026-02-18
**PRs:** [#137](https://github.com/Miguelslo27/dental-saas/pull/137) (model), [#138](https://github.com/Miguelslo27/dental-saas/pull/138) (API), [#140](https://github.com/Miguelslo27/dental-saas/pull/140) (frontend)

**Goal:** Let admin/doctor record patient payments toward outstanding debt, with automatic FIFO allocation to mark completed works as Paid.

**How it works:**
1. A patient accumulates debt from completed treatments/labworks (each with a cost)
2. Admin or doctor registers a payment (entrega) for any amount, up to the total debt
3. Payments cannot exceed the outstanding balance
4. Each payment is stored in a payment history (historial de entregas)
5. Payments are allocated FIFO (oldest work first): once cumulative payments cover a work's cost, that work is automatically marked as Paid

**Delivered:**
- `PatientPayment` model and payment permissions (PR #137)
- `payment.service.ts` with FIFO allocation (`getPatientBalance`, `recalculatePaidStatus`, `createPayment`, `deletePayment`, `listPayments`) and routes (PR #138)
- Frontend UI for registering and listing payments (PR #140)
- Auto-create payment when appointment marked as paid ([#155](https://github.com/Miguelslo27/dental-saas/pull/155))

**Remaining work** (tracked in `ROADMAP.md` → Backlog → Clinic & Billing): visual indicator on each work showing paid/unpaid status.

---
