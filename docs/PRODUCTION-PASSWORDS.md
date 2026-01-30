# Production Password Policy

## Requirements

**Use alphanumeric passwords only** (letters and numbers, no special characters).

This avoids URL encoding issues when passwords are embedded in connection strings like:
```
postgresql://user:password@host:5432/database
redis://:password@host:6379
```

## Why No Special Characters?

Connection strings are parsed as standard URLs per RFC 3986. Special characters like `/`, `+`, `=`, `@`, `:` have specific meanings in URLs and require percent-encoding.

**Example of the problem:**
```bash
# Password with special characters
PASSWORD="sn09/+aNa/gkRpY5CzJtPKuZ/bp9Lozh9WmpTQEZsL0="
DATABASE_URL="postgresql://user:${PASSWORD}@host:5432/db"

# Result: postgresql://user:sn09/+aNa/gkRpY5CzJtPKuZ/bp9Lozh9WmpTQEZsL0=@host:5432/db
# The URL parser sees the first / in the password and interprets it as a path separator
# This breaks the connection
```

**Solution:**
```bash
# Password with only alphanumeric characters
PASSWORD="tfywprIBxmUz9MBodICHIdqHAssAtJzs"
DATABASE_URL="postgresql://user:${PASSWORD}@host:5432/db"

# Result: postgresql://user:tfywprIBxmUz9MBodICHIdqHAssAtJzs@host:5432/db
# Works perfectly without any encoding needed
```

## Generating Passwords

### Using OpenSSL (recommended)
```bash
# Generate 32-character alphanumeric password
openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32
```

### Using Python
```python
import secrets
import string
alphabet = string.ascii_letters + string.digits
password = ''.join(secrets.choice(alphabet) for i in range(32))
print(password)
```

## Current Production Passwords

Passwords are stored in Coolify environment variables:
- `POSTGRES_PASSWORD` - PostgreSQL database password (alphanumeric, 32 chars)
- `REDIS_PASSWORD` - Redis password (alphanumeric, 32 chars)

**Security:** These passwords are only visible to users with Coolify admin access.

## Migration from Special Character Passwords

If you have existing passwords with special characters:

1. Generate new alphanumeric passwords
2. Update environment variables in Coolify
3. Recreate database volumes (data will be lost)
4. Run migrations
5. Or: Use password rotation during maintenance window

## Notes

- 32-character alphanumeric passwords provide excellent security (~190 bits of entropy)
- No URL encoding needed
- Compatible with all database clients and connection string parsers
- Simplifies deployment configuration
