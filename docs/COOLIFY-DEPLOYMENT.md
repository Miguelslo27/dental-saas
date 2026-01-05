# 🚀 Coolify Deployment Guide - Dental SaaS

This guide covers deploying the Dental SaaS monorepo to Coolify using Docker Compose.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Coolify API Setup](#coolify-api-setup)
4. [SSH Access Setup](#ssh-access-setup)
5. [Quick Start](#quick-start)
6. [Environment Variables](#environment-variables)
7. [Domain Configuration](#domain-configuration)
8. [Step-by-Step Deployment](#step-by-step-deployment)
9. [Post-Deployment Checklist](#post-deployment-checklist)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    COOLIFY (Traefik Proxy)                       │
│                                                                  │
│   your-domain.com ───────────▶ web:8080 (nginx)                 │
│   api.your-domain.com ───────▶ api:3000 (node)                  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                     Docker Compose Stack                         │
│                                                                  │
│  ┌─────────────┐     ┌─────────────┐                            │
│  │     web     │────▶│     api     │                            │
│  │   (nginx)   │     │   (node)    │                            │
│  │   :8080     │     │   :3000     │                            │
│  └─────────────┘     └──────┬──────┘                            │
│                             │                                    │
│              ┌──────────────┴──────────────┐                    │
│              ▼                             ▼                    │
│       ┌─────────────┐              ┌─────────────┐              │
│       │  postgres   │              │    redis    │              │
│       │   :5432     │              │   :6379     │              │
│       │  (internal) │              │  (internal) │              │
│       └─────────────┘              └─────────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Service      | Technology        | Internal Port | Exposed     |
| ------------ | ----------------- | ------------- | ----------- |
| **web**      | nginx + React     | 8080          | Via Traefik |
| **api**      | Node.js + Express | 3000          | Via Traefik |
| **postgres** | PostgreSQL 16     | 5432          | No          |
| **redis**    | Redis 7           | 6379          | No          |

> **Important:** Coolify uses Traefik as its reverse proxy. Services should NOT expose ports directly in `docker-compose.yml`. Traefik routes traffic based on domain configuration.

---

## Prerequisites

### On your Coolify server
- [ ] Coolify v4+ installed and running
- [ ] Domain pointing to server IP (A record)
- [ ] Subdomain for API (e.g., `api.your-domain.com`)
- [ ] SSH Private Key configured (see [SSH Access Setup](#ssh-access-setup))

### Repository files (already included)
- [x] `docker-compose.yml` - Production configuration
- [x] `docker-compose.dev.yml` - Development configuration  
- [x] `apps/api/Dockerfile` - API multi-stage build
- [x] `apps/web/Dockerfile` - Web multi-stage build
- [x] `apps/web/nginx.conf` - nginx configuration
- [x] `.dockerignore` - Build exclusions

---

## Coolify API Setup

The Coolify API allows you to automate deployments, check application status, and manage resources programmatically.

### Generate an API Token

1. Go to **Coolify → Settings → API Keys**
2. Click **"Create New API Token"**
3. Give it a descriptive name (e.g., "local-dev")
4. Copy the generated token (it will only be shown once)

### Configure API Environment Variables

Add these to your `~/.zshrc` or `~/.bashrc`:

```bash
export COOLIFY_TOKEN="your-api-token-here"
export COOLIFY_API_URL="https://your-coolify-domain.com/api/v1"
```

### Test the API

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" "$COOLIFY_API_URL/applications"
```

---

## SSH Access Setup

SSH access to your Coolify server allows you to:
- Debug containers directly (`docker logs`, `docker exec`)
- Delete volumes manually when needed
- Run maintenance commands

### 1. Obtain SSH Private Key from Coolify

1. Go to **Coolify → Security → Private Keys**
2. Select or create a key assigned to your server
3. Copy the private key content

### 2. Save the Private Key Locally

```bash
# Create directory for Coolify SSH keys
mkdir -p ~/.ssh/coolify

# Create the private key file
# Paste the private key content from Coolify
nano ~/.ssh/coolify/id_rsa

# Set correct permissions (REQUIRED - SSH rejects keys with wrong permissions)
chmod 600 ~/.ssh/coolify/id_rsa

# Verify the key is valid
ssh-keygen -l -f ~/.ssh/coolify/id_rsa
# Should output something like:
# 256 SHA256:xxxxx... phpseclib-generated-key (ED25519)
```

### 3. Configure SSH Environment Variables

Add these to your `~/.zshrc` or `~/.bashrc`:

```bash
# Coolify SSH Configuration
export COOLIFY_SSH_USER="root"
export COOLIFY_SSH_HOST="your-server-ip"  # e.g., 72.60.6.218
# Path to the SSH private key used for Coolify connections
export COOLIFY_SSH_KEY_PATH="$HOME/.ssh/coolify/id_rsa"
```

Reload your shell:
```bash
source ~/.zshrc
```

### 4. Test the Connection

```bash
ssh -i "$COOLIFY_SSH_KEY_PATH" "$COOLIFY_SSH_USER@$COOLIFY_SSH_HOST" "echo 'SSH Connected!'"
```

### 5. Useful SSH Commands

Once connected, you can run Docker commands directly:

```bash
# List all containers
docker ps -a

# View logs for a specific container
docker logs <container-name> --tail 100

# Execute a command inside a container
docker exec -it <container-name> sh

# List volumes
docker volume ls

# Delete a specific volume (CAUTION: data loss)
docker volume rm <volume-name>

# View container resource usage
docker stats
```

### Troubleshooting SSH

| Issue                                    | Solution                                                                                                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Permission denied (publickey,password)` | The public key is not registered on the server. Verify the key is assigned to the server in Coolify → Servers → [Server] → Private Key                   |
| `WARNING: UNPROTECTED PRIVATE KEY FILE!` | Run `chmod 600 ~/.ssh/coolify/id_rsa`                                                                                                                    |
| `Connection refused`                     | Check the server IP and that port 22 is open                                                                                                             |
| `Host key verification failed`           | Use `ssh-keyscan $COOLIFY_SSH_HOST` to get the host key, verify its fingerprint via a trusted channel, then add it to `~/.ssh/known_hosts` if it matches |

---

## Quick Start

1. **Create project** in Coolify: New Project → "dental-saas"
2. **Add resource**: New Resource → Docker Compose
3. **Connect repository**: GitHub → Select `dental-saas`
4. **Configure environment variables** (see section below)
5. **Configure domains** for `web` and `api` services
6. **Deploy**

---

## Environment Variables

### Required Variables

Configure these in Coolify's environment variables section:

```bash
# =============================================
# DATABASE (PostgreSQL)
# =============================================
POSTGRES_DB=dental_saas
POSTGRES_USER=dental
POSTGRES_PASSWORD=<generate-secure-password>

# =============================================
# CACHE (Redis)
# =============================================
REDIS_PASSWORD=<generate-secure-password>

# =============================================
# API (Backend) - REQUIRED
# =============================================
# JWT secrets - CRITICAL: Generate unique values
JWT_SECRET=<generate-64-char-secret>
JWT_REFRESH_SECRET=<generate-64-char-secret>

# Initial admin setup key
SETUP_KEY=<generate-32-char-secret>

# CORS - Must match your frontend domain exactly
# Format: https://your-domain.com (no trailing slash)
CORS_ORIGIN=https://your-domain.com

# =============================================
# EMAIL (Resend) - OPTIONAL
# =============================================
# Get your API key from https://resend.com
# If not configured, emails will be skipped silently
RESEND_API_KEY=<your-resend-api-key>
EMAIL_FROM=Dental SaaS <noreply@your-verified-domain.com>

# =============================================
# FRONTEND (Build-time)
# =============================================
# API URL for frontend to call
# Format: https://api.your-domain.com (no trailing slash)
VITE_API_URL=https://api.your-domain.com
```

### Generate Secure Secrets

Run these commands to generate secure values:

```bash
# For database passwords
openssl rand -base64 32

# For JWT secrets (longer)
openssl rand -base64 64

# For SETUP_KEY
openssl rand -hex 16
```

### Example Complete Configuration

```bash
POSTGRES_DB=dental_saas
POSTGRES_USER=dental
POSTGRES_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE
REDIS_PASSWORD=YOUR_REDIS_PASSWORD_HERE
JWT_SECRET=<REPLACE_WITH_STRONG_JWT_SECRET>
JWT_REFRESH_SECRET=<REPLACE_WITH_STRONG_JWT_REFRESH_SECRET>
SETUP_KEY=<REPLACE_WITH_SETUP_KEY>
CORS_ORIGIN=https://dental.example.com
VITE_API_URL=https://api.dental.example.com
RESEND_API_KEY=<OPTIONAL_RESEND_API_KEY>
EMAIL_FROM=Dental SaaS <noreply@dental.example.com>
```

---

## Domain Configuration

### In Coolify

After deployment, configure domains for each service:

| Service | Domain                | Port   |
| ------- | --------------------- | ------ |
| **web** | `your-domain.com`     | `8080` |
| **api** | `api.your-domain.com` | `3000` |

### Steps in Coolify UI:

1. Go to your Docker Compose resource
2. Click on **Services** tab
3. For each service (`web`, `api`):
   - Click the service name
   - Go to **Domains** section
   - Add domain with correct port
   - Enable **SSL** (auto Let's Encrypt)
   - Enable **Force HTTPS**

> **Note:** Make sure your DNS A records (see next section) have fully propagated and that SSL certificates are successfully issued before enabling **Force HTTPS**. Enabling Force HTTPS too early can cause users to see certificate or connection errors if they visit the site before certificate provisioning is complete.

### DNS Configuration

In your domain provider, create A records:

```
your-domain.com        A    <COOLIFY-SERVER-IP>
api.your-domain.com    A    <COOLIFY-SERVER-IP>
```

---

## Step-by-Step Deployment

### 1. Create Project in Coolify

1. Dashboard → **New Project**
2. Name: `dental-saas`
3. Click **Create**

### 2. Add Docker Compose Resource

1. Inside project → **New Resource**
2. Select **Docker Compose**
3. Source: **GitHub**
4. Connect/select repository: `dental-saas`
5. Branch: `main`
6. Docker Compose file: `docker-compose.yml` (default)

### 3. Configure Environment Variables

1. Go to **Environment Variables** tab
2. Add all required variables from section above
3. **Important:** Ensure no trailing whitespace or newlines

### 4. Initial Deploy (Build Only)

1. Click **Deploy**
2. Wait for build to complete (first build takes ~5-10 minutes)
3. Check build logs for any errors

### 5. Configure Domains

1. Go to **Services** tab
2. Configure `web` service:
   - Domain: `your-domain.com`
   - Port: `8080`
   - Enable SSL
3. Configure `api` service:
   - Domain: `api.your-domain.com`
   - Port: `3000`
   - Enable SSL

### 6. Redeploy

1. Click **Redeploy** to apply domain configuration
2. Wait for all services to be healthy

### 7. Verify Deployment

```bash
# Check API health
curl https://api.your-domain.com/health

# Check frontend loads
curl -I https://your-domain.com
```

---

## Post-Deployment Configuration

### ⚠️ REQUIRED: Configure Post-Deployment Hook

**Important:** After initial deployment, you MUST configure a post-deployment hook to prevent gateway timeout issues. Traefik (Coolify's reverse proxy) may not reload routes automatically after container replacements.

**Steps to configure:**

1. Go to **Coolify UI → Applications → [Your App]**
2. Navigate to **Advanced → Deployment**
3. In **Post Deployment Command**, enter:
   ```
   docker restart coolify-proxy
   ```
4. Click **Save**

This ensures the proxy reloads its routing configuration after every deployment, preventing gateway timeout issues.

> **Why is this needed?** When Docker Compose recreates containers during deployment, they get new internal IPs. Traefik may cache the old IPs, causing 504 Gateway Timeout errors until manually restarted. The post-deployment hook automates this restart.

---

## Post-Deployment Checklist

### Services Health

- [ ] All containers showing "Running" status
- [ ] No restart loops (check restart count)
- [ ] PostgreSQL healthcheck passing
- [ ] Redis healthcheck passing

### API Verification

- [ ] `GET /health` returns 200 OK
- [ ] Database migrations applied (check API logs)
- [ ] No connection errors in logs

### Frontend Verification

- [ ] Page loads without errors
- [ ] No console errors (check browser DevTools)
- [ ] API calls working (check Network tab)

### Security

- [ ] SSL certificates valid (green padlock)
- [ ] HTTP redirects to HTTPS
- [ ] Environment variables not exposed

### Initial Setup

- [ ] Navigate to `/admin/setup`
- [ ] Create super admin account using SETUP_KEY
- [ ] Verify login works

---

## Troubleshooting

### Container Keeps Restarting

**Symptom:** Service shows "Restarting" with multiple restart count

**Cause:** Usually missing or invalid environment variables

**Fix:**
1. Check container logs in Coolify
2. Verify all required env vars are set
3. Common issues:
   - Empty `JWT_SECRET` or `JWT_REFRESH_SECRET`
   - Invalid `DATABASE_URL` format
   - Missing `CORS_ORIGIN`

### 502 Bad Gateway

**Symptom:** Browser shows 502 error

**Cause:** Traefik can't reach the service

**Fix:**
1. Verify domain is configured with correct port
2. Check container is actually running
3. Verify ports:
   - `web` → port `8080` (NOT 80)
   - `api` → port `3000`

### 404 Not Found

**Symptom:** Root URL returns 404

**Cause:** Domain not configured or pointing to wrong service

**Fix:**
1. Ensure domain is assigned to `web` service
2. Port must be `8080`
3. Redeploy after domain changes

### Database Connection Failed

**Symptom:** API logs show "Cannot connect to database"

**Cause:** PostgreSQL not healthy or wrong credentials

**Fix:**
1. Check PostgreSQL container is healthy
2. Verify `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` match
3. Database URL uses service name: `postgres` (not `localhost`)

### CORS Errors

**Symptom:** Browser console shows CORS errors

**Cause:** `CORS_ORIGIN` doesn't match frontend domain

**Fix:**
1. `CORS_ORIGIN` must exactly match frontend URL
2. Include protocol: `https://your-domain.com`
3. No trailing slash
4. Redeploy API after changes

### Build Fails - Out of Memory

**Symptom:** Build killed during `pnpm install` or `pnpm build`

**Cause:** Server doesn't have enough RAM

**Fix:**
1. Minimum 2GB RAM recommended
2. Or add swap space to server
3. Or build locally and push images

### Prisma Migration Fails

**Symptom:** API logs show migration error on startup

**Fix:**
```bash
# SSH into Coolify server
docker exec -it <api-container-name> sh

# Run migrations manually (from container shell)
cd /app/packages/database && npx prisma migrate deploy
```

### View Container Logs

In Coolify UI:
1. Click on your Docker Compose resource
2. Go to **Services** tab
3. Click service name → **Logs**

Via SSH:
```bash
# List containers
docker ps | grep dental

# View logs
docker logs <container-name> --tail 100 -f
```

---

## File Reference

### Production Files

| File                  | Purpose                             |
| --------------------- | ----------------------------------- |
| `docker-compose.yml`  | Production config (Coolify default) |
| `apps/api/Dockerfile` | API multi-stage build               |
| `apps/web/Dockerfile` | Web multi-stage build               |
| `apps/web/nginx.conf` | nginx for SPA routing               |
| `.dockerignore`       | Excludes node_modules, .git, etc.   |

### Development Files

| File                     | Purpose                        |
| ------------------------ | ------------------------------ |
| `docker-compose.dev.yml` | Development with exposed ports |

### Key Differences: Dev vs Prod

| Aspect          | Development              | Production            |
| --------------- | ------------------------ | --------------------- |
| Compose file    | `docker-compose.dev.yml` | `docker-compose.yml`  |
| Ports exposed   | Yes (5432, 6379)         | No (internal only)    |
| Default creds   | Yes (`dentalpassword`)   | No (must be provided) |
| Container names | Yes (`dental-postgres`)  | No (Coolify manages)  |

---

## Next Steps

After successful deployment:

1. [ ] Configure automated backups for PostgreSQL
2. [ ] Set up monitoring (Uptime Kuma or similar)
3. [ ] Configure error tracking (Sentry)
4. [ ] Set up log aggregation
5. [ ] Document rollback procedure
6. [ ] Configure CI/CD for automatic deploys

---

## References

- [Coolify Documentation](https://coolify.io/docs)
- [Coolify Docker Compose Support](https://coolify.io/docs/applications/docker-compose)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
