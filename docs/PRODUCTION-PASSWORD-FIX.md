# Production Password Encoding Fix

## Problem

The API container was crash-looping because special characters in PostgreSQL and Redis passwords were not being URL-encoded when used in connection strings (`DATABASE_URL` and `REDIS_URL`).

### Root Cause

The docker-compose.yml was constructing connection URLs like:
```yaml
DATABASE_URL: postgresql://user:password@host:5432/db
```

When `password` contains special characters like `/`, `+`, or `=`, the URL parsing fails because these characters have special meaning in URLs:
- `/` separates URL path segments
- `+` represents a space in URL encoding
- `=` is used in query parameters

Example:
- Password: `sn09/+aNa/gkRpY5CzJtPKuZ/bp9Lozh9WmpTQEZsL0=`
- Invalid URL: `postgresql://dental_admin:sn09/+aNa/...@postgres:5432/dental_saas`
- The `/` and `+` characters break URL parsing

## Solution

We now use separate environment variables:
- `POSTGRES_PASSWORD` - Plain password for PostgreSQL container
- `POSTGRES_PASSWORD_ENCODED` - URL-encoded password for DATABASE_URL
- `REDIS_PASSWORD` - Plain password for Redis container
- `REDIS_PASSWORD_ENCODED` - URL-encoded password for REDIS_URL

## URL Encoding Reference

| Character | URL Encoded |
|-----------|-------------|
| `/`       | `%2F`       |
| `+`       | `%2B`       |
| `=`       | `%3D`       |
| `:`       | `%3A`       |
| `@`       | `%40`       |
| `?`       | `%3F`       |

## Migration Steps for Coolify

### 1. Add New Environment Variables

In Coolify UI, go to your AlveoDent application and add these two new environment variables:

**POSTGRES_PASSWORD_ENCODED**
```
sn09%2F%2BaNa%2FgkRpY5CzJtPKuZ%2Fbp9Lozh9WmpTQEZsL0%3D
```

**REDIS_PASSWORD_ENCODED**
```
w5Jwfsm3bQYp0LJ45E92yphjn5MpKwzd2A5wv7asOlU%3D
```

### 2. Keep Existing Variables Unchanged

Do NOT modify these existing variables - they are still needed:
- `POSTGRES_PASSWORD` (plain: `sn09/+aNa/gkRpY5CzJtPKuZ/bp9Lozh9WmpTQEZsL0=`)
- `REDIS_PASSWORD` (plain: `w5Jwfsm3bQYp0LJ45E92yphjn5MpKwzd2A5wv7asOlU=`)
- `POSTGRES_DB`
- `POSTGRES_USER`
- All other variables

### 3. Deploy Updated Code

After merging the PR that updates docker-compose.yml and adding the new environment variables in Coolify, trigger a new deployment.

### 4. Verify

After deployment:
```bash
# Check API logs - should not see "Failed to connect to PostgreSQL"
ssh root@alveodent.com "docker logs api-... --tail 50"

# API should be healthy
ssh root@alveodent.com "docker ps | grep api"
```

## For Future Deployments

When generating passwords for production:
1. Generate a strong random password (can contain any characters)
2. Create a URL-encoded version for use in connection strings
3. Set both versions in Coolify:
   - `*_PASSWORD` - plain version
   - `*_PASSWORD_ENCODED` - URL-encoded version

### Example Using Node.js

```javascript
const password = "my/complex+password=";
const encoded = encodeURIComponent(password);
console.log("Plain:", password);
console.log("Encoded:", encoded);
// Plain: my/complex+password=
// Encoded: my%2Fcomplex%2Bpassword%3D
```

### Example Using Bash

```bash
PASSWORD="my/complex+password="
ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$PASSWORD', safe=''))")
echo "Plain: $PASSWORD"
echo "Encoded: $ENCODED"
```
