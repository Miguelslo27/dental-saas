# In Progress

Active tasks for the current development cycle. Add tasks here before starting work.

## Gateway Timeout Fix — DEPLOYED

- [x] PR #152: Add `traefik.docker.network=coolify` to `api`, `web`, `app` (root cause fix)
- [x] PR #153: Show "session expired" message on auto-logout redirect
- [ ] Deploy and verify fix resolves the intermittent timeouts
- [ ] If timeouts persist: implement secondary fixes (health check, eager Prisma init, graceful shutdown)

## Appointment Auto-Payment — PR #155

- [x] Auto-create `PatientPayment` when appointment created with isPaid=true and cost > 0
- [x] Make `isPaid` FIFO-controlled only (removed direct writes from update)
- [x] Frontend: refetch appointment list after auto-payment to reflect FIFO changes
- [x] 3 new integration tests
