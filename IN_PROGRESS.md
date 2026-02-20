# In Progress

Active tasks for the current development cycle. Add tasks here before starting work.

## Gateway Timeout Fix — DEPLOYED

- [x] PR #152: Add `traefik.docker.network=coolify` to `api`, `web`, `app` (root cause fix)
- [x] PR #153: Show "session expired" message on auto-logout redirect
- [ ] Deploy and verify fix resolves the intermittent timeouts
- [ ] If timeouts persist: implement secondary fixes (health check, eager Prisma init, graceful shutdown)

## Features Page + Patient Limits — PR #154

- [x] FeaturesPage with 4 categories, 14 features + updated Header/Footer/HomePage links
- [x] Update patient limits: free 50, basic 200, enterprise 500 (pricing page, seed, migration, fallback)

## Patient Payment Tracking (Entregas) — DONE

- [x] PR #137: Database model (`PatientPayment`) + permissions (`PAYMENTS_VIEW`, `PAYMENTS_CREATE`, `PAYMENTS_DELETE`)
- [x] PR #138: Backend service (FIFO allocation) + REST routes + integration tests (17 tests)
- [x] PR #140: Frontend — API client, PaymentSection, PaymentFormModal, i18n (ES/EN/AR), `/me` currency field
