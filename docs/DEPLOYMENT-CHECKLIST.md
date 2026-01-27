# Deployment Checklist - Alveo System

Complete checklist for deploying to production with Coolify.

## Pre-Deployment

### 1. Environment Variables

- [ ] Generate all secure secrets:
  ```bash
  # Database password
  openssl rand -base64 32

  # Redis password
  openssl rand -base64 32

  # JWT secret (64 chars)
  openssl rand -hex 32

  # Setup key (32 chars)
  openssl rand -hex 16
  ```

- [ ] Create `.env.production` file with all variables
- [ ] Validate environment configuration:
  ```bash
  ./scripts/validate-env.sh .env.production
  ```
- [ ] Ensure NO default/placeholder values remain
- [ ] Verify `CORS_ORIGIN` matches frontend domain exactly
- [ ] Verify `VITE_API_URL` is set to API domain

### 2. DNS Configuration

- [ ] Frontend domain A record: `yourdomain.com` → Server IP
- [ ] API domain A record: `api.yourdomain.com` → Server IP
- [ ] Landing domain A record (if different): `www.yourdomain.com` → Server IP
- [ ] Wait for DNS propagation (check with `dig yourdomain.com`)

### 3. Email Service (Optional but Recommended)

- [ ] Create Resend account at https://resend.com
- [ ] Verify your domain in Resend dashboard
- [ ] Generate API key
- [ ] Add to environment: `RESEND_API_KEY` and `EMAIL_FROM`

## Coolify Setup

### 4. Create Project

- [ ] Login to Coolify
- [ ] Create new project: "dental-saas"
- [ ] Note project ID for reference

### 5. Add Docker Compose Resource

- [ ] Click "New Resource" → "Docker Compose"
- [ ] Source: GitHub
- [ ] Repository: `dental-saas`
- [ ] Branch: `main`
- [ ] Docker Compose file: `docker-compose.yml` (default)

### 6. Configure Environment Variables

Go to **Environment Variables** tab and add:

**Database:**
- [ ] `POSTGRES_DB=dental_saas`
- [ ] `POSTGRES_USER=dental`
- [ ] `POSTGRES_PASSWORD=<your-generated-password>`

**Redis:**
- [ ] `REDIS_PASSWORD=<your-generated-password>`

**JWT:**
- [ ] `JWT_SECRET=<your-generated-secret>`
- [ ] `JWT_ACCESS_EXPIRES_IN=15m`
- [ ] `JWT_REFRESH_EXPIRES_IN=7d`

**Setup:**
- [ ] `SETUP_KEY=<your-generated-key>`

**CORS & API:**
- [ ] `CORS_ORIGIN=https://yourdomain.com` (no trailing slash)
- [ ] `VITE_API_URL=https://api.yourdomain.com` (no trailing slash)

**Email (Optional):**
- [ ] `RESEND_API_KEY=<your-api-key>`
- [ ] `EMAIL_FROM=Alveo System <noreply@yourdomain.com>`

### 7. Initial Build

- [ ] Click **Deploy**
- [ ] Wait for build to complete (5-10 minutes)
- [ ] Check build logs for errors
- [ ] Verify all services are running

### 8. Configure Domains

For each service:

**Web Service (Frontend App):**
- [ ] Go to Services → `app`
- [ ] Add domain: `yourdomain.com`
- [ ] Port: `8080`
- [ ] Enable **Generate Let's Encrypt Certificate**
- [ ] Wait for SSL certificate to be issued
- [ ] Enable **Force HTTPS redirect**

**API Service:**
- [ ] Go to Services → `api`
- [ ] Add domain: `api.yourdomain.com`
- [ ] Port: `5001`
- [ ] Enable **Generate Let's Encrypt Certificate**
- [ ] Wait for SSL certificate to be issued
- [ ] Enable **Force HTTPS redirect**

**Landing Page (if using):**
- [ ] Go to Services → `web`
- [ ] Add domain: `www.yourdomain.com` or `yourdomain.com`
- [ ] Port: `8080`
- [ ] Enable SSL and Force HTTPS

### 9. Post-Deployment Hook

⚠️ **CRITICAL** - Prevents 504 Gateway Timeout issues:

- [ ] Go to **Advanced → Deployment**
- [ ] In **Post Deployment Command**, enter:
  ```bash
  docker restart coolify-proxy
  ```
- [ ] Click **Save**

### 10. Redeploy

- [ ] Click **Redeploy** to apply domain configuration
- [ ] Wait for all services to be healthy
- [ ] Monitor logs for any errors

## Post-Deployment Verification

### 11. Service Health

- [ ] All containers showing "Running" status
- [ ] No restart loops (restart count = 0 or 1)
- [ ] PostgreSQL healthcheck passing (green)
- [ ] Redis healthcheck passing (green)

### 12. API Verification

- [ ] Test health endpoint:
  ```bash
  curl https://api.yourdomain.com/api/health
  # Should return: {"status":"ok","timestamp":"..."}
  ```
- [ ] Check API logs for successful migration
- [ ] Verify no connection errors in logs
- [ ] Test CORS (open frontend and check Network tab)

### 13. Frontend Verification

- [ ] Visit `https://yourdomain.com`
- [ ] Page loads without errors (check browser console)
- [ ] No CORS errors in console
- [ ] API calls working (check Network tab)
- [ ] Try navigating between pages
- [ ] Check mobile responsiveness

### 14. SSL/HTTPS Verification

- [ ] Green padlock in browser for all domains
- [ ] HTTP redirects to HTTPS automatically
- [ ] No certificate warnings
- [ ] Check SSL rating: https://www.ssllabs.com/ssltest/

### 15. Create Super Admin

- [ ] Navigate to `https://api.yourdomain.com/api/v1/admin/setup`
- [ ] Use the `SETUP_KEY` from your environment variables
- [ ] Create super admin account:
  ```bash
  curl -X POST https://api.yourdomain.com/api/v1/admin/setup \
    -H "Content-Type: application/json" \
    -d '{
      "setupKey": "your-setup-key",
      "email": "admin@yourdomain.com",
      "password": "StrongPassword123!",
      "firstName": "Admin",
      "lastName": "User"
    }'
  ```
- [ ] Verify you can login at `https://yourdomain.com`
- [ ] **IMPORTANT**: After creating admin, change or remove `SETUP_KEY`

## Security Hardening

### 16. Post-Setup Security

- [ ] Remove or change `SETUP_KEY` environment variable
- [ ] Redeploy after changing `SETUP_KEY`
- [ ] Verify setup endpoint returns 403 after removal
- [ ] Enable 2FA for super admin (future feature)

### 17. Monitoring Setup

- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
  - Monitor: `https://api.yourdomain.com/api/health`
  - Monitor: `https://yourdomain.com`
- [ ] Configure Sentry for error tracking (optional)
- [ ] Set up log aggregation (optional)

### 18. Backup Configuration

- [ ] Configure automated database backups:
  ```bash
  # SSH into server
  ssh root@your-server-ip

  # Create backup script
  nano /opt/scripts/backup-dental.sh
  # Paste backup script from scripts/backup-database.sh

  # Make executable
  chmod +x /opt/scripts/backup-dental.sh

  # Add to crontab (daily at 2 AM)
  crontab -e
  # Add: 0 2 * * * /opt/scripts/backup-dental.sh
  ```
- [ ] Test backup script manually
- [ ] Verify backups are being created
- [ ] Document restore procedure

### 19. Performance Optimization

- [ ] Enable Redis persistence (already configured)
- [ ] Configure database connection pooling (Prisma default)
- [ ] Monitor container resource usage
- [ ] Set up CDN for static assets (optional)

## Maintenance

### 20. Regular Tasks

Create reminders for:

- [ ] **Weekly**: Check error logs
- [ ] **Weekly**: Monitor disk space usage
- [ ] **Monthly**: Review security updates
- [ ] **Monthly**: Test database restore procedure
- [ ] **Quarterly**: Rotate secrets (JWT_SECRET, etc.)
- [ ] **Quarterly**: Review and update SSL certificates (auto-renewed)

## Troubleshooting

If anything goes wrong, refer to:

- [Coolify Deployment Guide](./COOLIFY-DEPLOYMENT.md)
- [Coolify Troubleshooting](./COOLIFY-TROUBLESHOOTING.md)
- [Production Guide](./PRODUCTION.md)

### Common Issues Quick Reference

**504 Gateway Timeout:**
- Restart Coolify proxy: `docker restart coolify-proxy`
- Verify post-deployment hook is configured

**CORS Errors:**
- Check `CORS_ORIGIN` exactly matches frontend domain
- Redeploy API after changing

**Database Connection Failed:**
- Verify PostgreSQL container is healthy
- Check `DATABASE_URL` uses correct hostname: `postgres` (not `localhost`)

**Build Failures:**
- Check build logs for specific errors
- Verify environment variables are set correctly
- Ensure server has enough RAM (2GB minimum)

## Deployment Complete! 🎉

Your Alveo System is now live in production.

**Next Steps:**
1. Create your first tenant/clinic
2. Configure clinic settings
3. Add doctors and patients
4. Share access with team members

**Important Contacts:**
- Production URL: https://yourdomain.com
- API URL: https://api.yourdomain.com
- Support: [support@yourdomain.com]

---

*Last updated: January 27, 2026*
