# In Progress

Active tasks for the current development cycle.

Workflow: `ROADMAP.md` → start a task → move here → finish → move to `HISTORY.md`.

---

## Epic: Patient Budgets (Presupuestos)

**Goal:** Allow creating a budget per patient with planned treatments and costs, share it with the patient (PDF or public link), and link budget items to appointments for tracking execution. Items may span multiple appointments and are only marked as executed on explicit doctor confirmation.

### Story 1: Data model

- [ ] Prisma models:
  - `Budget` (id, tenantId, patientId, createdById, status, notes, validUntil?, totalAmount, timestamps)
  - `BudgetItem` (id, budgetId, description, toothNumber?, quantity, unitPrice, totalPrice, plannedAppointmentType?, status, notes?, order, timestamps)
  - `BudgetItemAppointment` (join table: id, budgetItemId, appointmentId, role: `SCHEDULED` | `EXECUTED`, notes?, createdById, createdAt) — N:M between budget items and appointments so a single item can span multiple appointments
- [ ] Enums:
  - `BudgetStatus`: `DRAFT`, `APPROVED`, `PARTIAL`, `COMPLETED`, `CANCELLED`
  - `BudgetItemStatus`: `PENDING`, `SCHEDULED`, `IN_PROGRESS`, `EXECUTED`, `CANCELLED`
- [ ] Relations: `Budget.patient`, `Budget.items`, `BudgetItem.appointments` (through `BudgetItemAppointment`), inverse on `Appointment`
- [ ] Reversible migration verified against existing data

### Story 2: Backend CRUD + RBAC

- [ ] New RBAC permissions: `BUDGETS_CREATE`, `BUDGETS_READ`, `BUDGETS_UPDATE`, `BUDGETS_DELETE`, `BUDGETS_SHARE`
- [ ] Role mapping:
  - `STAFF`: `BUDGETS_READ`
  - `DOCTOR`: `BUDGETS_READ`, `BUDGETS_CREATE`, `BUDGETS_UPDATE`
  - `CLINIC_ADMIN` / `ADMIN` / `OWNER`: all budget permissions
- [ ] Service + routes:
  - `POST /api/budgets` — create budget with initial items
  - `GET /api/budgets/:id` — full detail with items and appointment links
  - `GET /api/patients/:patientId/budgets` — list budgets for a patient
  - `PATCH /api/budgets/:id` — update metadata (notes, status, validUntil)
  - `DELETE /api/budgets/:id` — soft delete
  - `POST /api/budgets/:id/items` — add item
  - `PATCH /api/budgets/:id/items/:itemId` — edit item
  - `DELETE /api/budgets/:id/items/:itemId` — remove item
- [ ] Business logic:
  - Auto-recalc `Budget.totalAmount` on item add/edit/delete
  - Auto-transition `Budget.status`: any item `EXECUTED` and some `PENDING/SCHEDULED` → `PARTIAL`; all items `EXECUTED` → `COMPLETED`
  - Validate `patientId` belongs to the same tenant
- [ ] Zod schemas for create/update
- [ ] Unit tests (service) + integration tests (routes)

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

| PR | Stories | Risk |
|----|---------|------|
| **A** | 1 + 2 (model + backend + RBAC + tests) | Low — pure API |
| **B** | 4 (frontend management, PDF-less) | Medium — UI |
| **C** | 3 (PDF + public share link) | Medium — web public surface |
| **D** | 5 (appointment integration) | High — touches clinical flow |

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
