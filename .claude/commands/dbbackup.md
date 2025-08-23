---
description: Create a database backup to preserve current state
allowed-tools: Bash(npm run backup:*)
argument-hint: "[optional description]"
---

Create a database backup to preserve the current state of the Graphene production database.

This command will:
1. Create a timestamped backup file in the `backups/` directory
2. Display backup size and completion status  
3. Show list of recent backups for reference

The backup includes all:
- Biochar experiments and lots
- Graphene production records
- BET, Conductivity, and RAMAN test results
- SEM and Update report associations
- Complete relational data with foreign keys

**Usage:**
- `#dbbackup` - Create backup with default timestamp
- `#dbbackup "before schema changes"` - Create backup with description (saved in filename)

**Critical for:**
- Before database schema migrations
- Before major data imports/changes
- Before system updates or maintenance
- Daily development checkpoints

!npm run backup:create