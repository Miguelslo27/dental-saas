#!/bin/bash
# Database restore script for Alveo System
# Usage: ./scripts/restore-database.sh <backup-file>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo "Usage: DATABASE_URL=postgresql://user:pass@host:5432/db $0 <backup-file>"
    echo ""
    echo "Examples:"
    echo "  $0 /var/backups/dental-saas/dental_20260127_120000.sql.gz"
    echo "  $0 backup.sql"
    exit 1
fi

BACKUP_FILE="$1"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL environment variable is not set${NC}"
    echo "Usage: DATABASE_URL=postgresql://user:pass@host:5432/db $0 <backup-file>"
    exit 1
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Display warning
echo -e "${RED}WARNING: This will OVERWRITE the current database!${NC}"
echo "Database: $DATABASE_URL"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

echo -e "${YELLOW}Starting database restore...${NC}"

# Restore based on file extension
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Decompressing and restoring from gzipped backup..."
    if gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database restored successfully${NC}"
    else
        echo -e "${RED}✗ Restore failed${NC}"
        exit 1
    fi
else
    echo "Restoring from plain SQL backup..."
    if psql "$DATABASE_URL" < "$BACKUP_FILE" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database restored successfully${NC}"
    else
        echo -e "${RED}✗ Restore failed${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}Restore process completed${NC}"
