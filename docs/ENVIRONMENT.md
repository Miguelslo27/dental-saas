# Environment Variables Documentation

Complete reference for all environment variables used in the Alveo System.

## Table of Contents

- [Quick Start](#quick-start)
- [Application Ports](#application-ports)
- [Database Configuration](#database-configuration)
- [Redis Configuration](#redis-configuration)
- [Authentication & Security](#authentication--security)
- [Email Service](#email-service)
- [Environment Mode](#environment-mode)
- [Frontend Configuration](#frontend-configuration)
- [Security Best Practices](#security-best-practices)

---

## Quick Start

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required variables for local development:**
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `SETUP_KEY`
- `RESEND_API_KEY` (for email features)

---

## Application Ports

### `PORT`
- **Description**: API server port
- **Default**: `5001`
- **Required**: No
- **Example**: `PORT=5001`

### `VITE_APP_PORT`
- **Description**: Frontend application port (React app)
- **Default**: `5002`
- **Required**: No
- **Example**: `VITE_APP_PORT=5002`

### `VITE_WEB_PORT`
- **Description**: Landing page port
- **Default**: `5003`
- **Required**: No
- **Example**: `VITE_WEB_PORT=5003`

---

## Database Configuration

### `DATABASE_URL`
- **Description**: PostgreSQL connection string
- **Format**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
- **Required**: Yes
- **Example**:
  ```env
  DATABASE_URL="postgresql://dental:SecurePass123@localhost:5432/dental_saas?schema=public"
  ```
- **Notes**:
  - Used by Prisma ORM
  - Must include `?schema=public` suffix
  - Ensure password is URL-encoded if it contains special characters

### `POSTGRES_DB`
- **Description**: PostgreSQL database name
- **Default**: `dental_saas`
- **Required**: No (only for docker-compose)
- **Example**: `POSTGRES_DB=dental_saas`

### `POSTGRES_USER`
- **Description**: PostgreSQL username
- **Default**: `dental`
- **Required**: No (only for docker-compose)
- **Example**: `POSTGRES_USER=dental`

### `POSTGRES_PASSWORD`
- **Description**: PostgreSQL password
- **Required**: Yes (for docker-compose)
- **Example**: `POSTGRES_PASSWORD=StrongPassword123!`
- **Security**: Use strong passwords (20+ characters, mix of letters, numbers, symbols)

### `POSTGRES_PORT`
- **Description**: PostgreSQL port
- **Default**: `5432`
- **Required**: No
- **Example**: `POSTGRES_PORT=5432`

**Generate secure database password:**
```bash
openssl rand -base64 32
```

---

## Redis Configuration

### `REDIS_URL`
- **Description**: Redis connection string
- **Format**: `redis://[username][:password]@HOST:PORT`
- **Required**: Yes
- **Example**:
  ```env
  REDIS_URL="redis://:SecureRedisPass@localhost:6379"
  ```
- **Notes**:
  - Used for session storage and caching
  - Password is optional but recommended for production

### `REDIS_PASSWORD`
- **Description**: Redis password
- **Required**: No (recommended for production)
- **Example**: `REDIS_PASSWORD=SecureRedisPass123`
- **Security**: Use strong passwords in production

### `REDIS_PORT`
- **Description**: Redis port
- **Default**: `6379`
- **Required**: No
- **Example**: `REDIS_PORT=6379`

**Generate secure Redis password:**
```bash
openssl rand -base64 32
```

---

## Authentication & Security

### `JWT_SECRET`
- **Description**: Secret key for signing JWT tokens
- **Required**: Yes
- **Minimum Length**: 32 characters
- **Example**: `JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"`
- **Security**:
  - Must be kept secret
  - Use different secrets for dev/staging/production
  - Never commit to version control

**Generate JWT secret:**
```bash
# Method 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 2: Using OpenSSL
openssl rand -hex 32
```

### `JWT_ACCESS_EXPIRES_IN`
- **Description**: Access token expiration time
- **Default**: `15m`
- **Required**: No
- **Format**: Time string (e.g., "15m", "1h", "7d")
- **Example**: `JWT_ACCESS_EXPIRES_IN="15m"`
- **Recommended**:
  - Development: `15m` to `1h`
  - Production: `15m` to `30m`

### `JWT_REFRESH_EXPIRES_IN`
- **Description**: Refresh token expiration time
- **Default**: `7d`
- **Required**: No
- **Format**: Time string (e.g., "7d", "30d", "90d")
- **Example**: `JWT_REFRESH_EXPIRES_IN="7d"`
- **Recommended**: `7d` to `30d`

### `SETUP_KEY`
- **Description**: Secret key required for creating the first super admin account
- **Required**: Yes
- **Minimum Length**: 16 characters
- **Example**: `SETUP_KEY="super-secret-setup-key-123"`
- **Notes**:
  - Used only once during initial setup
  - Endpoint auto-disables after first super admin creation
  - Can be removed after setup is complete

**Generate setup key:**
```bash
# Method 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Method 2: Using OpenSSL
openssl rand -hex 16
```

---

## Email Service

### `RESEND_API_KEY`
- **Description**: API key for Resend email service
- **Required**: Yes (for email features)
- **Format**: Starts with `re_`
- **Example**: `RESEND_API_KEY="re_123abc..."`
- **Get Key**: https://resend.com/api-keys
- **Notes**:
  - Required for password reset emails
  - Required for appointment notifications
  - For development, use test mode

### `EMAIL_FROM`
- **Description**: Email sender address
- **Required**: Yes (for email features)
- **Format**: "Name <email@domain.com>" or "email@domain.com"
- **Example**:
  ```env
  EMAIL_FROM="Alveo System <noreply@yourdomain.com>"
  ```
- **Development**: Use `onboarding@resend.dev` (no domain verification needed)
- **Production**: Must verify your domain with Resend

**Development setup (no domain needed):**
```env
EMAIL_FROM="Alveo System <onboarding@resend.dev>"
```

**Production setup (custom domain):**
```env
EMAIL_FROM="Alveo System <noreply@yourdomain.com>"
```

---

## Environment Mode

### `NODE_ENV`
- **Description**: Application environment mode
- **Values**: `development`, `production`, `test`
- **Default**: `development`
- **Required**: No
- **Example**: `NODE_ENV="production"`
- **Effects**:
  - **development**: Detailed error messages, debug logging
  - **production**: Minimal logging, optimizations enabled
  - **test**: Test mode for CI/CD

### `CORS_ORIGIN`
- **Description**: Allowed CORS origin for API requests
- **Required**: Yes
- **Format**: URL without trailing slash
- **Examples**:
  - Development: `CORS_ORIGIN="http://localhost:5002"`
  - Production: `CORS_ORIGIN="https://app.yourdomain.com"`
- **Security**:
  - Cannot be `*` in production
  - Must match your frontend URL exactly
  - Use comma-separated list for multiple origins

---

## Frontend Configuration

### `VITE_API_URL`
- **Description**: Backend API URL used by frontend applications
- **Required**: Yes
- **Format**: URL without trailing slash
- **Examples**:
  - Development: `VITE_API_URL="http://localhost:5001"`
  - Production: `VITE_API_URL="https://api.yourdomain.com"`
- **Notes**:
  - Must be accessible from user's browser
  - Include protocol (http:// or https://)
  - No trailing slash

---

## Security Best Practices

### Password Generation

**Strong passwords should have:**
- Minimum 20 characters
- Mix of uppercase, lowercase, numbers, and symbols
- No dictionary words
- No personal information

**Generate secure passwords:**
```bash
# 32 characters, base64
openssl rand -base64 32

# 64 characters, hex
openssl rand -hex 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Environment Files Security

**DO:**
- ✅ Add `.env` to `.gitignore`
- ✅ Use different secrets for each environment
- ✅ Store production secrets in secure vault (e.g., AWS Secrets Manager, HashiCorp Vault)
- ✅ Rotate secrets periodically
- ✅ Use environment-specific `.env` files (.env.production, .env.staging)

**DON'T:**
- ❌ Commit `.env` files to git
- ❌ Share secrets via email or chat
- ❌ Use the same secrets across environments
- ❌ Leave default passwords in production
- ❌ Include secrets in logs or error messages

### Production Checklist

Before deploying to production:

- [ ] All secrets are strong and unique
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` is specific (not `*`)
- [ ] Database uses SSL/TLS connection
- [ ] Redis uses password authentication
- [ ] Email domain is verified
- [ ] `SETUP_KEY` is removed or changed after setup
- [ ] All `.env` files are in `.gitignore`
- [ ] Secrets are stored in secure vault
- [ ] Backup procedures are in place

---

## Example Configurations

### Development (.env.development)

```env
# Ports
PORT=5001
VITE_APP_PORT=5002
VITE_WEB_PORT=5003

# Database
DATABASE_URL="postgresql://dental:dev_password@localhost:5432/dental_dev?schema=public"
POSTGRES_DB=dental_dev
POSTGRES_USER=dental
POSTGRES_PASSWORD=dev_password
POSTGRES_PORT=5432

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_PORT=6379

# JWT (development keys - DO NOT use in production)
JWT_SECRET="dev-jwt-secret-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
JWT_ACCESS_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Setup
SETUP_KEY="dev-setup-key-12345"

# Email
RESEND_API_KEY="re_dev_..."
EMAIL_FROM="Dev <onboarding@resend.dev>"

# Environment
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5002"
VITE_API_URL="http://localhost:5001"
```

### Production (.env.production)

```env
# Ports
PORT=5001
VITE_APP_PORT=5002
VITE_WEB_PORT=5003

# Database (use strong passwords from vault)
DATABASE_URL="postgresql://prod_user:STRONG_PASSWORD@db.internal:5432/dental_prod?schema=public&sslmode=require"
POSTGRES_DB=dental_prod
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=STRONG_PASSWORD
POSTGRES_PORT=5432

# Redis (use strong password from vault)
REDIS_URL="redis://:STRONG_REDIS_PASSWORD@redis.internal:6379"
REDIS_PASSWORD=STRONG_REDIS_PASSWORD
REDIS_PORT=6379

# JWT (use strong secrets from vault)
JWT_SECRET="production-jwt-secret-REPLACE_WITH_SECURE_RANDOM_STRING"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Setup (change after first setup or remove)
SETUP_KEY="production-setup-key-REPLACE_WITH_SECURE_RANDOM_STRING"

# Email
RESEND_API_KEY="re_prod_..."
EMAIL_FROM="Alveo System <noreply@yourdomain.com>"

# Environment
NODE_ENV="production"
CORS_ORIGIN="https://app.yourdomain.com"
VITE_API_URL="https://api.yourdomain.com"
```

---

## Troubleshooting

### Common Issues

**Database connection fails:**
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**Redis connection fails:**
```bash
# Verify REDIS_URL format
echo $REDIS_URL

# Test connection
redis-cli -u $REDIS_URL ping
```

**JWT errors:**
- Ensure `JWT_SECRET` is at least 32 characters
- Check for trailing spaces in `.env` file
- Verify `JWT_SECRET` is the same across all API instances

**Email not sending:**
- Verify `RESEND_API_KEY` is valid
- Check domain is verified in Resend dashboard (production)
- Ensure `EMAIL_FROM` matches verified domain

---

## Additional Resources

- [Installation Guide](./INSTALLATION.md)
- [Development Guide](./DEVELOPMENT.md)
- [API Documentation](./API.md)
- [Deployment Guide](./COOLIFY-DEPLOYMENT.md)

---

*Last updated: January 27, 2026*
