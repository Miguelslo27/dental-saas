# In Progress

Active tasks for the current development cycle.

Workflow: `ROADMAP.md` → start a task → move here → finish → move to `HISTORY.md`.

---

## Hotfix: Appointment "Paid" checkbox + FIFO breakdown — 2026-04-27

**Branch:** `fix/appointment-update-payment-fifo`
**PR:** [#179](https://github.com/Miguelslo27/dental-saas/pull/179) (open, awaiting review/merge)

**Original report:** A patient had her treatment, the appointment was created with a cost and the "Paid" checkbox was ticked, but on save the appointment kept showing as pending. While investigating, several adjacent FIFO bugs surfaced and got fixed in the same branch.

### Delivered

- [x] **Marking as paid on update now actually pays.** `updateAppointment` used to discard `isPaid` because the column is derived. It now triggers the same FIFO auto-payment flow as create. Reverting paid → unpaid is rejected with `CANNOT_UNMARK_PAID`; the UI disables the checkbox in that case.
- [x] **Auto-payment errors are no longer silent.** `createAppointment` previously logged a warning and returned the appointment as if everything worked. The API now surfaces `EXCEEDS_BALANCE` / `PAYMENT_FAILED` to the client.
- [x] **Auto-payment is capped at the outstanding balance.** Patients with prior credit (advance payments) used to crash with `EXCEEDS_BALANCE`. Both create and update now share `applyPaidTransition` which creates a payment for `min(cost, outstanding)`, or skips and just reruns FIFO when the existing credit already covers the appointment.
- [x] **Payments section refreshes after appointment changes.** Saving an appointment with `isPaid=true` left balance / total paid / payment list stale. New `paymentsRefreshKey` on `PatientDetailPage` is bumped on appointment submit; reverse path also wired (creating/deleting a payment refreshes the appointments section).
- [x] **Partial-paid state on appointment cards.** Per-patient endpoints now expose `paidAmount` and `outstanding` per appointment via a new `computeFifoAllocation` helper. The card renders three states: `Pagado` (green), `Parcial` blue + "Aplicado: $X de $Y", `Pendiente` (amber). `recalculatePaidStatus` was refactored onto the same helper, switching to **strict FIFO** (a partial payment exhausts itself on the older item instead of "skipping" to a cheaper later one). `isPaid` exposed by the per-patient endpoints is the FIFO-derived value, not the persisted column, so the UI never shows a stale view.
- [x] i18n (es / en / ar): paid hint, already-paid hint, error codes (`cannotUnmarkPaid`, `exceedsBalance`, `paymentFailed`), partial label, "Aplicado: X de Y" line.

### Tests

- API: 70 appointment route tests + 22 payment route tests + 11 labwork route tests pass on this branch (the 2 pre-existing failures in `admin/stats.test.ts` also fail on `main` and are unrelated). Specific new coverage: `PUT /:id` paid transitions (false→true, idempotent stay-true, reject unmark, FIFO with older debt, cost-only change recalcs), prior-credit scenarios (full + partial coverage on both create and update), and the FIFO breakdown in `getAppointmentsByPatient`.
- Frontend: 978/978 tests pass; lint clean (the 3 pre-existing warnings in `LabworkFormModal` are unrelated).

### Out of scope (follow-ups)

- Other endpoints that return appointments (global list, calendar, by-doctor) do not include `paidAmount` / `outstanding` yet. The per-patient view (where the user reads the breakdown) is fully covered; extending the others is mechanical.
- Labworks have the same model and the same gaps. The shared FIFO helpers (`computeFifoAllocation`, `listBillableItems`, `getTotalPaid`) are already exported from `payment.service` so wiring labworks up is a small follow-up PR.

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

### Story 4: Frontend — budget management ✅

- [x] `BudgetsSection` in patient detail page (list + create button)
- [x] `BudgetFormModal` with inline editable item list (description, tooth number, quantity, unit price, auto-calculated total) via `useFieldArray`
- [x] Per-budget actions: view detail, edit (in detail page), delete (PDF + public link deferred to PR C)
- [x] Status badge and progress indicator (X of Y items executed)
- [x] `BudgetDetailPage` at `/patients/:patientId/budgets/:id` with granular editing (metadata via `PATCH /budgets/:id`, items via sub-endpoints)
- [x] i18n keys for ES/EN/AR (PT to be added by parallel track)
- [x] Permission-gated UI via `usePermissions()` matching backend RBAC
- [x] Component tests (22 new: budget-api + store + BudgetCard permission gating)

### Post-PR B polish (before PR C)

Small items found during local smoke testing of PR #177. Should land as a single tiny PR before starting PR C.

- [ ] Hide auto-derived budget statuses (`PARTIAL`, `COMPLETED`) from the manual dropdown in `BudgetDetailPage`. Keep only `DRAFT`, `APPROVED`, `CANCELLED` as user-settable. Backend normalizes auto-derived statuses on every write (`deriveBudgetStatus` in `budget.service.ts`), so the dropdown currently lets the user "save" a value that is silently overridden — which reads like a bug from the UI.

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
| **A** | 1 + 2 (model + backend + RBAC + tests) | Low — pure API | ✅ Merged (#176) |
| **B** | 4 (frontend management, PDF-less) | Medium — UI | ✅ Merged (#177) |
| **C** | 3 (PDF + public share link) | Medium — web public surface | ⚪ Pending (blocked on polish above) |
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
