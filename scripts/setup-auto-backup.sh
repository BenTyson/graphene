#!/bin/bash

# Automated Backup Setup Script
# Sets up a daily cron job to backup the GraphenDB database

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_TIME="${BACKUP_TIME:-02:00}"  # Default: 2:00 AM
LOG_FILE="$PROJECT_DIR/logs/backup-cron.log"

echo "🔧 Setting up automated database backups..."

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Create the cron job command
CRON_CMD="cd $PROJECT_DIR && npm run backup:auto >> $LOG_FILE 2>&1"

# Create a temporary cron file
TEMP_CRON=$(mktemp)

# Get existing crontab (if any) and filter out our backup job
crontab -l 2>/dev/null | grep -v "npm run backup:auto" > "$TEMP_CRON" || true

# Add our backup job
echo "0 2 * * * $CRON_CMD" >> "$TEMP_CRON"

# Install the new crontab
crontab "$TEMP_CRON"
rm "$TEMP_CRON"

echo "✅ Automated backup configured!"
echo "📅 Backups will run daily at $BACKUP_TIME"
echo "📁 Backups stored in: $PROJECT_DIR/backups/"
echo "📝 Logs written to: $LOG_FILE"
echo ""
echo "Commands:"
echo "  npm run backup:create  - Manual backup"
echo "  npm run backup:list    - List backups"
echo "  npm run backup:restore - Restore from backup"
echo ""
echo "To modify backup schedule:"
echo "  crontab -e"
echo ""
echo "To remove automated backups:"
echo "  crontab -l | grep -v 'npm run backup:auto' | crontab -"