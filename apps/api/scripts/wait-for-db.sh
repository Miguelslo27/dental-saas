#!/bin/sh
# wait-for-db.sh - Wait for PostgreSQL to be ready before running migrations
set -e

MAX_RETRIES=30
RETRY_COUNT=0

echo "Waiting for PostgreSQL..."

# Node.js script to check PostgreSQL connectivity
check_connection() {
  node -e "
    try {
      if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
      }
      const url = new URL(process.env.DATABASE_URL);
      const net = require('net');
      const port = url.port ? parseInt(url.port, 10) || 5432 : 5432;
      const s = new net.Socket();
      s.setTimeout(1000);
      s.on('connect', () => { s.destroy(); process.exit(0); });
      s.on('error', (err) => { console.error('PostgreSQL connection error:', err.message); s.destroy(); process.exit(1); });
      s.on('timeout', () => { console.error('PostgreSQL connection timeout'); s.destroy(); process.exit(1); });
      s.connect(port, url.hostname);
    } catch (err) {
      console.error('Invalid DATABASE_URL:', err.message);
      process.exit(1);
    }
  "
}

# Retry loop
until check_connection 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "Failed to connect to PostgreSQL after $MAX_RETRIES seconds"
    exit 1
  fi
  echo "Attempt $RETRY_COUNT/$MAX_RETRIES - PostgreSQL not ready, waiting..."
  sleep 1
done

echo "PostgreSQL is ready!"

# Run migrations
cd /app/packages/database
./node_modules/.bin/prisma migrate deploy

# Start the API
cd /app/apps/api
exec node dist/index.js
