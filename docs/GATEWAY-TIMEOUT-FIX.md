# Fix: Gateway Timeout After Deploy

## Problem

After every deployment on Coolify, the API intermittently returns 504 Gateway Timeout. Sometimes it works, sometimes it doesn't. Restarting Traefik (post-deploy hook) does not consistently fix it. Additionally, restarting **any** container on the server (even from other projects) can break routing for alveodent.

## Root Cause Analysis

### Primary: Missing `traefik.docker.network` label (PR #152 — MERGED)

Each service (`api`, `web`, `app`) is on two Docker networks:
- `dental-network` — internal communication between services
- `coolify` — external network shared with Traefik

Traefik's config has `--providers.docker=true` but **no** `--providers.docker.network`. Without the `traefik.docker.network` label on containers, Traefik **randomly picks** which network to use for routing. When it picks `dental-network` (which Traefik is NOT connected to), routing fails with Gateway Timeout.

**Fix:** Added `traefik.docker.network=coolify` label to all 3 exposed services in `docker-compose.yml`.

### Secondary: Startup sequence race condition

Docker Compose `up -d` does **not** do zero-downtime deployments. The sequence is:

```
1. STOP old API container          ← traffic starts failing HERE
2. REMOVE old container
3. CREATE new container
4. START new container
5. wait-for-db.sh TCP check loop   (up to 30s)
6. prisma migrate deploy           (seconds to minutes)
7. node dist/index.js              (server starts listening)
8. Docker healthcheck passes       (interval:10s, start_period:30s)
9. Traefik detects healthy backend ← traffic resumes HERE
```

Between steps 1-9, there is **zero** capacity to serve traffic. The gap duration depends on migration time, DB latency, and healthcheck timing.

### Why it's intermittent

- **Works**: No new migrations, DB responds fast, healthcheck passes quickly (~15s gap, often unnoticed).
- **Fails**: New migrations, DB busy, or healthcheck takes multiple cycles (~30-90s gap, users see 504).

### Why restarting Traefik doesn't help (and may make it worse)

The post-deploy hook runs immediately after `docker compose up`. At that point, the new container is still in steps 5-7 (waiting for DB, running migrations, starting Node). Restarting Traefik clears its backend cache, and since the new container isn't healthy yet, Traefik has **zero backends** → all requests get 504 until the next health check cycle detects the ready container.

### Contributing technical issues

1. **Superficial health check** (`apps/api/src/routes/health.ts`): Returns `{status: 'ok'}` without verifying DB connectivity. Docker marks container healthy before the app can actually serve requests.

2. **Lazy Prisma initialization** (`packages/database/src/index.ts`): Uses a Proxy pattern that creates the DB connection on the **first query**, not at startup. The first real request after deploy triggers connection setup and can hang.

3. **pg Pool with no connection timeout** (`packages/database/src/index.ts`): `new Pool({ connectionString })` uses default `connectionTimeoutMillis: 0` (infinite). If DB is slow, the first request hangs forever.

4. **No graceful shutdown** (`apps/api/src/index.ts`): No `SIGTERM`/`SIGINT` handlers. When Docker stops the old container, in-flight requests are killed abruptly and DB connections are never closed (`disconnectDatabase()` exists but is never called).

---

## Implementation Plan

### Fix 1: Health check that verifies DB

**File:** `apps/api/src/routes/health.ts`

**Current:**
```typescript
healthRouter.get('/', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() })
})
```

**Change to:**
```typescript
import { prisma } from '@dental/database'

healthRouter.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() })
  } catch {
    res.status(503).json({ status: 'unhealthy', timestamp: new Date().toISOString() })
  }
})
```

Docker won't mark the container healthy until the DB is actually reachable. Traefik won't route traffic until the health check passes.

### Fix 2: Eager Prisma initialization with connection timeout

**File:** `packages/database/src/index.ts`

Changes:
- Add `connectionTimeoutMillis: 5000` to the pg Pool configuration
- Export a `connectDatabase()` function that calls `prisma.$connect()` explicitly

```typescript
_pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
})
```

```typescript
export async function connectDatabase(): Promise<void> {
  const client = getPrismaClient()
  await client.$connect()
}
```

**File:** `apps/api/src/index.ts`

Change to start server only after DB connection succeeds:

```typescript
import { connectDatabase } from '@dental/database'

async function start() {
  await connectDatabase()

  const server = app.listen(env.PORT, () => {
    logger.info(`API server running on http://localhost:${env.PORT}`)
  })
  // ... shutdown handlers (see Fix 3)
}

start().catch((err) => {
  logger.error({ err }, 'Failed to start API server')
  process.exit(1)
})
```

If DB is unreachable, the server never starts listening → healthcheck fails → Docker restarts the container → retries.

### Fix 3: Graceful shutdown

**File:** `apps/api/src/index.ts`

Add SIGTERM/SIGINT handlers inside the `start()` function:

```typescript
function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully...`)
  server.close(async () => {
    await disconnectDatabase()
    logger.info('Server closed')
    process.exit(0)
  })
  // Force exit after 25s (before Docker's stop_grace_period: 30s)
  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 25_000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
```

During deploy: old container receives SIGTERM → stops accepting new requests → finishes in-flight requests → closes DB connections → exits cleanly.

### Fix 4: Adjust post-deploy hook timing

**In Coolify UI** (Post Deployment Command):

Option A — Add delay before Traefik restart:
```bash
sleep 30 && docker restart coolify-proxy
```

Option B — Remove the Traefik restart entirely (if fixes 1-3 resolve the issue, Docker's native healthcheck + Traefik's service discovery should be sufficient).

---

## Progress

### Done
- [x] **PR #152**: Add `traefik.docker.network=coolify` label to `api`, `web`, `app` services
- [x] **PR #153**: Show "session expired" message on auto-logout redirect
- [x] Cleaned malformed sslip.io URLs from all Coolify projects

### Pending (lower priority — implement if timeouts persist after PR #152)
- [ ] Fix 1: Health check with DB verification (`SELECT 1`)
- [ ] Fix 2: Eager Prisma init + `connectionTimeoutMillis: 5000`
- [ ] Fix 3: Graceful shutdown handlers (SIGTERM/SIGINT)
- [ ] Fix 4: Remove post-deploy `docker restart coolify-proxy` hook (no longer needed)

## Files Changed

| File | Change | Status |
|------|--------|--------|
| `docker-compose.yml` | Add `traefik.docker.network=coolify` to 3 services | Done (PR #152) |
| `apps/api/src/routes/health.ts` | Add DB check with `SELECT 1` | Pending |
| `apps/api/src/index.ts` | Eager DB init + graceful shutdown handlers | Pending |
| `packages/database/src/index.ts` | Add `connectDatabase()`, `connectionTimeoutMillis` | Pending |
| Coolify UI | Remove post-deploy Traefik restart hook | Pending |

## Testing

- [ ] Deploy PR #152 and verify no gateway timeout
- [ ] Restart a container from another project — verify alveodent stays up
- [ ] Restart coolify-proxy — verify alveodent recovers
- [ ] Verify health check returns 503 when DB is down (after Fix 1)
- [ ] Verify server doesn't start listening if DB is unreachable (after Fix 2)
- [ ] Verify SIGTERM triggers clean shutdown (after Fix 3)
