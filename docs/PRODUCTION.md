# Production Deployment Guide

Complete guide for deploying the Alveo System to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [SSL/HTTPS Configuration](#sslhttps-configuration)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Backup and Restore](#backup-and-restore)
- [Monitoring and Logging](#monitoring-and-logging)
- [Error Tracking](#error-tracking)
- [Security Checklist](#security-checklist)
- [Deployment Options](#deployment-options)

---

## Prerequisites

Before deploying to production:

- [ ] Domain name registered and DNS configured
- [ ] SSL certificate obtained (Let's Encrypt recommended)
- [ ] Production database (PostgreSQL 14+)
- [ ] Redis instance for caching
- [ ] Email service configured (Resend account)
- [ ] All environment variables prepared

---

## SSL/HTTPS Configuration

### Using Coolify (Recommended)

Coolify automatically handles SSL certificates via Let's Encrypt:

1. **Configure domain in Coolify:**
   - Go to your application settings
   - Add your domain (e.g., `app.yourdomain.com`)
   - Enable "Generate Let's Encrypt Certificate"
   - Coolify will automatically:
     - Generate SSL certificate
     - Configure Traefik reverse proxy
     - Handle certificate renewal

2. **DNS Configuration:**
   ```
   Type: A Record
   Name: app (or @)
   Value: Your server IP
   TTL: 3600
   ```

3. **Verify SSL:**
   ```bash
   curl -I https://app.yourdomain.com
   # Should show: HTTP/2 200
   ```

### Using Nginx (Manual Setup)

If deploying manually with Nginx:

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain SSL certificate:**
   ```bash
   sudo certbot --nginx -d app.yourdomain.com -d api.yourdomain.com
   ```

3. **Nginx configuration:**
   ```nginx
   # /etc/nginx/sites-available/dental-saas

   # API
   server {
       listen 80;
       server_name api.yourdomain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name api.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
       ssl_prefer_server_ciphers on;

       location / {
           proxy_pass http://localhost:5001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }

   # App (Frontend)
   server {
       listen 80;
       server_name app.yourdomain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name app.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/app.yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/app.yourdomain.com/privkey.pem;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;

       root /var/www/dental-saas/app/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Enable gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

4. **Enable and test:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/dental-saas /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Auto-renewal:**
   ```bash
   # Test renewal
   sudo certbot renew --dry-run

   # Certbot automatically sets up a cron job for renewal
   ```

---

## Environment Variables

### Critical Production Variables

**NEVER use default/preview values in production!**

```env
# Application
NODE_ENV=production
PORT=5001
VITE_API_URL=https://api.yourdomain.com

# Database (use strong password from vault)
DATABASE_URL=postgresql://prod_user:STRONG_PASSWORD@db.internal:5432/dental_prod?schema=public&sslmode=require
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=STRONG_PASSWORD
POSTGRES_DB=dental_prod

# Redis (use strong password from vault)
REDIS_URL=redis://:STRONG_REDIS_PASSWORD@redis.internal:6379
REDIS_PASSWORD=STRONG_REDIS_PASSWORD

# JWT (generate unique secrets)
JWT_SECRET=production-jwt-secret-REPLACE_WITH_64_CHAR_RANDOM_STRING
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Super Admin Setup
SETUP_KEY=production-setup-key-REPLACE_WITH_32_CHAR_RANDOM_STRING

# Email
RESEND_API_KEY=re_prod_xxxxxxxxxxxxx
EMAIL_FROM=Alveo System <noreply@yourdomain.com>

# CORS (MUST match frontend URL exactly)
CORS_ORIGIN=https://app.yourdomain.com

# Frontend
VITE_APP_URL=https://app.yourdomain.com
```

### Generate Secure Secrets

```bash
# JWT_SECRET (64 characters)
openssl rand -hex 32

# SETUP_KEY (32 characters)
openssl rand -hex 16

# Database password (32 characters, base64)
openssl rand -base64 32

# Redis password (32 characters, base64)
openssl rand -base64 32
```

---

## Database Setup

### 1. Production PostgreSQL

**Recommended: Managed database service** (AWS RDS, DigitalOcean, or similar)

**Requirements:**
- PostgreSQL 14 or higher
- SSL/TLS enabled
- Automated backups
- Point-in-time recovery
- Sufficient storage (50GB+ recommended)

**Connection string format:**
```
postgresql://username:password@host:5432/database?schema=public&sslmode=require
```

### 2. Run Migrations

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://prod_user:password@host:5432/dental_prod?schema=public&sslmode=require"

# Run migrations
pnpm --filter @dental/database db:migrate
```

### 3. Create Super Admin

```bash
curl -X POST https://api.yourdomain.com/api/v1/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "setupKey": "your-production-setup-key",
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

**IMPORTANT:** After creating the super admin, either:
- Remove `SETUP_KEY` from environment variables, OR
- Change it to a new random value

---

## Backup and Restore

### Automated Backups

#### PostgreSQL Backups

**Daily backup script:**
```bash
#!/bin/bash
# /opt/scripts/backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/dental-saas"
DATABASE_URL="postgresql://prod_user:password@localhost:5432/dental_prod"

mkdir -p $BACKUP_DIR

# Create backup
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/dental_$DATE.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "dental_*.sql.gz" -mtime +30 -delete

echo "Backup completed: dental_$DATE.sql.gz"
```

**Setup cron job:**
```bash
# Run daily at 2 AM
0 2 * * * /opt/scripts/backup-database.sh >> /var/log/dental-backup.log 2>&1
```

#### Redis Backups

Redis automatically creates snapshots (AOF/RDB). Ensure persistence is enabled:

```bash
# In docker-compose.yml
command:
  - redis-server
  - --requirepass
  - ${REDIS_PASSWORD}
  - --appendonly
  - yes
  - --appendfsync
  - everysec
```

Backup Redis data directory:
```bash
cp -r /var/lib/docker/volumes/dental-saas_redis_data /var/backups/redis/
```

### Manual Backup

```bash
# Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Backup with compression
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore Database

```bash
# From plain SQL file
psql $DATABASE_URL < backup.sql

# From gzipped file
gunzip -c backup.sql.gz | psql $DATABASE_URL
```

---

## Monitoring and Logging

### Health Checks

The API provides health check endpoints:

```bash
# Basic health check
curl https://api.yourdomain.com/api/health

# Response:
{
  "status": "ok",
  "timestamp": "2026-01-27T12:00:00.000Z"
}
```

### Application Logs

**View API logs:**
```bash
# Docker logs
docker logs -f dental-saas-api-1

# Coolify logs
# Available in Coolify dashboard
```

**Log rotation** (if not using Docker):
```bash
# /etc/logrotate.d/dental-saas
/var/log/dental-saas/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### Monitoring Tools

**Recommended monitoring solutions:**

1. **Uptime monitoring:**
   - [UptimeRobot](https://uptimerobot.com/) (free)
   - [Pingdom](https://www.pingdom.com/)
   - [StatusCake](https://www.statuscake.com/)

2. **Application monitoring:**
   - [Sentry](https://sentry.io/) - Error tracking (see below)
   - [New Relic](https://newrelic.com/)
   - [Datadog](https://www.datadoghq.com/)

3. **Infrastructure monitoring:**
   - [Prometheus + Grafana](https://prometheus.io/)
   - [Netdata](https://www.netdata.cloud/)

---

## Error Tracking

### Sentry Integration

1. **Create Sentry account:**
   - Sign up at [sentry.io](https://sentry.io/)
   - Create new project (Node.js)
   - Get DSN (Data Source Name)

2. **Install Sentry SDK:**
   ```bash
   pnpm --filter @dental/api add @sentry/node @sentry/profiling-node
   ```

3. **Configure Sentry in API:**
   ```typescript
   // apps/api/src/index.ts
   import * as Sentry from '@sentry/node'
   import { nodeProfilingIntegration } from '@sentry/profiling-node'

   if (process.env.NODE_ENV === 'production') {
     Sentry.init({
       dsn: process.env.SENTRY_DSN,
       environment: process.env.NODE_ENV,
       integrations: [
         nodeProfilingIntegration(),
       ],
       tracesSampleRate: 1.0,
       profilesSampleRate: 1.0,
     })
   }

   // Add Sentry error handler
   app.use(Sentry.Handlers.errorHandler())
   ```

4. **Add environment variable:**
   ```env
   SENTRY_DSN=https://xxxxxxxxxxxxx@sentry.io/xxxxxxx
   ```

5. **Frontend Sentry:**
   ```bash
   pnpm --filter @dental/app add @sentry/react
   ```

   ```typescript
   // apps/app/src/main.tsx
   import * as Sentry from '@sentry/react'

   if (import.meta.env.PROD) {
     Sentry.init({
       dsn: import.meta.env.VITE_SENTRY_DSN,
       integrations: [
         Sentry.browserTracingIntegration(),
       ],
       tracesSampleRate: 1.0,
     })
   }
   ```

---

## Security Checklist

Before going live, verify:

### Application Security
- [ ] All secrets are strong and unique (32+ characters)
- [ ] `NODE_ENV=production` is set
- [ ] `CORS_ORIGIN` is specific (not `*`)
- [ ] SSL/HTTPS is enabled and working
- [ ] Database uses SSL/TLS connections
- [ ] Redis uses password authentication
- [ ] Email domain is verified
- [ ] `SETUP_KEY` is changed after creating super admin

### Infrastructure Security
- [ ] Firewall configured (allow only 80, 443, SSH)
- [ ] SSH key authentication (disable password login)
- [ ] Fail2ban installed and configured
- [ ] Regular security updates enabled
- [ ] Backups are encrypted and off-site
- [ ] Monitoring and alerting configured

### Code Security
- [ ] No secrets in repository
- [ ] `.env` is in `.gitignore`
- [ ] Input validation with Zod
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection (React escaping)
- [ ] CSRF protection
- [ ] Rate limiting enabled
- [ ] Security headers configured

### Compliance
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent implemented (if required)
- [ ] GDPR compliance (if EU users)
- [ ] Data retention policy defined

---

## Deployment Options

### Option 1: Coolify (Recommended)

See [COOLIFY-DEPLOYMENT.md](./COOLIFY-DEPLOYMENT.md) for complete guide.

**Advantages:**
- Automated SSL with Let's Encrypt
- Built-in reverse proxy (Traefik)
- Easy environment variable management
- One-click deployments
- Built-in monitoring

### Option 2: Docker Compose

1. **Prepare server:**
   ```bash
   # Install Docker and Docker Compose
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```

2. **Clone repository:**
   ```bash
   git clone https://github.com/Miguelslo27/dental-saas.git
   cd dental-saas
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   nano .env
   ```

4. **Deploy:**
   ```bash
   docker compose build
   docker compose up -d
   ```

5. **Configure reverse proxy** (Nginx/Caddy) for SSL

### Option 3: Kubernetes

For high-scale deployments, consider Kubernetes:
- Use Helm charts for deployment
- Configure ingress for SSL termination
- Set up horizontal pod autoscaling
- Use managed databases (AWS RDS, etc.)

---

## Performance Optimization

### Database
- [ ] Add indexes on frequently queried columns
- [ ] Enable connection pooling (Prisma default)
- [ ] Configure PostgreSQL for production workload
- [ ] Monitor slow queries

### Redis
- [ ] Configure memory limits
- [ ] Enable persistence (AOF)
- [ ] Set appropriate eviction policy
- [ ] Monitor memory usage

### Application
- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Optimize images (WebP format)
- [ ] Implement request rate limiting
- [ ] Cache API responses where appropriate

---

## Troubleshooting

### Application won't start

```bash
# Check logs
docker compose logs api

# Common issues:
# - Database connection failure: verify DATABASE_URL
# - Redis connection failure: verify REDIS_URL
# - Missing environment variables: check .env file
```

### Database migration errors

```bash
# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# Manual migration
pnpm --filter @dental/database db:migrate
```

### SSL certificate issues

```bash
# Verify certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Renew certificate
sudo certbot renew

# Check Certbot logs
sudo cat /var/log/letsencrypt/letsencrypt.log
```

---

## Additional Resources

- [Installation Guide](./INSTALLATION.md)
- [Environment Variables](./ENVIRONMENT.md)
- [Development Guide](./DEVELOPMENT.md)
- [API Documentation](./API.md)
- [Coolify Deployment](./COOLIFY-DEPLOYMENT.md)

---

*Last updated: January 27, 2026*
