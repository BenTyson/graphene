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
│   ├── routes/          # API routes (biochar, graphene, tests, etc.)
│   ├── middleware/      # Error handling, authentication
│   └── utils/           # Cloudinary config, file uploads
├── client/              # Frontend (Alpine.js + Tailwind)
│   ├── index.html       # Main UI (1,153 lines after componentization)
│   └── src/
│       ├── js/
│       │   ├── app-refactored.js  # Main Alpine.js app (2,913 lines)
│       │   ├── services/          # Service-oriented architecture
│       │   ├── components/        # 30+ reusable UI components
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

### Service-Oriented Architecture (September 2025)

Main application delegates to specialized services:

- **FilterService** (347 lines) - Filtering and search
- **NewsService** (526 lines) - News system management
- **CRUDService** (1,169 lines) - All CRUD operations
- **DashboardService** (121 lines) - Dashboard data
- **CardService** - Card data fetching with caching

**Impact**: 37.4% file size reduction, ~33% faster agent parsing

### Component System (Complete)

30+ modular UI components across 4 phases:

- **Form Fields**: Date, select, numeric, file upload components
- **Modals**: 9 entity modals (Biochar, Graphene, BET, etc.)
- **Tabs**: 7 tab components (BET, Conductivity, RAMAN, etc.)
- **Cards**: Intelligent card factory with type detection
- **Dropdowns**: Expandable row sections

**Impact**: index.html reduced from 4,788 to 1,153 lines (76% reduction)

### Authentication System (September 2025)

JWT-based authentication with:

- **Backend**: `/server/routes/auth.js` (login, logout, user management)
- **Frontend**: `AuthService.js` (token management, session validation)
- **UI**: Clean login page with Remember Me functionality
- **Security**: Rate limiting (5 attempts/15min), bcrypt hashing
- **Roles**: SUPER_ADMIN, SCIENCE_TEAM, EXECUTIVE_TEAM, INVESTOR, TEAM_MEMBER, THIRD_PARTY

#### Role-Based Access Control (December 2025)

| Role | Access Level |
|------|--------------|
| SUPER_ADMIN | Full access + User Management |
| SCIENCE_TEAM | Full data access |
| EXECUTIVE_TEAM | Full data access |
| INVESTOR | Full data access |
| TEAM_MEMBER | Full data access |
| THIRD_PARTY | **View-only** - No editing, no Dashboard/News/Insights/Shipments |

**Third Party Restrictions:**
- Hidden tabs: Dashboard, News Feed, Insights, Shipments, User Management
- All POST/PUT/DELETE requests blocked at API level with `requireEditAccess` middleware
- UI edit/delete buttons hidden via `canEdit()` helper

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
Tests (BET, Conductivity, RAMAN, TEM)
  ↓
MaterialShipment (distribution)
```

### Key Design Principles

- **Soft References**: Tests use string identifiers, not foreign keys
- **Dual Architecture**: Tests reference either Graphene OR CompoundBatch
- **Triple Shipments**: Shipments reference Graphene, CompoundBatch, OR Micronization
- **Full Traceability**: Complete audit trail from raw materials to shipment
- **Timestamps**: All records have createdAt and updatedAt

### Core Models (14 primary tables)

**Production**: Biochar, BiocharLot, Graphene, CompoundBatch, Micronization
**Testing**: BET, ConductivityTest, RamanTest, TEMTest
**Reports**: UpdateReport, SemReport (with junction tables)
**Shipments**: MaterialShipment
**News/AI**: NewsSource, NewsArticle, KnowledgeDocument
**Auth**: User
**References**: CharacterizationReference

**Full Schema**: See [DATABASE-SCHEMA.md](DATABASE-SCHEMA.md)

---

## API Architecture

### RESTful Endpoints

- **Authentication**: `/api/auth/*` (login, logout, user info)
- **Core Entities**: `/api/biochar`, `/api/graphene`, `/api/compound-batches`, `/api/micronization`
- **Tests**: `/api/bet`, `/api/conductivity`, `/api/raman`, `/api/tem`
- **Reports**: `/api/update-reports`, `/api/sem-reports`
- **Shipments**: `/api/shipments`
- **Dashboard**: `/api/dashboard/*` (metrics, inventory, best results)

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

### Navigation Architecture (September 2025)

**Dual-Routing System**:
- **Path-based**: `/graphene`, `/biochar`, `/analysis` (normal tabs)
- **Hash-based**: `/#/data/graphene/MB2967A` (data pages)

**Features**:
- Clean URL patterns
- Seamless tab ↔ data page transitions
- Malformed URL protection
- Authentication guards

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

### News System

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

### September 2025 Optimization

- **Main File Reduction**: 4,651 → 2,913 lines (37.4%)
- **Service Extraction**: 2,163 lines into 4 services
- **Agent Parsing**: ~33% faster
- **Component System**: 30+ reusable components

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

**Last Updated**: November 2025
**Architecture Version**: 2.0 (Post-optimization)
**For Detailed Implementation**: See referenced documentation above
