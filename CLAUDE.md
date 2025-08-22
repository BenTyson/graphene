# Graphene Production Control System - Claude Agent Guide

## Project Overview
A full-stack web application for tracking the complete production journey of materials from biochar to graphene to BET surface area testing. Built with Node.js, Express, PostgreSQL, Prisma ORM, and Alpine.js.

## Critical Commands
Always run these commands after making code changes:
```bash
# Development server
npm run dev

# Lint checking (if available)
npm run lint

# Type checking (if available) 
npm run typecheck

# Database backup (HIGHLY RECOMMENDED before schema changes)
npm run backup:create
```

## Database Backup & Recovery

**CRITICAL**: Always backup before any database schema changes, migrations, or major development work.

### Quick Backup Commands
```bash
# Create manual backup
npm run backup:create

# List available backups
npm run backup:list

# Restore from backup (interactive selection)
npm run backup:restore

# Restore specific backup file
npm run backup:restore graphene_backup_2024-01-15T10-30-00.sql

# Clean up old backups (keeps last 10)
npm run backup:cleanup
```

### Setup Automated Daily Backups
```bash
# One-time setup for daily automated backups at 2:00 AM
./scripts/setup-auto-backup.sh
```

### Backup System Details
- **Storage**: `./backups/` directory (excluded from git)
- **Format**: PostgreSQL custom format (.sql files)
- **Retention**: Automatically keeps last 10 backups
- **Size**: Compressed format for efficient storage
- **Security**: Uses existing database credentials from .env
- **Logging**: Cron jobs logged to `./logs/backup-cron.log`

## Architecture

### Technology Stack
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL
- **Frontend**: Alpine.js, Tailwind CSS
- **Build Tools**: Vite
- **Ports**: Frontend 5174, Backend 3000

### Project Structure
```
/graphene
├── server/
│   ├── index.js           # Express server entry point
│   ├── routes/
│   │   ├── biochar.js      # Biochar CRUD + /api/biochar/:experimentNumber/related
│   │   ├── graphene.js     # Graphene CRUD + /api/graphene/:experimentNumber/related  
│   │   └── bet.js          # BET test CRUD
│   └── middleware/
├── client/
│   ├── index.html          # Main UI with Alpine.js templates
│   ├── src/
│   │   ├── js/
│   │   │   ├── app-refactored.js    # Main Alpine.js application
│   │   │   ├── services/api.js      # API client
│   │   │   └── utils/               # Formatters, validators, helpers
│   │   └── styles/main.css          # Tailwind CSS
├── scripts/
│   ├── backup-db.js        # Database backup utility
│   ├── restore-db.js       # Database restore utility
│   └── setup-auto-backup.sh # Automated backup setup
├── prisma/
│   └── schema.prisma       # Database schema
├── uploads/
│   └── sem-reports/        # SEM PDF storage
├── backups/                # Database backups (gitignored)
└── vite.config.js          # Vite dev server with proxy for /api and /uploads
```

## Database Schema Key Points

### Graphene Model Updates
- **Second Base Support**: Added `base2Amount`, `base2Type`, `base2Concentration` fields
- **SEM Reports**: `semReportPath` links to PDF files in `/uploads/sem-reports/`
- **Biochar Source**: Can be individual experiment, lot number, or "Various" (no reference)

### Important Relationships
- Biochar ↔ Graphene: Via `biocharExperiment` (direct) or `biocharLotNumber` (lot-based)
- Graphene → BET: Via `grapheneSample` field
- Files use soft references (experiment numbers) not hard foreign keys for flexibility

## UI Design Principles
- **Monochrome styling** with minimal color accents
- **Light blue (#EBF8FF)** reserved for lot-related records
- **Clean SVG icons** instead of emojis
- **Compact table layouts** with nested headers
- **Professional appearance** suitable for laboratory use
- **No unnecessary comments in code**

## Core Features

### Material Journey Tracking
- Click experiment numbers to expand rows showing complete material pipeline
- Biochar → Graphene → BET test relationships visible inline
- Expandable rows use `<tbody>` wrapper for Alpine.js compatibility

### File Management
- **SEM PDFs**: Upload, view, replace, or remove PDF reports for graphene records
- **Vite Proxy**: `/uploads` proxied to backend for PDF serving
- **Automatic cleanup**: Files deleted when records removed

### Data Entry Optimization
- **Copy/Duplicate**: Clone records with auto-incremented test order
- **Dropdown Management**: Dynamic addition of new options
- **Base Types**: KOH, NaOH (supports dual base experiments)
- **Appearance Tags**: Multiple selectable tags for graphene characterization

## Common Issues & Solutions

### Alpine.js Multiple Rows in Template
**Problem**: Can't have multiple `<tr>` elements in single `x-for` template
**Solution**: Wrap related rows in `<tbody>` element
```html
<!-- ✅ Correct - Each record gets its own tbody -->
<template x-for="record in records">
  <tbody>
    <tr>Main row</tr>
    <tr x-show="expanded">Expandable row</tr>
  </tbody>
</template>
```

### Alpine.js Reactivity
**Problem**: Direct object property assignment doesn't trigger updates
**Solution**: Use spread operator for reactive updates
```javascript
// ❌ Wrong - Won't trigger reactivity
this.expandedRows[id] = true;

// ✅ Correct - Triggers reactivity
this.expandedRows = { ...this.expandedRows, [id]: true };

// ✅ Also need $nextTick for forced re-render
await this.$nextTick();
```

### Null Safety in Templates
**Problem**: Accessing undefined nested properties causes console errors
**Solution**: Use null checks and fallback arrays
```html
<!-- Safe iteration with fallback -->
<template x-for="item in (data && data.items) || []">

<!-- Safe property access with && chains -->
<div x-show="data && data.property && data.property.length > 0">
```

### Data Type Conversion
**Problem**: FormData sends all values as strings, Prisma expects proper types
**Solution**: Convert numeric fields in API routes before database operations
```javascript
// In routes (biochar.js, graphene.js, bet.js)
const numericFields = ['testOrder', 'quantity', 'output'];
numericFields.forEach(field => {
  if (data[field] !== undefined && data[field] !== '') {
    data[field] = parseFloat(data[field]);
  } else {
    data[field] = null;
  }
});

// Remove UI-only fields before Prisma operations
delete data.biocharSource;  // UI field for source selection
delete data.dateUnknown;    // UI checkbox
delete data.semReportFile;  // File object
```

### Temperature Rate Input
**Problem**: Users need to enter ranges like "20-27"
**Solution**: Use `type="text"` instead of `type="number"` for tempRate field

## API Endpoints

### Biochar
- `GET /api/biochar` - List all with filters (default sort: desc)
- `GET /api/biochar/:experimentNumber/related` - Get downstream graphene & BET data
- `POST /api/biochar` - Create new record
- `PUT /api/biochar/:id` - Update record
- `DELETE /api/biochar/:id` - Delete record
- `GET /api/biochar/export/csv` - Export to CSV
- `POST /api/biochar/combine-lots` - Combine experiments into lot
- `GET /api/biochar/lots` - Get available lots

### Graphene  
- `GET /api/graphene` - List all with filters (default sort: desc)
- `GET /api/graphene/:experimentNumber/related` - Get upstream biochar & downstream BET data
- `POST /api/graphene` - Create new record (supports SEM PDF upload)
- `PUT /api/graphene/:id` - Update record (supports SEM PDF upload)
- `DELETE /api/graphene/:id` - Delete record
- `GET /api/graphene/export/csv` - Export to CSV

### BET
- `GET /api/bet` - List all with filters (default sort: desc)
- `POST /api/bet` - Create new record
- `PUT /api/bet/:id` - Update record
- `DELETE /api/bet/:id` - Delete record
- `GET /api/bet/export/csv` - Export to CSV

## Code Style Guidelines

1. **No unnecessary comments** - Code should be self-documenting
2. **Consistent formatting** - Follow existing patterns in codebase
3. **Error handling** - Always use try/catch blocks in async functions
4. **Null safety** - Handle null/undefined values gracefully
5. **Type conversion** - Convert FormData strings to proper types
6. **Reactivity** - Use spread operators for Alpine.js state updates
7. **UI feedback** - Show loading states during async operations

## Testing Approach

1. **Check for test scripts**: Look in package.json for test commands
2. **Run linting**: Execute `npm run lint` if available
3. **Type checking**: Run `npm run typecheck` if configured
4. **Manual testing**: Test CRUD operations and journey tracking features
5. **Console monitoring**: Check browser console for errors (should be none)

## Development Workflow

1. **Start dev server**: `npm run dev`
2. **Access application**: http://localhost:5174
3. **Database migrations**: `npx prisma migrate dev` after schema changes
4. **Generate Prisma client**: `npx prisma generate` after schema changes
5. **View database**: `npx prisma studio` for GUI database viewer

## Important Implementation Details

### Time Units
- **Biochar**: Time stored in HOURS
- **Graphene**: Time stored in MINUTES
- Different units maintained for scientific accuracy

### Default Values & Constants
- **Research Team**: "Curia - Germany"
- **Sort Order**: DESC (newest first)
- **Drying Pressure**: "atm. Pressure" 
- **Time Units**: Biochar (hours), Graphene (minutes)
- **Base Types**: KOH, NaOH
- **Appearance Tags**: Shiny, Somewhat Shiny, Barely Shiny, Black, Black/Grey, Grey, Voluminous, Very Voluminous, Brittle

### Data Constraints
- **Experiment numbers**: Unique per table
- **Lot numbers**: Unique in BiocharLot table
- **SEM Reports**: PDF only, max 10MB
- **Scientific Notation**: BET values support format like 1.520e3


## Quick Debugging Reference

**Alpine.js State**: `Alpine.$data(document.querySelector('[x-data]'))`
**Common Errors**:
- "Cannot read properties of undefined" → Add null checks with `?.`
- "Expected Int, provided String" → Check numeric field conversion in routes
- Template not updating → Use spread operator: `this.state = {...this.state, key: value}`
- Multiple `<tr>` in template → Wrap in `<tbody>`