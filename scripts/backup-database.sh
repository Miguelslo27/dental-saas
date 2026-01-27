#!/bin/bash
# Automated database backup script for Alveo System
# Usage: ./scripts/backup-database.sh

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/dental-saas}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="dental_${DATE}.sql.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL environment variable is not set${NC}"
    echo "Usage: DATABASE_URL=postgresql://user:pass@host:5432/db $0"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Starting database backup...${NC}"
echo "Backup directory: $BACKUP_DIR"
echo "Backup file: $BACKUP_FILE"
echo "Retention: $RETENTION_DAYS days"

# Create backup
if pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/$BACKUP_FILE"; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓ Backup completed successfully${NC}"
    echo "  File: $BACKUP_FILE"
    echo "  Size: $BACKUP_SIZE"
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi

# Remove old backups
echo -e "${YELLOW}Cleaning up old backups...${NC}"
DELETED_COUNT=$(find "$BACKUP_DIR" -name "dental_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ "$DELETED_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Removed $DELETED_COUNT old backup(s)${NC}"
else
    echo "  No old backups to remove"
fi

# List recent backups
echo -e "${YELLOW}Recent backups:${NC}"
ls -lht "$BACKUP_DIR"/dental_*.sql.gz | head -n 5

echo -e "${GREEN}Backup process completed${NC}"
