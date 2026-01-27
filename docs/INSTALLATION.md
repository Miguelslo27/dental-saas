# Installation Guide - Alveo System

Complete guide to install and set up the Alveo System (Dental SaaS) for development or production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: v22.0.0 or higher (LTS recommended)
- **pnpm**: v10.0.0 or higher
- **Docker**: Latest stable version
- **Docker Compose**: v2.0 or higher
- **Git**: Latest version

### System Requirements

**Development:**
- CPU: 2+ cores
- RAM: 4GB minimum, 8GB recommended
- Disk: 10GB free space

**Production:**
- CPU: 4+ cores recommended
- RAM: 8GB minimum, 16GB recommended
- Disk: 50GB+ depending on data volume

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/Miguelslo27/dental-saas.git
cd dental-saas
```

### Step 2: Install Dependencies

```bash
# Install pnpm globally if not already installed
npm install -g pnpm

# Install project dependencies
pnpm install
```

### Step 3: Configure Environment Variables

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` and configure the following required variables:

```env
# Application Ports
PORT=5001
VITE_APP_PORT=5002
VITE_WEB_PORT=5003

# Database (auto-configured by docker-compose.dev.yml)
DATABASE_URL="postgresql://dental:dental@localhost:5432/dental_dev"
POSTGRES_PORT=5432

# Redis (auto-configured by docker-compose.dev.yml)
REDIS_URL="redis://localhost:6379"
REDIS_PORT=6379

# JWT (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Super Admin Setup Key (generate a secure random string)
SETUP_KEY="your-super-admin-setup-key-min-16-chars"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"

# Environment
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5002"

# API URL for Frontend
VITE_API_URL="http://localhost:5001"
```

**Generate secure secrets:**

```bash
# Generate JWT_SECRET (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SETUP_KEY (16+ characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

See [ENVIRONMENT.md](./ENVIRONMENT.md) for complete variable documentation.

### Step 4: Start Database Services

Start PostgreSQL and Redis using Docker Compose:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Verify services are running:

```bash
docker compose -f docker-compose.dev.yml ps
```

### Step 5: Run Database Migrations

```bash
# Generate Prisma client
pnpm --filter @dental/database db:generate

# Run migrations
pnpm --filter @dental/database db:migrate

# (Optional) Seed database with sample data
pnpm --filter @dental/database db:seed
```

### Step 6: Start Development Servers

```bash
# Start all apps (API + App + Web) in development mode
pnpm dev
```

This will start:
- **API**: http://localhost:5001
- **App**: http://localhost:5002
- **Web**: http://localhost:5003

### Step 7: Create Super Admin Account

Navigate to the API setup endpoint:

```bash
# Using the SETUP_KEY from your .env file
curl -X POST http://localhost:5001/api/v1/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "setupKey": "your-super-admin-setup-key-min-16-chars",
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "firstName": "Super",
    "lastName": "Admin"
  }'
```

Or use the web interface at: http://localhost:5001/api/v1/admin/setup

**Important:** The setup endpoint auto-disables after creating the first super admin.

### Step 8: Verify Installation

1. **API Health Check**: http://localhost:5001/api/v1/health
2. **Frontend App**: http://localhost:5002
3. **Landing Page**: http://localhost:5003

---

## Production Deployment

### Option 1: Docker Deployment

```bash
# Build production images
docker compose build

# Start production stack
docker compose up -d
```

### Option 2: Coolify Deployment

See [COOLIFY-DEPLOYMENT.md](./COOLIFY-DEPLOYMENT.md) for complete Coolify setup guide.

### Option 3: Manual Deployment

1. **Build applications:**

```bash
# Build all packages
pnpm build

# Applications will be built to:
# - apps/api/dist
# - apps/app/dist
# - apps/web/dist
```

2. **Set up production database:**

```bash
# Set production DATABASE_URL in .env
export DATABASE_URL="postgresql://user:password@host:5432/dental_prod"

# Run migrations
pnpm --filter @dental/database db:migrate
```

3. **Start production servers:**

```bash
# API
cd apps/api
node dist/index.js

# App & Web (serve with nginx, caddy, or any static server)
# Serve apps/app/dist on port 5002
# Serve apps/web/dist on port 5003
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose -f docker-compose.dev.yml ps

# Check PostgreSQL logs
docker compose -f docker-compose.dev.yml logs postgres

# Test connection
docker compose -f docker-compose.dev.yml exec postgres psql -U dental -d dental_dev -c "SELECT 1"
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker compose -f docker-compose.dev.yml ps

# Test Redis connection
docker compose -f docker-compose.dev.yml exec redis redis-cli ping
```

### Port Already in Use

```bash
# Find process using port 5001
lsof -i :5001

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=5011
```

### Prisma Client Issues

```bash
# Regenerate Prisma client
pnpm --filter @dental/database db:generate

# Reset database (⚠️ deletes all data)
pnpm --filter @dental/database db:reset
```

### pnpm Issues

```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

---

## Next Steps

After successful installation:

1. Read [DEVELOPMENT.md](./DEVELOPMENT.md) for development guidelines
2. Review [ENVIRONMENT.md](./ENVIRONMENT.md) for all configuration options
3. Check [API.md](./API.md) for API documentation
4. See [COOLIFY-DEPLOYMENT.md](./COOLIFY-DEPLOYMENT.md) for production deployment

---

## Getting Help

- **Documentation**: Check all docs in `/docs` folder
- **Issues**: https://github.com/Miguelslo27/dental-saas/issues
- **Troubleshooting**: See [COOLIFY-TROUBLESHOOTING.md](./COOLIFY-TROUBLESHOOTING.md)

---

*Last updated: January 27, 2026*
