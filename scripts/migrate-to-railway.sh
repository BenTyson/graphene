#!/bin/bash

# Database Migration Script for Railway
# Usage: ./scripts/migrate-to-railway.sh "DATABASE_URL"

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if DATABASE_URL is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide the Railway DATABASE_URL as an argument${NC}"
    echo "Usage: $0 \"postgresql://user:pass@host:port/database\""
    exit 1
fi

RAILWAY_DB_URL="$1"
LOCAL_BACKUP="backups/graphene_backup_2025-09-14T01-02-18.sql"

echo -e "${GREEN}🚀 Starting Railway Database Migration${NC}"
echo "📍 Local backup: $LOCAL_BACKUP"
echo "🎯 Target database: Railway PostgreSQL"
echo ""

# Step 1: Backup production database (optional but recommended)
echo -e "${YELLOW}Step 1: Backing up production database...${NC}"
PROD_BACKUP="backups/production_backup_$(date +%Y-%m-%d_%H-%M-%S).sql"
if pg_dump "$RAILWAY_DB_URL" -Fc > "$PROD_BACKUP" 2>/dev/null; then
    echo -e "${GREEN}✅ Production backup saved to: $PROD_BACKUP${NC}"
else
    echo -e "${YELLOW}⚠️  Could not backup production (might be empty or inaccessible)${NC}"
fi

# Step 2: Restore local backup to Railway
echo -e "${YELLOW}Step 2: Migrating data to Railway...${NC}"
echo "This may take a few minutes..."

# Try pg_restore first (for custom format backups)
if pg_restore --verbose --no-owner --no-acl --clean --if-exists \
    --dbname="$RAILWAY_DB_URL" \
    "$LOCAL_BACKUP" 2>/dev/null; then
    echo -e "${GREEN}✅ Data migration completed successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  pg_restore failed, trying alternative method...${NC}"
    
    # Convert to SQL and try again
    TEMP_SQL="temp_migration_$(date +%s).sql"
    pg_restore "$LOCAL_BACKUP" -f "$TEMP_SQL"
    
    if psql "$RAILWAY_DB_URL" < "$TEMP_SQL"; then
        echo -e "${GREEN}✅ Data migration completed using psql!${NC}"
    else
        echo -e "${RED}❌ Migration failed. Please check the error messages above.${NC}"
        rm -f "$TEMP_SQL"
        exit 1
    fi
    
    rm -f "$TEMP_SQL"
fi

# Step 3: Verify migration
echo -e "${YELLOW}Step 3: Verifying migration...${NC}"

VERIFY_QUERY="SELECT 'graphene' as table_name, COUNT(*) as count FROM graphene 
UNION ALL SELECT 'biochar', COUNT(*) FROM biochar 
UNION ALL SELECT 'bet', COUNT(*) FROM bet 
UNION ALL SELECT 'users', COUNT(*) FROM users;"

echo "Record counts in Railway database:"
psql "$RAILWAY_DB_URL" -c "$VERIFY_QUERY" 2>/dev/null || echo "Could not verify counts"

echo ""
echo -e "${GREEN}🎉 Migration process complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Check your Railway app to verify data appears correctly"
echo "2. Test login functionality"
echo "3. Verify filters and search work"
echo "4. Plan file migration strategy (872MB of uploads)"
echo ""
echo -e "${YELLOW}Note: File uploads are not migrated yet. PDFs and images will show as broken links until Phase 2.${NC}"