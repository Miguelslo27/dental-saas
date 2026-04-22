# In Progress

Active tasks for the current development cycle.

Workflow: `ROADMAP.md` → start a task → move here → finish → move to `HISTORY.md`.

---

## Epic: Patient Budgets (Presupuestos)

**Goal:** Allow creating a budget per patient with planned treatments and costs, share it with the patient (PDF or public link), and link budget items to appointments for tracking execution. Items may span multiple appointments and are only marked as executed on explicit doctor confirmation.

### Story 1: Data model ✅

- [x] Prisma models:
  - `Budget` (id, tenantId, patientId, createdById, status, notes, validUntil?, totalAmount, timestamps)
  - `BudgetItem` (id, budgetId, description, toothNumber?, quantity, unitPrice, totalPrice, plannedAppointmentType?, status, notes?, order, timestamps)
  - `BudgetItemAppointment` (join table: id, budgetItemId, appointmentId, role: `SCHEDULED` | `EXECUTED`, notes?, createdById, createdAt) — N:M between budget items and appointments so a single item can span multiple appointments
- [x] Enums:
  - `BudgetStatus`: `DRAFT`, `APPROVED`, `PARTIAL`, `COMPLETED`, `CANCELLED`
  - `BudgetItemStatus`: `PENDING`, `SCHEDULED`, `IN_PROGRESS`, `EXECUTED`, `CANCELLED`
  - `BudgetItemAppointmentRole`: `SCHEDULED`, `EXECUTED` (added during implementation to type the join-table role)
- [x] Relations: `Budget.patient`, `Budget.items`, `BudgetItem.appointments` (through `BudgetItemAppointment`), inverse on `Appointment`
- [x] Migration `20260421154211_add_budget_models` with cascades

### Story 2: Backend CRUD + RBAC ✅

- [x] New RBAC permissions: `BUDGETS_VIEW`, `BUDGETS_CREATE`, `BUDGETS_UPDATE`, `BUDGETS_DELETE`, `BUDGETS_SHARE` (named `VIEW` instead of `READ` during implementation, in line with the rest of the codebase)
- [x] Role mapping:
  - `STAFF`: `BUDGETS_VIEW`
  - `DOCTOR`: `BUDGETS_VIEW`, `BUDGETS_CREATE`, `BUDGETS_UPDATE`
  - `CLINIC_ADMIN` / `ADMIN` / `OWNER`: full access (`DELETE` and `SHARE` limited to CLINIC_ADMIN+)
- [x] Service + routes:
  - `POST /api/patients/:id/budgets` — create budget with initial items (nested under patient)
  - `GET /api/patients/:id/budgets` — list budgets for a patient
  - `GET /api/budgets/:id` — full detail with items and appointment links
  - `PATCH /api/budgets/:id` — update metadata (notes, status, validUntil)
  - `DELETE /api/budgets/:id` — soft delete
  - `POST /api/budgets/:id/items` — add item
  - `PATCH /api/budgets/:id/items/:itemId` — edit item
  - `DELETE /api/budgets/:id/items/:itemId` — remove item
- [x] Business logic:
  - Auto-recalc `Budget.totalAmount` on item add/edit/delete
  - Auto-transition `Budget.status` between `APPROVED` / `PARTIAL` / `COMPLETED` based on item states; `DRAFT` and `CANCELLED` are sticky
  - All mutations run in a single transaction with recalculation
  - `patientId` cross-tenant isolation validated
- [x] Inline Zod schemas shared between top-level and nested endpoints
- [x] 35 integration tests (routes) covering validation, auth, cross-tenant isolation, totals recalculation, status transitions and error branches (the service is exercised through these; no separate unit tests were added)

### Story 3: PDF + public share link

- [ ] `BudgetPdf` template with `@react-pdf/renderer`, multi-language (ES/EN/AR, PT once the PT-BR track lands)
- [ ] `GET /api/budgets/:id/pdf` — authenticated download
- [ ] `publicToken` on `Budget` (nullable, generated on demand), optional `publicTokenExpiresAt`
- [ ] `POST /api/budgets/:id/share` — generate / rotate public token
- [ ] `GET /api/public/budgets/:token` — read-only public endpoint (no auth), rate-limited
- [ ] Public page in `apps/web` at `/budget/:token` — read-only view with clinic branding
- [ ] Tests for PDF generation and public access flow

### Story 4: Frontend — budget management

- [ ] `BudgetsSection` in patient detail page (list + create button)
- [ ] `BudgetFormModal` with editable item list (description, tooth number, quantity, unit price, auto-calculated total)
- [ ] Per-budget actions: view detail, download PDF, copy public link, edit, delete
- [ ] Status badge and progress indicator (X of Y items executed)
- [ ] i18n keys for ES/EN/AR (PT to be added by parallel track)
- [ ] Component tests

### Story 5: Appointment integration (with doctor confirmation)

- [ ] On appointment create/edit: if the patient has budgets with items in `PENDING` or `SCHEDULED`, show a multi-select to **associate** items to this appointment. Associated items transition to `SCHEDULED` (not executed yet).
- [ ] On marking an appointment as completed, the completion form shows **each associated budget item** with an explicit "Executed in this appointment?" control (default off). Only items the doctor explicitly marks transition to `EXECUTED`.
- [ ] Items not marked stay in `SCHEDULED` (available for future appointments). Unassociating an item returns it to `PENDING`.
- [ ] Each transition creates a `BudgetItemAppointment` row with role `SCHEDULED` or `EXECUTED`.
- [ ] `Budget.status` recalculates on each transition.
- [ ] Backend enforces the same rules (no auto-execution on appointment completion).
- [ ] i18n keys for ES/EN/AR (PT via parallel track).
- [ ] E2E test: full flow — create budget → create appointment linked to items → complete appointment marking some items executed → verify budget status becomes `PARTIAL`.

### Delivery plan

| PR | Stories | Risk | Status |
|----|---------|------|--------|
| **A** | 1 + 2 (model + backend + RBAC + tests) | Low — pure API | 🟡 Ready on `feat/patient-budgets-backend`, pending push + PR |
| **B** | 4 (frontend management, PDF-less) | Medium — UI | ⚪ Pending |
| **C** | 3 (PDF + public share link) | Medium — web public surface | ⚪ Pending |
| **D** | 5 (appointment integration) | High — touches clinical flow | ⚪ Pending |

---

## Parallel track: PT-BR Language Support

Being executed on a separate branch by another agent. See ROADMAP.md → Medium Priority → "Portuguese (PT-BR) Language Support" for the full checklist. All i18n keys introduced by the Budgets epic should be added to `pt.json` by whichever track merges last.

---

## i18n Hardcoded Strings Migration

Migrate hardcoded Spanish strings to i18n keys, split by module:

- [ ] Appointments module (error messages done, form labels pending)
- [ ] Patients module
- [ ] Doctors module
- [ ] Labworks module
- [ ] Expenses module
- [ ] Dashboard module
- [ ] Settings module
- [ ] Auth module
- [ ] Admin module
- [ ] Layout/Nav module
