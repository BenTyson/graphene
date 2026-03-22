# System Architecture Overview

High-level architecture guide for the Graphene Production Control System.

---

## System Overview

**Purpose**: Full-stack web application for tracking the complete production journey of materials from biochar → graphene → compound batch/micronization → testing → shipment.

**Material Pipeline**: Raw materials → Biochar → Graphene → Compound Batch/Micronization → Testing → Shipment

---

## Technology Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT tokens with bcrypt password hashing

### Frontend
- **Framework**: Alpine.js (reactive UI)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js 4.4.0 with date-fns adapter
- **Build Tool**: Vite

### Infrastructure
- **Hosting**: Railway.app cloud platform
- **File Storage**: Cloudinary CDN
- **Database**: Railway PostgreSQL with connection pooling
- **Domain**: admin.hgraphene.com (production)

### Development
- **Frontend Port**: 5174 (Vite dev server)
- **Backend Port**: 3000 (Express server)
- **Database GUI**: Prisma Studio (port 5555)

---

## Project Structure

```
/graphene
├── server/              # Backend (Node.js + Express)
│   ├── index.js         # Server entry point
│   ├── routes/          # API routes (27 files)
│   ├── middleware/      # Error handling, authentication
│   └── utils/           # Cloudinary config, file uploads
├── client/              # Frontend (Alpine.js + Tailwind)
│   ├── index.html       # Main UI (1,153 lines after componentization)
│   └── src/
│       ├── js/
│       │   ├── app-refactored.js  # Main Alpine.js app (~5,300 lines): state + delegate methods
│       │   ├── services/          # Domain services (TaskService, PipelineService, KanbanService, CRUDService, etc.)
│       │   ├── components/        # 48 UI components (23 tabs + 25 modals)
│       │   └── utils/             # Formatters, validators, helpers
│       └── styles/
├── prisma/
│   └── schema.prisma    # Database schema (727 lines)
├── scripts/             # Backup, restore, migrations
├── docs/                # Documentation (reorganized Nov 2025)
├── backups/             # Database backups (gitignored)
└── .claude/
    └── skills/          # Claude Code skills
```

---

## Architecture Highlights

### Service Layer Architecture

`app-refactored.js` holds Alpine.js state; methods are one-liner delegates to domain service files. Each service class receives `appContext` (the Alpine instance) and mutates it directly.

**Domain Services** (`client/src/js/services/`):
- **TaskService.js** (239 lines) - Task CRUD, comments, attachments, subtasks
- **PipelineService.js** (416 lines) - Contact/Deal CRUD, activities, stage constants, view switching
- **KanbanService.js** (117 lines) - Shared SortableJS wrapper for Tasks + Pipeline drag-and-drop
- **CRUDService.js** - Biochar, Graphene, CompoundBatch, Micronization, MCB, Shipment CRUD
- **DashboardService.js** - Dashboard metrics
- **FilterService.js** - Filtering and search
- **CardService.js** - Card data fetching with caching
- **NewsService.js** - News system management
- **AuthService.js** - Token management, session validation
- **RouterService.js** - Route management
- **LoggingService.js** - Audit/logging

**Shared Utilities** (`client/src/js/utils/`):
- **formatters.js** - Date formatting, relative date labels (`getRelativeDateLabel`), user name/initials (`getUserDisplayName`, `getUserInitials`), file size, scientific notation
- **validators.js** - Form validation
- **dataHelpers.js** - Data extraction/transformation
- **constants.js** - Default forms, enums

**Service pattern example:**
```js
// In TaskService.js
async loadTasks(ctx) { ctx.tasks = await API.tasks.getAll(params); }
// In app-refactored.js
async loadTasks() { await taskService.loadTasks(this); }
```

### Component System

48 modular UI components:

- **Form Fields**: Date, select, numeric, file upload components
- **Modals**: 25 modal files (entity forms, task detail panel, contact/deal modals and detail panels, PDF viewer, etc.)
- **Tabs**: 23 tab files (production, tests, analysis, tasks, pipeline, user management)
- **Cards**: Intelligent card factory with type detection
- **Dropdowns**: Expandable row sections

### Authentication System (September 2025)

JWT-based authentication with:

- **Backend**: `/server/routes/auth.js` (login, logout, user management)
- **Frontend**: `AuthService.js` (token management, session validation)
- **UI**: Clean login page with Remember Me functionality
- **Security**: Rate limiting (5 attempts/15min), bcrypt hashing
- **Roles**: SUPER_ADMIN, SCIENCE_TEAM, EXECUTIVE_TEAM, INVESTOR, TEAM_MEMBER, THIRD_PARTY

#### Role-Based Access Control

| Role | Access Level |
|------|--------------|
| SUPER_ADMIN | Full access + User Management |
| SCIENCE_TEAM | Full data access + Tasks |
| EXECUTIVE_TEAM | Full data access + Tasks |
| TEAM_MEMBER | Full data access + Tasks |
| INVESTOR | Full data access, no Tasks or Pipeline tabs |
| THIRD_PARTY | View-only - No editing, restricted tabs |

**Third Party Restrictions:**
- Hidden tabs: Dashboard, News Feed, Insights, Shipments, Tasks, Pipeline, User Management
- All POST/PUT/DELETE requests blocked at API level with `requireEditAccess` middleware
- UI edit/delete buttons hidden via `canEdit()` helper

**Task Management Access:**
- Tasks route uses `requireInternalAccess` middleware (blocks THIRD_PARTY + INVESTOR)
- Task editing: creator + SUPER_ADMIN can edit/delete any task
- Tab hidden for INVESTOR and THIRD_PARTY roles

**Pipeline/CRM Access:**
- Pipeline route uses `requireInternalAccess` middleware (blocks THIRD_PARTY + INVESTOR)
- Tab hidden for INVESTOR and THIRD_PARTY roles

### File Storage (Cloudinary CDN)

- **Development**: `graphene-uploads-dev` folder
- **Production**: `graphene-uploads` folder
- **Supported Types**: PDF, XLSX, XLS, XLSM, images
- **Upload Limits**: 10MB per file (50MB for update reports)
- **Migration**: 296 files (872MB) migrated successfully

---

## Deployment Architecture

### Three-Tier Strategy

1. **Local Development**
   - URL: `localhost:5174`
   - Database: Local PostgreSQL
   - Cloudinary: `graphene-uploads-dev`

2. **Staging (Railway)**
   - Branch: `staging`
   - Database: Separate Railway PostgreSQL
   - Cloudinary: `graphene-uploads-staging`
   - **Purpose**: MANDATORY pre-production testing

3. **Production (Railway)**
   - Branch: `main`
   - URL: admin.hgraphene.com
   - Database: Production Railway PostgreSQL
   - Cloudinary: `graphene-uploads`
   - **Auto-Deploy**: On push to main branch

### Railway Configuration

- **Build System**: Nixpacks with Node.js 20
- **Startup Script**: `scripts/railway-startup.sh`
- **Auto-Deploy**: Git push triggers deployment
- **SSL**: Automatic HTTPS
- **Process Management**: Automatic restart and monitoring

---

## Database Design

### Material Flow
```
Biochar (raw material)
  ↓
Graphene (production)
  ↓
CompoundBatch (grouping) / Micronization (processing)
  ↓
MCB (optional grouping of micronizations)
  ↓
Tests (BET, Conductivity, RAMAN, TEM, ParticleSize, XRD, XPS)
  ↓
MaterialShipment (distribution)
```

### Key Design Principles

- **Soft References**: Tests use string identifiers, not foreign keys
- **Dual Architecture**: Tests reference either Graphene OR CompoundBatch
- **Quad Shipments**: Shipments reference Graphene, CompoundBatch, Micronization, OR MCB
- **Full Traceability**: Complete audit trail from raw materials to shipment
- **Timestamps**: All records have createdAt and updatedAt

### Core Models

**Production**: Biochar, BiocharLot, Graphene, CompoundBatch, Micronization, MicronizedCompoundBatch (MCB)
**Testing**: BET, ConductivityTest, RamanTest, TEMTest, ParticleSizeTest, XRDTest, XPSTest
**Reports**: UpdateReport, SemReport (with junction tables)
**Shipments**: MaterialShipment
**Task Management**: Task (with self-referencing subtasks), TaskComment, TaskActivity
**Pipeline/CRM**: Contact, Deal, ContactActivity, DealActivity, ContactAttachment
**News/AI**: NewsSource, NewsArticle, KnowledgeDocument
**Auth**: User (6 roles)
**References**: CharacterizationReference

**Full Schema**: See [DATABASE-SCHEMA.md](DATABASE-SCHEMA.md)

---

## API Architecture

### RESTful Endpoints

- **Authentication**: `/api/auth/*` (login, logout, user info)
- **Core Entities**: `/api/biochar`, `/api/graphene`, `/api/compound-batches`, `/api/micronization`, `/api/mcb`
- **Tests**: `/api/bet`, `/api/conductivity`, `/api/raman`, `/api/tem`, `/api/particle-size`, `/api/xrd`, `/api/xps`
- **Reports**: `/api/update-reports`, `/api/sem-reports`
- **Shipments**: `/api/shipments`
- **Tasks**: `/api/tasks` (CRUD + comments + status changes, internal roles only)
- **Pipeline**: `/api/pipeline` (contacts, deals, activities, attachments, internal roles only)
- **Dashboard**: `/api/dashboard/*` (metrics, inventory, best results)
- **AI/News**: `/api/ai-insights`, `/api/news`, `/api/knowledge-base`

### Common Patterns

- **List All**: `GET /api/{entity}` (default sort: DESC)
- **Get Related**: `GET /api/{entity}/:id/related`
- **Create**: `POST /api/{entity}`
- **Update**: `PUT /api/{entity}/:id`
- **Delete**: `DELETE /api/{entity}/:id`
- **Export**: `GET /api/{entity}/export/csv`

**Full API Reference**: See [API-REFERENCE.md](API-REFERENCE.md)

---

## UI/UX Architecture

### Design System

- **Monochrome Styling**: Minimal color accents
- **Professional**: Suitable for laboratory use
- **Responsive**: Mobile-optimized layouts
- **Global Color System**: CSS custom properties (`:root`)
- **Link Color**: Bronze (#B87333) with hover states
- **Table Cells**: Standardized classes for consistency

### Navigation Architecture (March 2026)

**Layout**: Collapsible left sidebar (`bg-gray-950`) + flex content area.
- **Sidebar expanded**: 240px (`w-60`) with icon + label
- **Sidebar collapsed**: 64px (`w-16`) icon-only with tooltips, state persisted in localStorage
- **Mobile** (below `lg`/1024px): Overlay drawer with backdrop, opened via hamburger in top header
- **Groups**: Production (5 items), Analytics (2 items), Test Results (9 items) -- collapsible via `x-collapse`
- **Top header**: 48px bar with breadcrumb (`getPageSection()` / `getPageTitle()`)
- **User info**: Sidebar footer zone (avatar, name, role, logout)
- **Test subtabs**: Horizontal pill bar in content area when `activeTab.startsWith('test-')`

**State variables**: `sidebarExpanded`, `sidebarOpen`, `sidebarProductionOpen`, `sidebarAnalyticsOpen`, `sidebarTestResultsOpen`

**Routing (unchanged)**:
- **Path-based**: `/graphene`, `/biochar`, `/analysis` (normal tabs)
- **Hash-based**: `/#/data/graphene/MB2967A` (data pages)
- Clean URL patterns, seamless tab/data page transitions, auth guards

### Modal Stacking (January 2025)

**Hierarchy**:
- Base Level: Main application (z-index: default)
- Card Modals: Detail views (z-index: 50)
- PDF Viewer: Document viewing (z-index: 60)

**Features**:
- Modal-within-modal support
- Context preservation
- Non-blocking PDF viewing

---

## Key Features

### Analysis System (September 2025)

Competitive benchmarking dashboard with:

- **Hero Metrics**: BET surface area, conductivity, RAMAN D/G ratio
- **Interactive Charts**: Chart.js 4.4.0 with time-series visualization
- **Industry Benchmarks**: Comparison zones (activated carbon, carbon black, synthetic graphite)
- **Real Data**: Live results from actual test data

### Task Management (v2)

- **Kanban Board**: 4-column board (TODO, IN_PROGRESS, IN_REVIEW, DONE) with SortableJS drag-and-drop
- **Drag-and-Drop**: Cards draggable between columns and reorderable within columns. Position persisted via `PATCH /api/tasks/reorder` (atomic batch update)
- **Archive**: Tasks can be archived (hidden from board by default). "Show archived" toggle in filters. Archive/unarchive buttons in detail panel.
- **Attachments**: Multi-file upload (PDF, images, Word, Excel, CSV, TXT) via detail panel. Stored in Cloudinary (prod) or local uploads (dev). `TaskAttachment` model tracks uploader, filename, size, mime type.
- **Detail Panel**: Right-side slide-over with inline editing, subtasks, attachments, comments, activity log
- **Access**: Internal roles only (SUPER_ADMIN, SCIENCE_TEAM, EXECUTIVE_TEAM, TEAM_MEMBER). INVESTOR and THIRD_PARTY excluded.

### Pipeline / CRM (March 2026)

- **Contact Management**: Person and Company contacts with full detail tracking
- **Lead Tracking**: Kanban board with SortableJS drag-and-drop (same pattern as Tasks)
- **Deal Stages**: Type-specific stage progressions (Client, Investor, Partner)
- **Activity Logging**: Timestamped activity feed on contacts and deals
- **File Attachments**: Multi-file upload on contacts via Cloudinary (prod) or local (dev)
- **Access**: Internal roles only (SUPER_ADMIN, SCIENCE_TEAM, EXECUTIVE_TEAM, TEAM_MEMBER). INVESTOR and THIRD_PARTY excluded.
- **Replaces**: Pipedrive CRM

### News System (currently hidden)

- **Status**: Tab hidden via `x-show="false"` in both desktop and mobile nav. Code preserved for later reuse.
- **RSS Aggregation**: Automated news fetching
- **GPT-4 Summarization**: AI-generated summaries
- **Filtering**: Category and keyword-based filtering
- **Bookmarks**: User bookmark management

### AI Insights

- **Knowledge Base**: Research paper and patent management
- **Document Processing**: PDF text extraction and analysis
- **GPT-4 Integration**: Automated summarization and key findings

---

## Important Implementation Details

### Time Units
- **Biochar**: Time in HOURS
- **Graphene**: Time in MINUTES

### Default Values
- **Research Team**: "Curia - Germany"
- **Sort Order**: DESC (newest first)
- **Drying Pressure**: "atm. Pressure"

### Data Constraints
- **Experiment Numbers**: Unique per table
- **SKUs**: Auto-generated for micronization
- **Scientific Notation**: BET supports format like `1.88e3`

---

## Development Workflow

### Git Strategy

- **staging**: Testing branch (work here!)
- **main**: Production branch (merge from staging only)

**Rules**:
- ✅ **ALWAYS work on staging branch**
- ✅ **ALWAYS deploy to staging first**
- ✅ **ALWAYS test in staging before production**
- ❌ **NEVER deploy directly to main**

**Full Workflow**: See [GIT-WORKFLOW.md](../session-start/GIT-WORKFLOW.md)

### Database Operations

```bash
# View database in GUI
npx prisma studio

# Apply schema changes
npx prisma db push

# Generate Prisma client
npx prisma generate

# Create backup
npm run backup:create "description"
```

### Local Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Performance Optimizations

### Service Extraction History

- **September 2025**: Initial extraction — CRUDService, FilterService, NewsService, DashboardService, CardService. Main file 4,651 → 2,913 lines.
- **March 2026**: Task + Pipeline extraction — TaskService, PipelineService, KanbanService. Shared formatters for date/user helpers. Main file 6,073 → 5,316 lines (-757). Eliminated duplicated Kanban init/drag logic between Tasks and Pipeline.

### Caching Strategy

- **CardService**: 5-minute cache for card data
- **Smart Detection**: Auto-detection by identifier pattern
- **API Optimization**: Reduced redundant API calls

---

## Security Features

### Authentication
- **JWT Tokens**: Configurable expiration (7d/30d)
- **Password Hashing**: bcrypt with 12 salt rounds
- **Rate Limiting**: 5 login attempts per 15 minutes
- **Role-Based Access**: TEAM_MEMBER, SUPER_ADMIN

### File Upload Security
- **File Type Validation**: Whitelist of allowed types
- **Size Limits**: 10MB default, 50MB for update reports
- **Cloudinary Integration**: Secure CDN delivery

### HTTPS
- **Production**: Automatic HTTPS via Railway
- **Token Transmission**: Secure Bearer token headers

---

## Related Documentation

### Quick Start
- **[SESSION-START.md](../session-start/SESSION-START.md)** - Rapid context loading
- **[GIT-WORKFLOW.md](../session-start/GIT-WORKFLOW.md)** - Branch strategy

### Core Reference
- **[DATABASE-SCHEMA.md](DATABASE-SCHEMA.md)** - Complete Prisma schema
- **[API-REFERENCE.md](API-REFERENCE.md)** - All REST endpoints

### Workflows
- **[DEPLOYMENT.md](../workflows/DEPLOYMENT.md)** - Staging-first deployment guide
- **[TROUBLESHOOTING.md](../workflows/TROUBLESHOOTING.md)** - Common issues

### Features
- **[AI-INSIGHTS.md](../features/AI-INSIGHTS.md)** - GPT-4 integration
- **[NEWS-SYSTEM.md](../features/NEWS-SYSTEM.md)** - RSS aggregation
- **[CHARACTERIZATION-ANALYSIS.md](../features/CHARACTERIZATION-ANALYSIS.md)** - Analysis charts

### History
- **[SERVICE-EXTRACTION-2025-09.md](../history/SERVICE-EXTRACTION-2025-09.md)** - Optimization project

---

**Last Updated**: March 2026
**Architecture Version**: 4.1 (Service extraction for Tasks/Pipeline/Kanban, shared formatters)
**For Detailed Implementation**: See referenced documentation above
