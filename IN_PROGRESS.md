# In Progress

Active tasks for the current development cycle. Add tasks here before starting work.

## Gateway Timeout Fix — DEPLOYED

- [x] PR #152: Add `traefik.docker.network=coolify` to `api`, `web`, `app` (root cause fix)
- [x] PR #153: Show "session expired" message on auto-logout redirect
- [ ] Deploy and verify fix resolves the intermittent timeouts
- [ ] If timeouts persist: implement secondary fixes (health check, eager Prisma init, graceful shutdown)

## Create Appointments from Patient Detail — PR #156

- [x] Add `defaultPatientId` prop to `AppointmentFormModal` (pre-select + disable patient selector)
- [x] Add "Nueva Cita" button to `PatientDetailPage` (guarded by `APPOINTMENTS_CREATE` permission)
