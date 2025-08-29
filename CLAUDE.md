# Graphene Production Control System - Claude Agent Guide

## Project Overview
A full-stack web application for tracking the complete production journey of materials from biochar to graphene to BET surface area testing, including comprehensive material shipment tracking. Built with Node.js, Express, PostgreSQL, Prisma ORM, and Alpine.js.

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

## Claude Code Slash Commands

### Database Backup Command
Use the `#dbbackup` slash command for quick database backups:

```
#dbbackup
```

This command automatically:
- Creates timestamped backup in `backups/` directory  
- Shows backup size and completion status
- Lists recent backups for reference
- **Critical before any schema changes or major development work**

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
│   │   ├── bet.js          # BET test CRUD
│   │   ├── conductivity.js # Conductivity test CRUD
│   │   ├── raman.js        # RAMAN test CRUD
│   │   ├── tem.js          # TEM test CRUD
│   │   ├── compoundBatch.js # Compound batch CRUD + experiment associations
│   │   ├── updateReports.js # Update report management + associations
│   │   ├── semReports.js   # SEM report management + associations
│   │   └── shipments.js    # Material shipment tracking + location management
│   └── middleware/
├── client/
│   ├── index.html          # Main UI with Alpine.js templates (3300+ lines)
│   ├── src/
│   │   ├── js/
│   │   │   ├── app-refactored.js    # Main Alpine.js application (1477 lines)
│   │   │   ├── services/api.js      # API client
│   │   │   ├── components/          # Reusable UI components (COMPLETE)
│   │   │   │   ├── modals/
│   │   │   │   │   ├── modalHelpers.js    # Dynamic modal generation
│   │   │   │   │   └── pdfViewerHelpers.js # PDF viewer modals
│   │   │   │   ├── forms/
│   │   │   │   │   ├── dateFieldHelpers.js    # Date fields with unknown checkbox
│   │   │   │   │   ├── selectFieldHelpers.js  # Select fields with "Add New"
│   │   │   │   │   ├── numericFieldHelpers.js # Numeric fields with units
│   │   │   │   │   └── fileFieldHelpers.js    # File upload fields
│   │   │   │   ├── dropdownSections/      # Expandable row components
│   │   │   │   │   ├── testResultsHelper.js   # BET/Conductivity/RAMAN/TEM test displays
│   │   │   │   │   ├── reportsHelper.js       # SEM and Update report sections
│   │   │   │   │   ├── sourceDataHelper.js    # Biochar source data display
│   │   │   │   │   ├── objectivesHelper.js    # Experiment objectives & compound batch info
│   │   │   │   │   └── shipmentsHelper.js     # Material shipment history display
│   │   │   │   └── tables/          # Table components (reserved for future)
│   │   │   └── utils/               # Formatters, validators, helpers
│   │   └── styles/main.css          # Tailwind CSS
├── scripts/
│   ├── backup-db.js        # Database backup utility
│   ├── restore-db.js       # Database restore utility
│   └── setup-auto-backup.sh # Automated backup setup
├── prisma/
│   └── schema.prisma       # Database schema
├── uploads/
│   ├── sem-reports/        # SEM PDF storage
│   ├── bet-reports/        # BET test PDF storage
│   ├── raman-reports/      # RAMAN test PDF storage
│   ├── tem-reports/        # TEM test PDF storage
│   └── update-reports/     # Weekly update report PDFs
├── backups/                # Database backups (gitignored)
└── vite.config.js          # Vite dev server with proxy for /api and /uploads
```

## Database Schema Key Points

### Graphene Model Updates
- **Title Note**: Added `titleNote` field for experiment annotations (e.g., "(Pilot Plant #1)", "(2% Water)")
- **Comments System**: Converted to dropdown with predefined options: "ground biochar (brown powder) NOT compacted", "ground biochar (brown powder) compacted to two pellets of equal size", "Rotating oven, powder not compacted"
- **Second Base Support**: Added `base2Amount`, `base2Type`, `base2Concentration` fields
- **SEM Reports**: `semReportPath` links to PDF files in `/uploads/sem-reports/`
- **Biochar Source**: Can be individual experiment, lot number, or "Various" (no reference)
- **Experiment Objectives**: 5 text fields for structured experiment documentation:
  - `objective` - Experiment goal
  - `experimentDetails` - Procedure details  
  - `result` - Experiment outcome
  - `conclusion` - Analysis
  - `recommendedAction` - Next steps
- **Update Report Associations**: Many-to-many relationship with weekly update reports
- **Compound Batch Associations**: Many-to-many relationship with compound batches for grouping experiments

### Compound Batch System
- **CompoundBatch Model**: Groups multiple graphene experiments into compound batches (e.g., "CB001", "CB002")
- **GrapheneCompoundBatch Junction**: Many-to-many relationship between graphene experiments and compound batches
- **Key Fields**: `batchNumber`, `batchName`, `description`, `createdDate`, `totalOutput`
- **Removed Fields**: `researchTeam` and `comments` fields removed for streamlined interface
- **Key Features**: 
  - Unique batch numbers with optional descriptive names
  - Tracks total output calculated from constituent experiments
  - Maintains full traceability to original experiments
  - Can be referenced by test results just like individual experiments
- **Use Case**: Combine existing graphene batches for downstream testing without losing original data

### Update Reports System
- **UpdateReport Model**: Stores weekly PDF reports with metadata (filename, description, week date)
- **GrapheneUpdateReport Junction**: Many-to-many relationship between graphene experiments and update reports
- **File Storage**: PDFs stored in `/uploads/update-reports/` with unique timestamped names
- **Associations**: Single report can be associated with multiple experiments; experiments can have multiple reports

### Testing Models

#### BET Tests
- **Purpose**: Track BET surface area measurements for graphene samples
- **Key Fields**: `mass`, `multipointBetArea`, `langmuirSurfaceArea`
- **Scientific Notation**: Surface area fields support format like 1.88e3, displayed as 1.88 × 10³
- **Mass Field**: Precise sample mass measurement in grams (Decimal 10,4 precision)
- **Testing Labs**: Fraunhofer-Institut
- **PDF Reports**: Stored in `/uploads/bet-reports/`
- **Relationship**: Links to Graphene via `grapheneSample` field OR CompoundBatch via `compoundBatchNumber` field
- **Dual Reference**: Can test either individual experiments or compound batches

#### Conductivity Tests
- **Purpose**: Track electrical conductivity measurements at different pressures
- **Key Fields**: `conductivity1kN`, `conductivity8kN`, `conductivity12kN`, `conductivity20kN`
- **Relationship**: Links to Graphene via `grapheneSample` field OR CompoundBatch via `compoundBatchNumber` field
- **Dual Reference**: Can test either individual experiments or compound batches

#### RAMAN Tests
- **Purpose**: Track RAMAN spectroscopy analysis with absorption band measurements
- **Matrix Structure**: 3×4 data matrix for absorption band analysis
  - **Rows**: Integration Range, Integral Typ A, Peak High Typ J
  - **Columns**: 2D Band, G Band, D Band, D/G Ratio
- **Data Storage**: 24 separate numeric fields for database analysis
  - Integration Range: Low/high pairs (e.g., `integrationRange2DLow`, `integrationRange2DHigh`)
  - Integral Typ A: Two values per band (e.g., `integralTypA2D1`, `integralTypA2D2`)
  - Peak High Typ J: Two values per band (e.g., `peakHighTypJ2D1`, `peakHighTypJ2D2`)
- **Display Format**: Combined values shown as "2791-2557" for ranges, "2581,228" for pairs
- **Testing Labs**: Fraunhofer-Institut, Clariant
- **PDF Reports**: Stored in `/uploads/raman-reports/`
- **Relationship**: Links to Graphene via `grapheneSample` field OR CompoundBatch via `compoundBatchNumber` field
- **Dual Reference**: Can test either individual experiments or compound batches

#### TEM Tests
- **Purpose**: Track Transmission Electron Microscopy analysis for graphene samples
- **Key Fields**: `testDate`, `grapheneSample`, `researchTeam`, `testingLab`, `temReportPath`, `comments`
- **Testing Labs**: Same dropdown data as other test types
- **PDF Reports**: Stored in `/uploads/tem-reports/` with 10MB file size limit
- **Relationship**: Links to Graphene via `grapheneSample` field OR CompoundBatch via `compoundBatchNumber` field
- **Dual Reference**: Can test either individual experiments or compound batches
- **Table Structure**: Simple test record with PDF report attachment capability

#### SEM Report Management
- **Purpose**: Centralized bulk upload and management of SEM PDF reports
- **SemReport Model**: Stores metadata (filename, originalName, filePath, reportDate)
- **Many-to-Many Relationships**: Single report can associate with multiple graphene experiments
- **GrapheneSemReport Junction**: Links SEM reports to graphene records via IDs
- **Bulk Upload**: Support for up to 10 PDF files simultaneously (10MB each max)
- **File Storage**: PDFs stored in `/uploads/sem-reports/` with unique timestamped names
- **Full Circle Integration**: 
  - Direct uploads through graphene modal create SemReport entries
  - All SEM reports appear in centralized SEM Reports table
  - Both direct and associated reports show in graphene row expansions
- **Table Display**: Sample #, Date, Species, PDF Name, Actions columns
- **Automatic Refresh**: SEM table updates when reports uploaded via graphene modal
- **Association Management**: Add/remove experiment associations post-upload
- **Backward Compatibility**: Maintains existing `semReportPath` field for direct uploads

### Important Relationships
- Biochar ↔ Graphene: Via `biocharExperiment` (direct) or `biocharLotNumber` (lot-based)
- Graphene → Tests: Via `grapheneSample` field (BET, Conductivity, RAMAN, TEM)
- CompoundBatch → Tests: Via `compoundBatchNumber` field (BET, Conductivity, RAMAN, TEM)
- Graphene ↔ CompoundBatch: Many-to-many via `GrapheneCompoundBatch` junction table
- Graphene ↔ Update Reports: Many-to-many via `GrapheneUpdateReport` junction table
- Graphene ↔ SEM Reports: Many-to-many via `GrapheneSemReport` junction table
- All test types include `researchTeam`, `testingLab`, and PDF report paths
- Files use soft references (experiment/batch numbers) not hard foreign keys for flexibility
- **Dual Testing Architecture**: Tests can reference either individual experiments OR compound batches

## UI Design Principles
- **Monochrome styling** with minimal color accents
- **Light blue (#EBF8FF)** reserved for lot-related records
- **Clean SVG icons** instead of emojis
- **Compact table layouts** with nested headers
- **Professional appearance** suitable for laboratory use
- **No unnecessary comments in code**

## Global Color System
- **CSS Custom Properties**: Centralized color management using CSS variables in `:root`
- **Primary Link Color**: `--link-primary: #B87333` (Bronze)
- **Hover State**: `--link-hover: #95611F` (Darker bronze)
- **Semantic Classes**: `.text-link`, `.text-link-hover`, `.bg-link`, `.bg-link-light`, etc.
- **Single Point Control**: Change all link colors by updating CSS variables only
- **Consistent Application**: All interactive elements use the same color system
- **Theme Flexibility**: Easy to implement theme variations or dark mode
- **Maintainability**: No hardcoded colors throughout HTML/JS codebase

## Core Features

### Material Journey Tracking
- Click experiment numbers to expand rows showing complete material pipeline
- Biochar → Graphene → BET/Conductivity/RAMAN test relationships visible inline
- Update reports, SEM PDFs, and test reports displayed in expandable sections
- Expandable rows use `<tbody>` wrapper for Alpine.js compatibility
- All PDF reports open in modal viewers with navigation controls

### File Management
- **SEM PDFs**: Upload, view, replace, or remove PDF reports for graphene records
- **BET Reports**: Upload, view, replace, or remove PDF reports for BET test records
- **RAMAN Reports**: Upload, view, replace, or remove PDF reports for RAMAN test records
- **TEM Reports**: Upload, view, replace, or remove PDF reports for TEM test records
- **Update Reports**: Weekly PDF reports with multi-experiment associations
- **Modal Viewers**: All PDFs open in fullscreen modals with iframe display
- **Vite Proxy**: `/uploads` proxied to backend for PDF serving
- **Automatic cleanup**: Files deleted when records removed

### Weekly Update Reports
- **Upload Once, Associate Many**: Single PDF can reference multiple experiments
- **Bi-directional Linking**: Assign reports to experiments or experiments to reports
- **Metadata Tracking**: Week dates, descriptions, upload timestamps
- **Inline PDF Viewing**: Click any report to view PDF with navigation controls
- **Search & Filter**: Find reports by filename, description, or associated experiments

### Compound Batch Management
- **Dedicated Management Tab**: Self-contained interface for all compound batch operations
- **In-Modal Experiment Selection**: Search and select experiments directly within creation modal
- **Interactive Search**: Find experiments by number, species, date, or biochar reference
- **Visual Selection Interface**: Checkboxes with experiment details and real-time total output calculation
- **Batch Tracking**: Unique identifiers (CB001, CB002, etc.) with optional descriptive names
- **Full Traceability**: Maintains links to all constituent experiments
- **Test Integration**: Compound batches can be used as test samples just like individual experiments
- **Data Preservation**: Original experiment data remains completely intact

### Compound Batch Creation Workflow
1. **Navigate to "Compound Batches" tab** - Dedicated management interface
2. **Click "Create Batch"** - Opens self-contained creation modal
3. **Search experiments** - Use search bar to filter by number, species, date, biochar reference
4. **Select experiments** - Check boxes next to desired experiments with visual feedback
5. **Auto-calculation** - Total output automatically calculated from selected experiments
6. **Enter batch details** - Batch number, name, description, and other metadata
7. **Save compound batch** - Creates batch with all selected experiment associations

### Material Shipment Tracking
- **Dedicated Shipments Tab**: Complete shipment management interface with search and filtering
- **Dual Material Support**: Track shipments of individual graphene experiments OR compound batches
- **Auto-Generated Numbers**: Shipment numbers automatically generated (SHIP-YYYY-MM-HHMMSS)
- **Location Management**: Dynamic dropdown locations with add-new functionality
- **Status Tracking**: Four status levels (pending, shipped, in_transit, received) with color coding
- **Integrated History**: Shipment history appears in both graphene and compound batch dropdown sections
- **Comprehensive Data**: Track from/to locations, dates, amounts, purposes, and delivery status
- **Export Functionality**: CSV export of all shipment records with full details

### Data Entry Optimization
- **Copy/Duplicate**: Clone records with auto-incremented test order
- **Dropdown Management**: Dynamic addition of new options
- **Base Types**: KOH, NaOH (supports dual base experiments)
- **Appearance Tags**: Multiple selectable tags for graphene characterization including "Dull" option
- **Calculated Fields**: Density (specific volume in ml/g) automatically calculated from volume/output ratio
- **Grinding Options**: Manual, Mill, Ball Mill, Blender methods with conditional fields
  - **# of Grinds**: Universal field for milling/blending repetitions (e.g., "5 millings, 3 mins each")
  - **Time Field**: Grinding/blending duration in minutes per cycle
  - **Frequency Field**: Hz setting for Ball Mill only
  - **Smart Enabling**: Fields auto-enable/disable based on method selection
- **Objective Parser**: Paste full experiment text, auto-extracts into 5 structured fields
  - Uses `/client/src/js/utils/objectiveParser.js`
  - Handles variations: "Objective:", "OBJECTIVE", with/without colons
  - Preserves multi-line formatting in each section

### Column Sorting System
- **Biochar Table**: Sortable columns include Order, Exp #, Date, Reactor, Raw Material, Start (g), Temp, Time, Output (g)
- **Graphene Table**: Sortable columns include Order, Exp #, Date, Oven, Qty (g), Biochar, Species, # Grinds, Rate, Max, Time, Vol(ml), Out(g)
- **Client-Side Sorting**: Instant response with proper data type detection (numeric, date, string)
- **Visual Indicators**: Sort arrows show current column and direction (ascending/descending)
- **Smart Null Handling**: Empty values always sort to end regardless of direction
- **Search Integration**: Sorting works seamlessly with existing search functionality
- **State Management**: Separate sort states for each table (`biocharSortColumn`, `grapheneSortColumn`)
- **Toggle Sorting**: Click once for ascending, twice for descending, preserves lot highlighting

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
delete data.ramanReportFile; // RAMAN file object
delete data.updateFile;     // Update report file object
delete data.objectivePaste; // Objective parsing textarea

// Exclude relational objects from editableFields extraction
const exclusions = ['biocharLot', 'biocharExperimentRef', 'biocharLotRef', 'betTests', 'updateReports'];
```

### Temperature Rate Input
**Problem**: Users need to enter ranges like "20-27"
**Solution**: Use `type="text"` instead of `type="number"` for tempRate field

### Multer File Upload Fields
**Problem**: "Unexpected field" error when uploading files with FormData
**Solution**: Exclude file object fields (e.g., `ramanReportFile`) from FormData when appending fields in API client. Only the actual file should be appended with the correct field name expected by Multer.

### SEM Report System Architecture
**Direct Upload Flow**: Graphene modal upload → Creates SemReport entry → Shows in SEM table
**Bulk Upload Flow**: SEM Reports page → Creates multiple entries → Associates with experiments
**Display Integration**: Both types appear in graphene expansions with original filenames
**Table Refresh**: `loadSemReports()` called after graphene save operations

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
- `POST /api/bet` - Create new record (supports BET PDF upload)
- `PUT /api/bet/:id` - Update record (supports BET PDF upload)
- `DELETE /api/bet/:id` - Delete record
- `GET /api/bet/export/csv` - Export to CSV

### Conductivity
- `GET /api/conductivity` - List all with filters (default sort: desc)
- `POST /api/conductivity` - Create new record
- `PUT /api/conductivity/:id` - Update record
- `DELETE /api/conductivity/:id` - Delete record
- `GET /api/conductivity/export/csv` - Export to CSV

### RAMAN
- `GET /api/raman` - List all with filters (default sort: desc)
- `POST /api/raman` - Create new record (supports RAMAN PDF upload)
- `PUT /api/raman/:id` - Update record (supports RAMAN PDF upload)
- `DELETE /api/raman/:id` - Delete record
- `GET /api/raman/export/csv` - Export to CSV

### TEM
- `GET /api/tem` - List all with filters (default sort: desc)
- `POST /api/tem` - Create new record (supports TEM PDF upload)
- `PUT /api/tem/:id` - Update record (supports TEM PDF upload)
- `DELETE /api/tem/:id` - Delete record
- `GET /api/tem/export/csv` - Export to CSV

### Compound Batches
- `GET /api/compound-batches` - List all compound batches with filters (default sort: desc)
- `GET /api/compound-batches/:id` - Get single compound batch with associated experiments
- `GET /api/compound-batches/by-number/:batchNumber` - Get compound batch by batch number
- `POST /api/compound-batches` - Create new compound batch with experiment associations
- `PUT /api/compound-batches/:id` - Update compound batch and experiment associations
- `DELETE /api/compound-batches/:id` - Delete compound batch (preserves original experiments)
- `POST /api/compound-batches/:id/experiments/:grapheneId` - Add experiment to compound batch
- `DELETE /api/compound-batches/:id/experiments/:grapheneId` - Remove experiment from compound batch
- `GET /api/compound-batches/:id/related` - Get related test data and constituent experiments for compound batch dropdown
- `GET /api/compound-batches/export/csv` - Export to CSV

### Update Reports
- `GET /api/update-reports` - List all reports with associated experiments
- `POST /api/update-reports` - Upload new report with file and associations (50MB max)
- `PUT /api/update-reports/:id` - Update metadata and experiment associations
- `DELETE /api/update-reports/:id` - Delete report and file
- `POST /api/update-reports/:id/graphene/:grapheneId` - Add experiment association
- `DELETE /api/update-reports/:id/graphene/:grapheneId` - Remove experiment association
- `GET /api/update-reports/graphene/:experimentNumber` - Get reports for specific experiment

### SEM Reports
- `GET /api/sem-reports` - List all SEM reports with associated experiments
- `POST /api/sem-reports` - Bulk upload PDFs with optional associations (10MB each, 10 files max)
- `PUT /api/sem-reports/:id` - Update report date and experiment associations
- `DELETE /api/sem-reports/:id` - Delete report and file
- `GET /api/sem-reports/:id` - Get single SEM report with associations
- `GET /api/sem-reports/graphene/:experimentNumber` - Get SEM reports for specific experiment
- `POST /api/sem-reports/:id/graphene/:grapheneId` - Add experiment association
- `DELETE /api/sem-reports/:id/graphene/:grapheneId` - Remove experiment association
- **Note**: Direct uploads through graphene modal automatically create SEM report entries

### Material Shipments
- `GET /api/shipments` - List all shipments with search and filtering (default sort: desc)
- `POST /api/shipments` - Create new shipment record
- `PUT /api/shipments/:id` - Update shipment record
- `DELETE /api/shipments/:id` - Delete shipment record
- `GET /api/shipments/export/csv` - Export shipments to CSV
- `GET /api/shipments/locations/from` - Get all unique 'from' locations for dropdown
- `GET /api/shipments/locations/to` - Get all unique 'to' locations for dropdown
- **Auto-generated Numbers**: Shipment numbers automatically generated using SHIP-YYYY-MM-HHMMSS format
- **Dual Material Support**: Can reference either grapheneSample OR compoundBatchNumber (mutually exclusive)
- **Status Management**: Four status levels (pending, shipped, in_transit, received) with proper validation

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
- **Grinding Methods**: Manual, Mill, Ball Mill, Blender
- **Appearance Tags**: Shiny, Somewhat Shiny, Barely Shiny, Dull, Black, Black/Grey, Grey, Voluminous, Very Voluminous, Brittle

### Data Constraints
- **Experiment numbers**: Unique per table
- **Lot numbers**: Unique in BiocharLot table
- **SEM Reports**: PDF only, max 10MB
- **Scientific Notation**: BET surface area values support format like 1.88e3, displayed as 1.88 × 10³


## Component Architecture (COMPLETED - August 2025)

The codebase has been fully componentized to improve maintainability and eliminate code duplication:

### Implemented Components ✅ **ALL COMPLETE**

#### 1. Modal Components
- **Add New Item Modals**: 12 modals converted to dynamic helpers
  - Location: `/client/src/js/components/modals/modalHelpers.js`
  - Impact: ~180 lines reduced, centralized modal styling/behavior
  
- **PDF Viewer Modals**: 3 modals unified
  - Location: `/client/src/js/components/modals/pdfViewerHelpers.js`
  - Converted: RAMAN, SEM, Update Report viewer modals
  - Impact: ~60 lines reduced, consistent PDF viewing experience

#### 2. Form Field Components
- **Date Fields with "Unknown" Checkbox**: 5 fields converted
  - Location: `/client/src/js/components/forms/dateFieldHelpers.js`
  - Pattern: Date input + checkbox functionality
  - Impact: ~40 lines reduced per field

- **Select Fields with "Add New"**: 7 fields converted
  - Location: `/client/src/js/components/forms/selectFieldHelpers.js`
  - Pattern: Dropdown + "Add New" modal integration
  - Impact: ~63 lines reduced, consistent dropdown behavior

- **Numeric Fields with Units**: 12 fields converted
  - Location: `/client/src/js/components/forms/numericFieldHelpers.js`
  - Pattern: Number/text inputs with unit display
  - Impact: ~12 lines reduced, supports scientific notation

- **File Upload Fields**: 1 field converted (expandable pattern)
  - Location: `/client/src/js/components/forms/fileFieldHelpers.js`
  - Pattern: File input + current file management + view/remove
  - Impact: Standardized file upload experience

#### 3. Dropdown Section Components
- **Test Results Sections**: 4 test type displays converted
  - Location: `/client/src/js/components/dropdownSections/testResultsHelper.js`
  - Pattern: BET, Conductivity, RAMAN, TEM test result displays
  - Impact: ~500 lines reduced from graphene dropdown, complete reusability

- **Reports Sections**: 2 report types converted
  - Location: `/client/src/js/components/dropdownSections/reportsHelper.js`
  - Pattern: SEM and Update report displays with PDF viewing
  - Impact: ~150 lines reduced, consistent report viewing

- **Source Data Section**: 1 biochar source display converted
  - Location: `/client/src/js/components/dropdownSections/sourceDataHelper.js`
  - Pattern: Biochar experiment and lot reference display
  - Impact: ~80 lines reduced, handles both direct and lot references

- **Objectives Section**: 2 display types converted
  - Location: `/client/src/js/components/dropdownSections/objectivesHelper.js`
  - Pattern: Experiment objectives and compound batch constituent experiments
  - Impact: ~120 lines reduced, dual-purpose component

### Component Usage Pattern
```javascript
// Form Field Components - Dynamic HTML generation preserving Alpine.js reactivity
<div x-html="getDateFieldHtml({
  label: 'Experiment Date', 
  dateModelVariable: 'biocharForm.experimentDate',
  unknownModelVariable: 'biocharForm.dateUnknown'
})"></div>

<div x-html="getSelectFieldHtml({
  label: 'Research Team',
  modelVariable: 'biocharForm.researchTeam',
  optionsArray: 'researchTeams',
  showModalVariable: 'showAddResearchTeam',
  addNewText: 'Team'
})"></div>

// Dropdown Section Components - Expandable table row content
<div x-html="getTestResultsSectionHtml({
  testType: 'bet',
  dataPath: 'grapheneRelatedData[record.experimentNumber].betTests'
})"></div>

<div x-html="getTestResultsSectionHtml({
  testType: 'conductivity', 
  dataPath: 'compoundBatchRelatedData[batch.id].conductivityTests'
})"></div>

<div x-html="getReportsSectionHtml({
  reportType: 'update',
  dataPath: 'record.updateReports'
})"></div>

<div x-html="getObjectivesSectionHtml({
  sectionType: 'compound-batches',
  dataPath: 'compoundBatchRelatedData[batch.id].compoundBatch.experiments'
})"></div>
```

### Total Impact Achieved
- **Components Created**: 11 robust, reusable components (7 forms + 4 dropdown sections)
- **Fields/Modals Componentized**: 40+ form UI elements
- **Dropdown Sections Componentized**: 8 expandable row sections (graphene + compound batch)
- **HTML Lines Eliminated**: ~850+ lines of repetitive code (~300 forms + ~550 dropdowns)
- **Dropdown Code Reduction**: 95% reduction (500+ lines → 25 component calls)
- **Consistency**: 100% standardized styling and behavior across all tables
- **Maintainability**: All changes now centralized in component files
- **Developer Efficiency**: 95% reduction in time for new fields/modals/dropdowns
- **Complete Reusability**: Dropdown components work seamlessly across graphene and compound batch tables
- **Functionality**: 100% preserved with enhanced reliability and Alpine.js compatibility

## Recent Updates (August 2025)

### BET Test System Enhancements
- **Species Field Removal**: Removed unnecessary `species` field from BET model and all related functionality
- **Mass Field Addition**: Added precise `mass` field (Decimal 10,4) for sample mass measurements in grams
- **Scientific Notation Display**: Enhanced formatting to show values like 1.88e3 as 1.88 × 10³ with proper superscripts
- **API Cleanup**: Fixed all legacy field references in search, relations, and data processing
- **Form Updates**: Replaced species dropdown with mass input field using numeric component
- **Table Display**: Updated BET table headers and data columns to show Mass (g) instead of Species
- **Backward Compatibility**: API safely handles legacy species data by filtering it out

### RAMAN Table Display Enhancement
- **Integration Range Visibility**: Fixed missing Integration Range columns in main RAMAN table view
- **Table Structure**: Added 4 Integration Range columns (2D Band, G Band, D Band, D/G Ratio) to main table header
- **Data Display**: Integration ranges now show directly in table as "low-high" format (e.g., "2791-2557")
- **Consistent Layout**: RAMAN table now displays both Integration Range and Integral Typ A columns
- **Expanded View**: Detailed matrix view still available in expandable rows with full data analysis

### Graphene Dropdown Conductivity Integration
- **Conductivity Test Display**: Added conductivity test results section to graphene row expansions
- **Backend Enhancement**: Extended `/api/graphene/:experimentNumber/related` endpoint to include conductivity tests
- **Data Processing**: Added decimal field conversion for conductivity measurements (1kN, 8kN, 12kN, 20kN)
- **UI Integration**: Conductivity section automatically appears when tests exist for graphene experiments
- **Complete Test Pipeline**: Graphene dropdowns now show BET, RAMAN, SEM, Update Reports, and Conductivity tests

### TEM Test Results Implementation
- **New Test Category**: Added Transmission Electron Microscopy (TEM) test results as new tab under Test Results
- **Database Schema**: Created TEMTest model with fields: testDate, grapheneSample, compoundBatchNumber, researchTeam, testingLab, temReportPath, comments
- **Backend API**: Full CRUD operations at `/api/tem` endpoint with PDF upload support (10MB max)
- **Frontend Integration**: New TEM tab with table view, add/edit modal, PDF viewer modal, search, and CSV export
- **Core Fields**: Test Date, Graphene Sample, Testing Lab, PDF Report with modal viewing capability
- **File Management**: PDF upload/view/replace/remove functionality with proper file cleanup
- **Dual Sample Support**: Can test either individual experiments or compound batches

### Material Shipment Tracking System (August 2025)
- **Comprehensive Tracking**: Complete material shipment tracking system for both individual graphene experiments and compound batches
- **Database Schema**: MaterialShipment model with fields: shipmentNumber, shipFromLocation, shipToLocation, shipmentDate, amountShipped, unit, purpose, grapheneSample, compoundBatchNumber, status, receivedDate, comments
- **Auto-Generated Numbering**: Automatic shipment number generation using format SHIP-YYYY-MM-HHMMSS
- **Dual Material Support**: Can track shipments of either individual graphene batches OR compound batches (mutually exclusive)
- **Backend API**: Full CRUD operations at `/api/shipments` with search, filtering, location management, and CSV export
- **Location Management**: Dynamic location dropdown with add-new functionality for shipping locations
- **Frontend UI**: Dedicated Shipments tab with clean table layout, search functionality, and comprehensive modal forms
- **Status Tracking**: Four shipment statuses (pending, shipped, in_transit, received) with color-coded badges
- **Integration**: Shipment history displays in both graphene and compound batch dropdown sections
- **Form Validation**: Conditional required fields based on material type selection
- **Component Integration**: Reusable shipmentsHelper.js component for consistent dropdown display across tables

### Compound Batch System Implementation
- **Database Architecture**: Added CompoundBatch model and GrapheneCompoundBatch junction table for many-to-many relationships
- **Test Integration**: Extended BET, RAMAN, Conductivity, and TEM models with compoundBatchNumber field for dual sample support
- **Backend API**: Complete CRUD operations at `/api/compound-batches` with experiment association management
- **Frontend UI**: Dedicated Compound Batches tab with comprehensive management interface
- **Batch Management**: Self-contained modal with searchable experiment selection and auto-calculated total output
- **Data Preservation**: Original experiment data remains completely intact - batches are pure associations
- **Full Traceability**: Complete visibility into which experiments comprise each compound batch
- **Testing Workflow**: Compound batches can be used as test samples exactly like individual experiments

### Compound Batch Workflow Optimization (August 2025)
- **Self-Contained Creation**: Moved compound batch creation entirely within dedicated Compound Batches tab
- **Removed Cross-Tab Dependency**: No longer need to pre-select experiments in Graphene tab
- **Enhanced Modal Interface**: Added searchable experiment list with checkboxes directly in creation modal
- **Streamlined Graphene Table**: Removed compound batch column and selection checkboxes for cleaner focus on individual experiments
- **Improved User Experience**: Search, select, and create compound batches in single workflow without tab switching
- **Real-Time Feedback**: Auto-calculated total output and selected experiment count during selection process
- **Visual Selection**: Rich experiment display showing number, output, date, species, and biochar reference for informed selection

### Dropdown Section Componentization & Compound Batch Integration (August 2025)
- **Graphene Dropdown Componentization**: Converted ~500 lines of graphene dropdown HTML into 4 reusable components
- **Component Architecture**: Created modular system for BET, Conductivity, RAMAN, TEM test displays plus report and objective sections
- **Alpine.js Compatibility**: All components preserve Alpine.js directives and reactivity through dynamic HTML generation
- **Compound Batch Dropdown Implementation**: Applied same components to compound batch table for identical dropdown functionality
- **Backend Integration**: Added `/api/compound-batches/:id/related` endpoint for compound batch test result aggregation
- **Unified Experience**: Both graphene and compound batch tables now show identical expandable row content with test results
- **Code Reduction**: 95% reduction in dropdown HTML (500+ lines → 25 component calls)
- **Maintainability**: All dropdown styling and behavior changes now centralized in component files
- **Perfect Reusability**: Same components render appropriately for both individual experiments and compound batches
- **Issue Resolution**: Fixed duplicate dropdown sections and styling inconsistencies in compound batch table

## Quick Debugging Reference

**Alpine.js State**: `Alpine.$data(document.querySelector('[x-data]'))`
**Common Errors**:
- "Cannot read properties of undefined" → Add null checks with `?.`
- "Expected Int, provided String" → Check numeric field conversion in routes
- Template not updating → Use spread operator: `this.state = {...this.state, key: value}`
- Multiple `<tr>` in template → Wrap in `<tbody>`

## Database Schema Summary

### Core Models
- **Biochar**: Raw material experiments with reactor processing
- **BiocharLot**: Groups biochar experiments for lot-based tracking
- **Graphene**: Production experiments using biochar as input
- **CompoundBatch**: Groups graphene experiments for downstream testing

### Test Models (All support dual sample referencing)
- **BET**: Surface area measurements (graphene OR compound batch)
- **ConductivityTest**: Electrical measurements (graphene OR compound batch) 
- **RamanTest**: Spectroscopy analysis (graphene OR compound batch)
- **TEMTest**: Electron microscopy (graphene OR compound batch)

### Report Models
- **UpdateReport**: Weekly PDF reports with multi-experiment associations
- **SemReport**: SEM PDF reports with multi-experiment associations

### Shipment Models
- **MaterialShipment**: Material shipment tracking for both graphene experiments and compound batches

### Junction Tables
- **GrapheneUpdateReport**: Links graphene ↔ update reports (many-to-many)
- **GrapheneSemReport**: Links graphene ↔ SEM reports (many-to-many)
- **GrapheneCompoundBatch**: Links graphene ↔ compound batches (many-to-many)

### Key Design Principles
- **Soft References**: Test samples use string identifiers, not foreign keys
- **Dual Architecture**: Tests reference either individual experiments OR compound batches
- **Data Preservation**: Compound batches never modify original experiment data
- **Full Traceability**: Complete audit trail from raw materials to final testing