# Graphene Production Control System - Architecture Guide

## Project Overview
A full-stack web application for tracking the complete production journey of materials from biochar to graphene to micronization to testing, including comprehensive material shipment tracking. Built with Node.js, Express, PostgreSQL, Prisma ORM, and Alpine.js.

**Complete Material Pipeline**: Raw materials → Biochar → Graphene → Compound Batch/Micronization → Testing → Shipment

## Technology Stack & Project Structure

### Technology Stack
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL
- **Frontend**: Alpine.js, Tailwind CSS, Chart.js 4.4.0
- **Charting**: Chart.js with date-fns adapter for time-series visualization
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
│   │   ├── micronization.js # Micronization CRUD + PDF reports + SKU tracking
│   │   ├── updateReports.js # Update report management + associations
│   │   ├── semReports.js   # SEM report management + associations
│   │   ├── shipments.js    # Material shipment tracking + location management + micronization SKU support
│   │   ├── dashboard.js    # Dashboard metrics API endpoints
│   │   ├── analysis.js     # Competitive analysis API + chart data endpoints
│   │   └── auth.js         # Authentication routes (login, logout, user management)
│   └── middleware/
│   │   └── errorHandler.js # Global error handling middleware
├── client/
│   ├── index.html          # Main UI with Alpine.js templates (3,305 lines after componentization)
│   ├── src/
│   │   ├── js/
│   │   │   ├── app-refactored.js    # Main Alpine.js application (2,913 lines - optimized Sept 2025)
│   │   │   ├── services/            # Service-oriented architecture modules
│   │   │   │   ├── api.js           # API client (default export)
│   │   │   │   ├── AuthService.js   # Authentication service (192 lines)
│   │   │   │   ├── FilterService.js # Filtering functionality (347 lines)
│   │   │   │   ├── NewsService.js   # News system management (526 lines)
│   │   │   │   ├── CRUDService.js   # All CRUD operations (1,169 lines)
│   │   │   │   ├── DashboardService.js # Dashboard data loading (121 lines)
│   │   │   │   └── CardService.js   # Centralized card data fetching with caching
│   │   │   ├── utils/
│   │   │   │   ├── constants.js     # DEFAULT_FORMS and app constants (223 lines)
│   │   │   │   ├── formatters.js    # Data formatting utilities
│   │   │   │   ├── validators.js    # Input validation functions
│   │   │   │   ├── dataHelpers.js   # Data manipulation helpers
│   │   │   │   └── objectiveParser.js # Experiment objective parsing
│   │   │   ├── components/          # Reusable UI components (COMPLETE)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginPage.js          # Clean login page component
│   │   │   │   │   └── AuthWrapper.js        # Authentication wrapper (deprecated)
│   │   │   │   ├── modals/
│   │   │   │   │   ├── modalHelpers.js       # Dynamic modal generation
│   │   │   │   │   ├── pdfViewerHelpers.js   # PDF viewer modals
│   │   │   │   │   ├── CardModalSystem.js    # Card detail modal infrastructure
│   │   │   │   │   ├── ModalPdfViewer.js     # Modal-stacking PDF viewer (z-index 60)
│   │   │   │   │   ├── ModalTemplates.js     # Template system for card modals
│   │   │   │   │   ├── BETModal.js           # BET test modal component
│   │   │   │   │   ├── ConductivityModal.js  # Conductivity test modal component
│   │   │   │   │   ├── TEMModal.js           # TEM test modal component
│   │   │   │   │   ├── ShipmentModal.js      # Shipment modal component
│   │   │   │   │   ├── GrapheneModal.js      # Graphene modal component (656 lines)
│   │   │   │   │   ├── BiocharModal.js       # Biochar experiment modal component
│   │   │   │   │   ├── CompoundBatchModal.js # Compound batch modal component
│   │   │   │   │   ├── MicronizationModal.js # Micronization process modal component
│   │   │   │   │   └── RAMANModal.js         # RAMAN spectroscopy modal component
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
│   │   │   │   ├── tabs/              # Tab components
│   │   │   │   │   ├── TestResultsBETTab.js        # BET analysis tab
│   │   │   │   │   ├── TestResultsConductivityTab.js # Conductivity test tab
│   │   │   │   │   ├── TestResultsRAMANTab.js      # RAMAN spectroscopy tab
│   │   │   │   │   ├── TestResultsTEMTab.js        # TEM analysis tab
│   │   │   │   │   ├── SEMReportsTab.js            # SEM report management tab
│   │   │   │   │   ├── UpdateReportsTab.js         # Update reports management tab
│   │   │   │   │   └── AnalysisTab.js             # Competitive analysis with interactive charts
│   │   │   │   ├── dashboard/       # Dashboard widget components
│   │   │   │   │   └── dashboardWidgets.js    # Modular dashboard widget system
│   │   │   │   ├── cards/           # Card system components (COMPLETE)
│   │   │   │   │   ├── CardFactory.js         # Intelligent card creation and type detection
│   │   │   │   │   ├── MasterDataCard.js      # Main unified card component
│   │   │   │   │   ├── SimplifiedGrapheneCard.js # Minimal clickable cards for dashboard
│   │   │   │   │   ├── CardHeader.js          # Card headers with test badges
│   │   │   │   │   ├── CardContainer.js       # Display mode containers
│   │   │   │   │   ├── CardMetrics.js         # Metric display widgets
│   │   │   │   │   ├── CardSection.js         # Collapsible content sections
│   │   │   │   │   └── utils/
│   │   │   │   │       └── cardConfig.js      # Card presets and configuration
│   │   │   │   ├── services/
│   │   │   │   │   └── CardService.js         # Centralized data fetching with caching
│   │   │   │   └── tables/          # Table components (reserved for future)
│   │   │   └── utils/               # Formatters, validators, helpers
│   │   └── styles/main.css          # Tailwind CSS
├── scripts/
│   ├── backup-db.js        # Database backup utility
│   ├── restore-db.js       # Database restore utility
│   ├── seed-users.js       # User seeding script for authentication
│   └── setup-auto-backup.sh # Automated backup setup
├── prisma/
│   └── schema.prisma       # Database schema
├── uploads/
│   └── .gitkeep           # Preserved structure for local dev
├── backups/                # Database backups (gitignored)
├── scripts/                # Deployment and migration scripts
│   ├── railway-startup.sh  # Production startup script
│   ├── run-migration.js    # Database schema migration
│   ├── migrate-files-cloudinary.js # File upload to Cloudinary
│   └── update-db-paths.js  # Database path updates to CDN URLs
├── server/
│   └── utils/
│       ├── cloudinaryConfig.js # Cloudinary configuration and upload helpers
│       └── fileUpload.js       # Multer configuration with Cloudinary integration
├── railway.json            # Railway deployment configuration
├── nixpacks.toml           # Build configuration for Railway
├── .env.cloudinary         # Cloudinary API credentials
└── vite.config.js          # Vite dev server with proxy for /api
```

## Deployment Architecture

### Railway Production Environment

#### Infrastructure
- **Platform**: Railway.app cloud platform
- **Domain**: admin.hgraphene.com with automatic HTTPS
- **Database**: Railway PostgreSQL with connection pooling
- **Build System**: Nixpacks with Node.js 20 runtime
- **Process Management**: Automatic process restart and monitoring
- **Environment Variables**: Secure credential management

#### File Storage Strategy
- **Cloudinary CDN**: Used for both development and production environments
  - **Base URL**: `https://res.cloudinary.com/dlbztbaaa`
  - **Development Folder**: `graphene-uploads-dev` (environment-specific)
  - **Production Folder**: `graphene-uploads` (main production folder)
  - **File Types**: PDF reports, Excel files, images
  - **Upload Limits**: 10MB per file, batch uploads supported
  - **Path Structure**: `/image/upload/v[timestamp]/[folder]/[file-path]`
- **Local Development Fallback**: `/uploads/` directories for legacy support
- **Migration**: 296 files (872MB) successfully migrated to Cloudinary
- **Security**: PDF delivery must be enabled in Cloudinary account settings

#### Database Migration
- **Source**: Local PostgreSQL development database
- **Target**: Railway PostgreSQL production database
- **Migration Tool**: pg_dump and pg_restore with data validation
- **Results**: 
  - 241 graphene experiments migrated
  - 77 biochar records migrated
  - 198 SEM reports path updated
  - 55 update reports path updated
  - All test results and associations preserved

#### Deployment Process
1. **Code Deployment**: Git push to main branch triggers Railway deployment
2. **Build Process**: Nixpacks installs dependencies and runs Vite build
3. **Database Setup**: Prisma schema push and migration scripts
4. **User Seeding**: Automatic admin user creation with secure defaults
5. **Health Checks**: Railway monitors application health and restarts if needed

#### Configuration Files
- **`railway.json`**: Deployment configuration with startup script delegation
- **`nixpacks.toml`**: Build configuration specifying Node.js 20 and build commands
- **`scripts/railway-startup.sh`**: Production startup script with comprehensive logging
- **`.env.cloudinary`**: Cloudinary API credentials for file operations

#### Environment Management
- **Development**: Local environment with database and file storage
- **Production**: Railway environment with PostgreSQL and Cloudinary integration
- **Configuration**: Environment-specific database URLs and API credentials
- **Security**: JWT tokens, bcrypt password hashing, secure API key management

### Cloudinary Integration Details

#### Technical Implementation
- **SDK**: `cloudinary` npm package (v2) for Node.js backend integration
- **Configuration**: Environment variables in `.env.cloudinary`
  - `CLOUDINARY_CLOUD_NAME`: [your-cloud-name]
  - `CLOUDINARY_API_KEY`: [your-api-key]
  - `CLOUDINARY_API_SECRET`: [your-api-secret]
  - `USE_CLOUDINARY`: true (enables Cloudinary in development)
- **Upload Strategy**: 
  - `resource_type: 'auto'` for automatic file type detection
  - Environment-specific folders:
    - Development: `folder: 'graphene-uploads-dev'`
    - Production: `folder: 'graphene-uploads'`
  - Public ID based on original file path structure
  - Public delivery (no signed URLs required)

#### File Path Conversion
- **Local Format**: `sem-reports/MRa123_SEM.pdf`
- **Cloudinary Format**: 
  - **Images/PDFs**: `/image/upload/v1757814746/graphene-uploads/sem-reports/MRa123_SEM.pdf`
  - **Raw Files**: `/raw/upload/v1757814746/graphene-uploads/micronization-reports/report.xlsx`
- **Conversion Logic**: 
  - Remove file extension from public_id
  - Encode spaces (%20) and special characters (%26)
  - Determine resource type: 'raw' for .xlsm/.xlsx/.docx, 'image' for others
  - Append '.pdf' for non-raw files in final URL

#### Database Integration
- **Path Storage**: Database stores full Cloudinary URLs, not local paths
- **Migration Results**: 
  - 198 SEM reports updated
  - 55 update reports updated
  - 296 total files (872MB) migrated successfully
- **File Upload Process**: 
  1. Client uploads file via form
  2. Multer processes upload temporarily
  3. Backend uploads to Cloudinary
  4. Cloudinary URL stored in database
  5. Temporary file cleaned up

#### Development vs Production File Handling
- **Both Environments**: Primary storage on Cloudinary CDN
  - Development uses `graphene-uploads-dev` folder
  - Production uses `graphene-uploads` folder
- **URL Detection**: Application automatically detects URL format
  - Cloudinary URLs: `https://res.cloudinary.com/...` (no modifications)
  - Local paths: `/uploads/...` (adds prefix and viewer parameters)
- **Frontend Integration**:
  - `viewSemPdf()`: Detects Cloudinary URLs and handles appropriately
  - `CRUDService.viewSemPdf()`: Smart URL detection without viewer params for CDN
  - PDF viewer modals: Iframe with proper CSP configuration
  - Authentication service: Skips initialization in iframe contexts

#### Cloudinary Account Requirements
- **PDF Delivery**: Must be enabled in Security settings (Settings → Security → "Allow delivery of PDF and ZIP files")
- **Free Plan Limitation**: PDF delivery restricted by default, requires manual enablement
- **Error Handling**: 401 errors indicate PDF delivery needs to be enabled

## Service-Oriented Architecture (September 2025 Optimization)

### Overview
In September 2025, the application underwent a major optimization to improve agent parsing performance and maintainability. The massive `app-refactored.js` file (4,651 lines) was refactored into a clean service-oriented architecture, reducing the main file to 2,913 lines (37.4% reduction).

### Service Architecture
The application now uses a modular service pattern where the main application delegates functionality to specialized service modules:

#### 1. FilterService.js (347 lines)
- **Purpose**: Centralized filtering functionality for all data tables
- **Features**: Search filters, column sorting, pagination, filter state management
- **Pattern**: Singleton service with state synchronization
- **Usage**: `FilterService.applyFilters(filters, data)`

#### 2. NewsService.js (526 lines)
- **Purpose**: Complete news system management
- **Features**: Article fetching, filtering, pagination, summary generation, headline management
- **State Management**: News articles, filtered results, pagination state
- **Usage**: `NewsService.fetchNewsArticles(appContext)`

#### 3. CRUDService.js (1,169 lines)
- **Purpose**: All CRUD operations for data entities
- **Entities**: Biochar, Graphene, BET, Conductivity, RAMAN, TEM, Compound Batches, Shipments, Micronization
- **Features**: Create, read, update, delete operations with form state management
- **Pattern**: Delegation to service methods with app context parameter
- **Usage**: `CRUDService.createGraphene(formData, appContext)`

#### 4. DashboardService.js (121 lines)
- **Purpose**: Dashboard data loading and state management
- **Features**: Production metrics, inventory tracking, best test results
- **API Integration**: Fetches data from `/api/dashboard/*` endpoints
- **Usage**: `DashboardService.loadDashboardData(appContext)`

#### 5. CardService.js (preserved)
- **Purpose**: Centralized card data fetching with intelligent caching
- **Features**: 5-minute cache, auto-detection by identifier pattern
- **Performance**: Reduces redundant API calls for card displays

### Technical Implementation

#### Delegation Pattern
The main `app-refactored.js` file now acts as a coordinator, delegating specific functionality to services:
```javascript
// Before: Direct implementation in main file
async createGraphene() {
  // 200+ lines of CRUD logic
}

// After: Delegation to service
async createGraphene() {
  return await CRUDService.createGraphene(this.grapheneForm, this);
}
```

#### Service Integration
Services are imported and globally available:
```javascript
import FilterService from './services/FilterService.js';
import NewsService from './services/NewsService.js';
import CRUDService from './services/CRUDService.js';
import DashboardService from './services/DashboardService.js';

// Global access for Alpine.js
window.FilterService = FilterService;
window.CRUDService = CRUDService;
```

#### State Synchronization
Services maintain their own state but synchronize with the main application context:
```javascript
// Service updates its state and app context
async createRecord(data, appContext) {
  this.updateInternalState(data);
  if (appContext) {
    appContext.records = this.getUpdatedRecords();
  }
}
```

### Benefits Achieved

#### Performance Improvements
- **37.4% File Size Reduction**: Main file reduced from 4,651 to 2,913 lines
- **Faster Agent Parsing**: Smaller main file improves Claude agent processing speed
- **Better Organization**: Logical separation of concerns for easier navigation

#### Maintainability Improvements
- **Modular Architecture**: Each service handles specific functionality
- **Single Responsibility**: Services focus on one domain area
- **Easier Testing**: Individual services can be tested in isolation
- **Reduced Complexity**: Main file focuses on coordination rather than implementation

#### Development Efficiency
- **Faster Edits**: Changes to specific functionality isolated to relevant service
- **Better Debugging**: Error tracing simplified with clear service boundaries
- **Code Reusability**: Services can be reused across different contexts
- **Consistent Patterns**: Standardized service interface patterns

### Migration Results
- ✅ **Zero Functionality Loss**: All features preserved exactly
- ✅ **Alpine.js Compatibility**: All reactive bindings maintained
- ✅ **Error Resolution**: Fixed import/export issues, missing functions, plugin integration
- ✅ **Testing Validated**: Application loads and functions correctly
- ✅ **Performance Verified**: Improved parsing speed confirmed

## Authentication System (September 2025)

### Overview
Comprehensive JWT-based authentication system providing secure user management and session control for the Graphene Production Control System.

### Architecture Components

#### Backend Authentication (`/server/routes/auth.js`)
- **Login Endpoint**: `POST /api/auth/login` - User authentication with JWT token generation
- **Logout Endpoint**: `POST /api/auth/logout` - Session termination and token invalidation
- **User Info Endpoint**: `GET /api/auth/me` - Current user profile with role information
- **Features**:
  - **Rate Limiting**: 5 login attempts per 15 minutes per IP address
  - **Password Security**: bcrypt hashing with 12 salt rounds
  - **JWT Tokens**: Configurable expiration (7d default, 30d with "Remember Me")
  - **Role-Based Access**: TEAM_MEMBER and SUPER_ADMIN roles
  - **Session Management**: Token validation and user context preservation

#### Frontend Authentication Service (`/client/src/js/services/AuthService.js`)
- **Token Management**: localStorage (Remember Me) and sessionStorage support
- **API Integration**: Automatic token headers for authenticated requests
- **Session Validation**: Token validation on app initialization
- **Auto-Logout**: Handles expired sessions with graceful redirects
- **User Context**: Role-based permissions and user profile access
- **Features**:
  - **Singleton Pattern**: Global `window.authService` access
  - **State Synchronization**: Real-time authentication state management
  - **Error Handling**: Comprehensive error catching and user feedback
  - **Network Resilience**: Handles offline/online transitions

#### User Interface Components
- **Login Page** (`/client/src/js/components/auth/LoginPage.js`):
  - **Clean Design**: Minimal interface with company branding (HGraphene logo)
  - **Form Features**: Password visibility toggle, "Remember Me" option, loading states
  - **Error Handling**: Inline error messages with user-friendly feedback
  - **Mobile Responsive**: Optimized for all device sizes
- **Authentication Wrapper**: Integrated into main application with loading screens
- **Header Integration**: User profile display with initials avatar and dropdown menu

#### Database Schema
```sql
model User {
  id           String    @id @default(cuid())
  username     String    @unique
  email        String    @unique
  passwordHash String    @map("password_hash")
  role         UserRole  @default(TEAM_MEMBER)
  firstName    String?   @map("first_name")
  lastName     String?   @map("last_name")
  isActive     Boolean   @default(true) @map("is_active")
  lastLogin    DateTime? @map("last_login")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  @@map("users")
}

enum UserRole {
  TEAM_MEMBER
  SUPER_ADMIN
}
```

#### User Management
- **Seeding System**: `scripts/seed-users.js` for preloading team credentials
- **Default Admin**: Benjamin Tyson (Super Admin) with configurable credentials
- **Team Expansion**: Template structure for adding team member accounts
- **Role Hierarchy**: Super Admin access for system administration, Team Member for daily operations

### Security Features
- **Password Protection**: Industry-standard bcrypt hashing
- **Session Security**: JWT tokens with configurable expiration
- **Rate Limiting**: Brute force attack prevention
- **HTTPS Ready**: Secure token transmission
- **Input Validation**: Server-side validation for all authentication endpoints
- **Role Enforcement**: Permission-based access control foundation

### User Experience
- **Seamless Integration**: Authentication wrapper preserves application state
- **Mobile Optimized**: Touch-friendly interface with responsive design
- **Professional Branding**: Clean corporate identity throughout login flow
- **Loading States**: Visual feedback during authentication processes
- **Error Recovery**: Clear error messages with actionable guidance

### Development Features
- **Environment Flexibility**: Automatic API URL detection for development/production
- **Debug Support**: Comprehensive console logging for troubleshooting
- **State Inspection**: Global access to authentication state for debugging
- **Hot Reloading**: Development server integration without session loss

### Migration Impact
- **Zero Downtime**: Authentication system added without disrupting existing functionality
- **Backward Compatible**: All existing features preserved and protected
- **Database Expansion**: Clean schema addition without affecting existing tables
- **Performance Optimized**: Minimal overhead on application startup and operation

## Database Schema

### Authentication Models

#### User Model
- **Purpose**: User accounts with role-based access control
- **Key Fields**: username, email, passwordHash, firstName, lastName, role, isActive
- **Security**: bcrypt password hashing, JWT token-based sessions
- **Roles**: TEAM_MEMBER (default), SUPER_ADMIN
- **Features**: Login tracking, account activation/deactivation, profile management

### Core Models

#### Biochar Model
- **Purpose**: Raw material experiments with reactor processing
- **Key Fields**: experimentNumber, experimentDate, researchTeam, reactorType, rawMaterial, startAmount, temp, timeHours, outputAmount
- **Relationships**: One-to-many with Graphene experiments

#### BiocharLot Model
- **Purpose**: Groups biochar experiments for lot-based tracking
- **Key Fields**: lotNumber, description, totalOutput
- **Relationships**: Many-to-many with Biochar experiments

#### Graphene Model
- **Purpose**: Production experiments using biochar as input
- **Key Fields**: experimentNumber, experimentDate, biocharExperiment, biocharLotNumber, species, output, volume
- **Advanced Features**:
  - **Title Note**: `titleNote` field for experiment annotations (e.g., "(Pilot Plant #1)")
  - **Comments System**: Dropdown with predefined options for processing notes
  - **Second Base Support**: `base2Amount`, `base2Type`, `base2Concentration` fields
  - **Biochar Source**: Can reference individual experiment, lot number, or "Various"
  - **Experiment Objectives**: 5 structured text fields (objective, experimentDetails, result, conclusion, recommendedAction)
  - **Grinding Options**: Manual, Mill, Ball Mill, Blender with conditional fields
  - **Appearance Tags**: Multiple selectable characterization tags including "Dull" option
- **Relationships**: Many-to-many with CompoundBatch, UpdateReport, SemReport

#### CompoundBatch Model
- **Purpose**: Groups multiple graphene experiments for downstream testing
- **Key Fields**: batchNumber, batchName, description, createdDate, totalOutput
- **Features**: 
  - Unique batch numbers with optional descriptive names
  - Auto-calculated total output from constituent experiments
  - Full traceability to original experiments
  - Can be referenced by test results like individual experiments
- **Relationships**: Many-to-many with Graphene experiments

#### Micronization Model
- **Purpose**: Tracks materials sent for micronization processing
- **Key Fields**: micronizationNumber, date, sku, startingMaterialAmount, recoveredAmount, grindPressure, micronizationLocation, dx50
- **Features**:
  - **SKU Tracking**: Auto-generated unique SKU identifiers (base_material_suffix format)
  - **Location Tracking**: Processing location for accurate inventory accounting
  - **Recovery Rate**: Auto-calculated percentage (recovered/starting * 100%)
  - **Material Pipeline**: Raw materials → Biochar → Graphene → Compound Batch → **Micronization** → Shipment
- **Relationships**: References either Graphene experiments OR CompoundBatch

### Test Models (All Support Dual Sample Referencing)

#### BET Tests
- **Purpose**: Track BET surface area measurements for graphene samples
- **Key Fields**: mass (Decimal 10,4), multipointBetArea, langmuirSurfaceArea
- **Features**:
  - **Scientific Notation**: Surface area fields support format like 1.88e3, displayed as 1.88 × 10³
  - **Mass Precision**: Sample mass in grams with 4 decimal places
  - **Testing Labs**: Fraunhofer-Institut
- **Dual Reference**: Links to Graphene via `grapheneSample` OR CompoundBatch via `compoundBatchNumber`

#### Conductivity Tests
- **Purpose**: Track electrical conductivity measurements at different pressures
- **Key Fields**: name, conductivity1kN, conductivity8kN, conductivity12kN, conductivity20kN
- **Features**:
  - **Multi-Format File Support**: .pdf, .xlsx, .xls, .xlsm files (10MB max)
  - **Smart File Handling**: PDFs viewable in modal, Excel files downloadable
  - **Optional Name Field**: Descriptive test identification
- **Dual Reference**: Links to Graphene via `grapheneSample` OR CompoundBatch via `compoundBatchNumber`

#### RAMAN Tests
- **Purpose**: Track RAMAN spectroscopy analysis with absorption band measurements
- **Matrix Structure**: 4×4 data matrix for absorption band analysis
  - **Rows**: Integration Range, Integral Typ A, Integral Typ B, Peak High Typ J
  - **Columns**: 2D Band, G Band, D Band, D/G Ratio
- **Data Storage**: 32 separate numeric fields for database analysis
- **Features**:
  - **Baseline Methods**: Typ A (standard baseline), Typ B (alternative baseline), Typ J (peak height)
  - **Display Format**: Combined values shown as "2791-2557" for ranges, "2581,228" for pairs
  - **Testing Labs**: Fraunhofer-Institut, Clariant
- **Dual Reference**: Links to Graphene via `grapheneSample` OR CompoundBatch via `compoundBatchNumber`

#### TEM Tests
- **Purpose**: Track Transmission Electron Microscopy analysis
- **Key Fields**: testDate, grapheneSample, researchTeam, testingLab, temReportPath, comments
- **Features**:
  - **Simple Structure**: Basic test record with PDF report attachment
  - **PDF Reports**: 10MB file size limit with modal viewing
- **Dual Reference**: Links to Graphene via `grapheneSample` OR CompoundBatch via `compoundBatchNumber`

### Report Models

#### UpdateReport Model
- **Purpose**: Stores weekly PDF reports with metadata
- **Key Fields**: filename, description, weekDate, filePath
- **Features**:
  - **File Storage**: PDFs on Cloudinary CDN with unique timestamped names
  - **Multi-Experiment Associations**: Single report can reference multiple experiments
  - **URL Format**: Cloudinary URLs for production, local paths for development
- **Relationships**: Many-to-many with Graphene experiments

#### SemReport Model
- **Purpose**: Centralized bulk upload and management of SEM PDF reports
- **Key Fields**: filename, originalName, filePath, reportDate
- **Features**:
  - **Bulk Upload**: Up to 10 PDF files simultaneously (10MB each max)
  - **Full Circle Integration**: Direct uploads to Cloudinary CDN and centralized management
  - **Association Management**: Add/remove experiment associations post-upload
  - **URL Format**: Cloudinary URLs for production, local paths for development
- **Relationships**: Many-to-many with Graphene experiments

### Shipment Models

#### MaterialShipment Model
- **Purpose**: Material shipment tracking for experiments, batches, and micronized materials
- **Key Fields**: shipmentNumber, shipFromLocation, shipToLocation, shipmentDate, amountShipped, status
- **Features**:
  - **Auto-Generated Numbers**: SHIP-YYYY-MM-HHMMSS format
  - **Triple Material Support**: Can reference grapheneSample, compoundBatchNumber, OR micronizationSku
  - **Status Tracking**: Four levels (pending, shipped, in_transit, received) with color coding
  - **Location Management**: Dynamic dropdown with add-new functionality

### Junction Tables
- **GrapheneCompoundBatch**: Links graphene ↔ compound batches (many-to-many)
- **GrapheneUpdateReport**: Links graphene ↔ update reports (many-to-many)
- **GrapheneSemReport**: Links graphene ↔ SEM reports (many-to-many)

### Key Relationships
- Biochar ↔ Graphene: Via `biocharExperiment` (direct) or `biocharLotNumber` (lot-based)
- Graphene → Tests: Via `grapheneSample` field (BET, Conductivity, RAMAN, TEM)
- CompoundBatch → Tests: Via `compoundBatchNumber` field (BET, Conductivity, RAMAN, TEM)
- Graphene → Micronization: Via `grapheneSample` field for individual experiments
- CompoundBatch → Micronization: Via `compoundBatchNumber` field for compound batches
- Micronization → Shipment: Via `micronizationSku` field for shipping micronized materials
- All test types include `researchTeam`, `testingLab`, and PDF report paths
- Files use soft references (experiment/batch/SKU identifiers) not hard foreign keys for flexibility

### Design Principles
- **Soft References**: Test samples use string identifiers, not foreign keys
- **Dual Architecture**: Tests reference either individual experiments OR compound batches
- **Triple Shipment Architecture**: Shipments can reference graphene experiments, compound batches, OR micronized SKUs
- **Data Preservation**: Compound batches never modify original experiment data
- **Full Traceability**: Complete audit trail from raw materials to final testing

## API Reference

### Authentication APIs

#### User Authentication
- `POST /api/auth/login` - User login with JWT token generation
  - **Body**: `{ username, password, rememberMe }`
  - **Response**: `{ success: true, data: { token, user: { id, username, email, firstName, lastName, role } } }`
  - **Features**: Rate limiting (5 attempts/15min), bcrypt password verification, configurable token expiration
- `POST /api/auth/logout` - Session termination and token invalidation
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `{ success: true, message: "Logged out successfully" }`
- `GET /api/auth/me` - Current user profile and role information
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `{ success: true, data: { user: { id, username, email, firstName, lastName, role, lastLogin, createdAt } } }`
  - **Features**: Token validation, user context retrieval, role verification

### Core Entity APIs

#### Biochar
- `GET /api/biochar` - List all with filters (default sort: desc)
- `GET /api/biochar/:experimentNumber/related` - Get downstream graphene & BET data
- `POST /api/biochar` - Create new record
- `PUT /api/biochar/:id` - Update record
- `DELETE /api/biochar/:id` - Delete record
- `GET /api/biochar/export/csv` - Export to CSV
- `POST /api/biochar/combine-lots` - Combine experiments into lot
- `GET /api/biochar/lots` - Get available lots

#### Graphene  
- `GET /api/graphene` - List all with filters (default sort: desc)
- `GET /api/graphene/:experimentNumber/related` - Get upstream biochar & downstream test data
- `POST /api/graphene` - Create new record (supports SEM PDF upload)
- `PUT /api/graphene/:id` - Update record (supports SEM PDF upload)
- `DELETE /api/graphene/:id` - Delete record
- `GET /api/graphene/export/csv` - Export to CSV

#### Compound Batches
- `GET /api/compound-batches` - List all compound batches with filters (default sort: desc)
- `GET /api/compound-batches/:id` - Get single compound batch with associated experiments
- `GET /api/compound-batches/by-number/:batchNumber` - Get compound batch by batch number
- `POST /api/compound-batches` - Create new compound batch with experiment associations
- `PUT /api/compound-batches/:id` - Update compound batch and experiment associations
- `DELETE /api/compound-batches/:id` - Delete compound batch (preserves original experiments)
- `POST /api/compound-batches/:id/experiments/:grapheneId` - Add experiment to compound batch
- `DELETE /api/compound-batches/:id/experiments/:grapheneId` - Remove experiment from compound batch
- `GET /api/compound-batches/:id/related` - Get related test data and constituent experiments
- `GET /api/compound-batches/export/csv` - Export to CSV

#### Micronization
- `GET /api/micronization` - List all micronization records with search and filtering (default sort: desc)
- `POST /api/micronization` - Create new micronization record with PDF upload (10MB max)
- `PUT /api/micronization/:id` - Update micronization record with PDF upload support
- `DELETE /api/micronization/:id` - Delete micronization record and associated files
- `GET /api/micronization/export/csv` - Export micronization records to CSV
- **Features**: Auto-calculated recovery rate, dual material source, SKU management, PDF reports

### Test Results APIs

#### BET
- `GET /api/bet` - List all with filters (default sort: desc)
- `POST /api/bet` - Create new record (supports BET PDF upload)
- `PUT /api/bet/:id` - Update record (supports BET PDF upload)
- `DELETE /api/bet/:id` - Delete record
- `GET /api/bet/export/csv` - Export to CSV

#### Conductivity
- `GET /api/conductivity` - List all with filters (default sort: desc)
- `POST /api/conductivity` - Create new record (supports PDF/.xlsx/.xls/.xlsm upload, 10MB max)
- `PUT /api/conductivity/:id` - Update record (supports PDF/.xlsx/.xls/.xlsm upload, 10MB max)
- `DELETE /api/conductivity/:id` - Delete record
- `GET /api/conductivity/export/csv` - Export to CSV

#### RAMAN
- `GET /api/raman` - List all with filters (default sort: desc)
- `POST /api/raman` - Create new record (supports RAMAN PDF upload)
- `PUT /api/raman/:id` - Update record (supports RAMAN PDF upload)
- `DELETE /api/raman/:id` - Delete record
- `GET /api/raman/export/csv` - Export to CSV

#### TEM
- `GET /api/tem` - List all with filters (default sort: desc)
- `POST /api/tem` - Create new record (supports TEM PDF upload)
- `PUT /api/tem/:id` - Update record (supports TEM PDF upload)
- `DELETE /api/tem/:id` - Delete record
- `GET /api/tem/export/csv` - Export to CSV

### Report Management APIs

#### Update Reports
- `GET /api/update-reports` - List all reports with associated experiments
- `POST /api/update-reports` - Upload new report with file and associations (50MB max)
- `PUT /api/update-reports/:id` - Update metadata and experiment associations
- `DELETE /api/update-reports/:id` - Delete report and file
- `POST /api/update-reports/:id/graphene/:grapheneId` - Add experiment association
- `DELETE /api/update-reports/:id/graphene/:grapheneId` - Remove experiment association
- `GET /api/update-reports/graphene/:experimentNumber` - Get reports for specific experiment

#### SEM Reports
- `GET /api/sem-reports` - List all SEM reports with associated experiments
- `POST /api/sem-reports` - Bulk upload PDFs with optional associations (10MB each, 10 files max)
- `PUT /api/sem-reports/:id` - Update report date and experiment associations
- `DELETE /api/sem-reports/:id` - Delete report and file
- `GET /api/sem-reports/:id` - Get single SEM report with associations
- `GET /api/sem-reports/graphene/:experimentNumber` - Get SEM reports for specific experiment
- `POST /api/sem-reports/:id/graphene/:grapheneId` - Add experiment association
- `DELETE /api/sem-reports/:id/graphene/:grapheneId` - Remove experiment association
- **Note**: Direct uploads through graphene modal automatically create SEM report entries

### System APIs

#### Material Shipments
- `GET /api/shipments` - List all shipments with search and filtering (default sort: desc)
- `POST /api/shipments` - Create new shipment record
- `PUT /api/shipments/:id` - Update shipment record
- `DELETE /api/shipments/:id` - Delete shipment record
- `GET /api/shipments/export/csv` - Export shipments to CSV
- `GET /api/shipments/locations/from` - Get all unique 'from' locations for dropdown
- `GET /api/shipments/locations/to` - Get all unique 'to' locations for dropdown
- **Features**: Auto-generated numbers, triple material support, status management

#### Dashboard
- `GET /api/dashboard/production-metrics` - Get production overview and monthly trends
  - Total graphene production, experiment counts, average output
  - Current vs previous month comparison with percentage changes
  - 6-month production trend data for visualization
- `GET /api/dashboard/inventory-by-location` - Get inventory distribution by location
  - Materials shipped TO and FROM each location
  - Current inventory balance calculations (received - shipped)
  - In-transit materials and shipment counts
- `GET /api/dashboard/best-test-results` - Get top performing test results
  - Highest BET surface area measurements with sample identification
  - Best conductivity results at all pressure levels (1kN, 8kN, 12kN, 20kN)
  - Lowest RAMAN D/G ratios (quality indicators) with testing lab info
- **Features**: Real-time metrics, comprehensive error handling, optimized queries

## UI/UX Architecture

### Design Principles
- **Monochrome styling** with minimal color accents
- **Light blue (#EBF8FF)** reserved for lot-related records
- **Clean SVG icons** instead of emojis
- **Compact table layouts** with nested headers
- **Professional appearance** suitable for laboratory use
- **No unnecessary comments in code**

### Global Color System
- **CSS Custom Properties**: Centralized color management using CSS variables in `:root`
- **Primary Link Color**: `--link-primary: #B87333` (Bronze)
- **Hover State**: `--link-hover: #95611F` (Darker bronze)
- **Semantic Classes**: `.text-link`, `.text-link-hover`, `.bg-link`, `.bg-link-light`, etc.
- **Single Point Control**: Change all link colors by updating CSS variables only
- **Consistent Application**: All interactive elements use the same color system

### Global Table Cell Styles
- **Standardized Classes**: Consistent table cell formatting across all tables
- **Standard Cells**: `.table-cell-standard` - `px-4 py-3 text-xs font-mono` with `#212121` color
- **Compact Cells**: `.table-cell-compact` - `px-2 py-2 text-xs font-mono` with `#212121` color  
- **Action Cells**: `.table-cell-actions` - Standard with right alignment
- **Compact Action Cells**: `.table-cell-actions-compact` - Compact with right alignment
- **Future-Proof**: New tables automatically inherit consistent styling

### Component System Overview

#### Comprehensive Component Architecture (Complete)
The system has been fully componentized across four major phases, creating a modular, maintainable architecture with advanced modal functionality:

**Total Components Created**: 30+ robust, reusable components
- **11 Phase 1 Components** (Form fields & dropdown sections)
- **6 Phase 2 Components** (Tab interfaces) 
- **9 Phase 3 Components** (Modal interfaces - COMPLETE)
- **4 Phase 4 Components** (Card system & modal stacking - COMPLETE)

**Overall Impact**: 
- **File Size Reduction**: index.html reduced from 4,788 to 3,305 lines (31% reduction)
- **Code Elimination**: ~2,584+ lines of repetitive code eliminated
- **Consistency**: 100% standardized styling and behavior across all UI elements
- **Maintainability**: All changes centralized in component files
- **Developer Efficiency**: 95% reduction in time for new features
- **Advanced Modals**: Complete modal stacking system with PDF viewing capabilities

#### Component Usage Patterns

**Form Field Components**:
```javascript
<div x-html="getDateFieldHtml({
  label: 'Experiment Date', 
  dateModelVariable: 'biocharForm.experimentDate',
  unknownModelVariable: 'biocharForm.dateUnknown'
})"></div>
```

**Tab Components**:
```javascript
<div x-html="getBETTabHtml()"></div>
<div x-html="getRAMANTabHtml()"></div>
```

**Modal Components**:
```javascript
<!-- Core Production Modals -->
<div x-html="getBiocharModalHtml()"></div>
<div x-html="getGrapheneModalHtml()"></div>
<div x-html="getCompoundBatchModalHtml()"></div>
<div x-html="getMicronizationModalHtml()"></div>

<!-- Test Results Modals -->
<div x-html="getBETModalHtml()"></div>
<div x-html="getConductivityModalHtml()"></div>
<div x-html="getRAMANModalHtml()"></div>
<div x-html="getTEMModalHtml()"></div>

<!-- System Modals -->
<div x-html="getShipmentModalHtml()"></div>
```

**Card System Components**:
```javascript
<!-- Simplified Cards -->
<div x-html="createSimplifiedGrapheneCard(experiment)"></div>

<!-- Card Modals -->
<div x-html="createCardModal('graphene', experimentNumber)"></div>

<!-- Card Factory (automatic type detection) -->
<div x-html="await CardFactory.createCardAsync('MRa389A', {preset: 'modal'})"></div>
```

All components preserve Alpine.js reactivity through dynamic HTML generation and maintain consistent styling patterns.

### Modal Stacking Architecture (January 2025)

#### Overview
Advanced modal system supporting modal-within-modal functionality with proper z-index hierarchy and context preservation.

#### Architecture Components

**Modal Hierarchy**:
- **Base Level**: Main application (z-index: default)
- **Card Modals**: Detailed experiment views (z-index: 50)  
- **PDF Viewer Modals**: Document viewing (z-index: 60)

**Core Components**:
- **CardModalSystem.js**: Infrastructure for card detail modals
- **ModalPdfViewer.js**: PDF viewer optimized for modal stacking
- **ModalTemplates.js**: Template system for consistent modal generation

#### Technical Implementation

**State Management** (app-refactored.js):
```javascript
// Card modal state
activeCardModal: null,
modalLoading: false,
modalCardData: {},

// PDF viewer state  
pdfViewerActive: false,
currentPdfUrl: null,
currentPdfTitle: null,

// Methods
openGrapheneModal(experimentNumber) { /* Opens card modal */ },
openPdfInModal(pdfUrl, title) { /* Opens PDF above card modal */ },
closePdfViewer() { /* Closes PDF, preserves card modal */ }
```

**SEM Report Reorganization**:
- **Test Results Section**: SEM reports moved from "Reports & Documents" to "Test Results"
- **Clickable Integration**: All reports (SEM, Curia Updates) open in PDF viewer modals
- **Context Preservation**: PDF viewer closes back to card modal without losing state

**Modal Container Structure** (index.html):
```html
<!-- Card Modal Container (z-50) -->
<div id="card-modal-container">
  <template x-if="activeCardModal">
    <div x-html="getCurrentModalHtml()"></div>
  </template>
</div>

<!-- PDF Viewer Container (z-60) -->
<div id="pdf-viewer-modal-container">
  <div x-html="window.ModalPdfViewer?.createViewer() || ''"></div>
</div>
```

#### User Experience Flow
1. **Click simplified card** → Opens detailed modal (z-50)
2. **Click SEM/document report** → Opens PDF viewer (z-60) above card modal
3. **Close PDF viewer** → Returns to card modal (preserved state)
4. **Close card modal** → Returns to simplified card view

#### Key Benefits
- **Non-Blocking**: PDF viewing doesn't interrupt card modal workflows
- **Context Preservation**: Card modal state maintained during PDF viewing
- **Proper Stacking**: Visual hierarchy prevents modal confusion
- **Seamless UX**: Intuitive navigation between detail levels

## Important Implementation Details

### Time Units
- **Biochar**: Time stored in HOURS
- **Graphene**: Time stored in MINUTES
- Different units maintained for scientific accuracy

### Default Values & Constants
- **Research Team**: "Curia - Germany"
- **Sort Order**: DESC (newest first)
- **Drying Pressure**: "atm. Pressure" 
- **Base Types**: KOH, NaOH
- **Grinding Methods**: Manual, Mill, Ball Mill, Blender
- **Appearance Tags**: Shiny, Somewhat Shiny, Barely Shiny, Dull, Black, Black/Grey, Grey, Voluminous, Very Voluminous, Brittle

### Data Constraints
- **Experiment numbers**: Unique per table
- **Lot numbers**: Unique in BiocharLot table
- **SEM Reports**: PDF only, max 10MB
- **Scientific Notation**: BET surface area values support format like 1.88e3, displayed as 1.88 × 10³

## Analysis System (September 2025)

### Overview
Comprehensive competitive analysis dashboard providing real-time benchmarking of graphene material performance against industry standards (activated carbon, carbon black, synthetic graphite). Features interactive charts with time-series data and industry benchmark zones.

### Architecture Components

#### Backend API (`/server/routes/analysis.js`)
- **Competitive Metrics Endpoint**: `/api/analysis/competitive-metrics`
  - Aggregates best performance results across all test types
  - Returns current competitive positioning (leading/competitive/developing)
  - Provides industry benchmark data for hero cards
- **Chart Data Endpoint**: `/api/analysis/chart-data`
  - Queries 12 months of historical test data
  - Returns formatted Chart.js datasets with benchmark zones
  - Supports BET, Conductivity, and RAMAN time-series visualization

#### Frontend Components (`/client/src/js/components/tabs/AnalysisTab.js`)
- **Hero Metric Cards**: Real-time performance indicators with status dots
  - BET Surface Area with industry benchmark comparison
  - Electrical Conductivity (20kN pressure) performance
  - RAMAN D/G Ratio quality metrics (lower is better)
- **Interactive Charts**: Three Chart.js visualizations with:
  - Time-series scatter plots showing performance evolution
  - Industry benchmark zones as background shaded areas
  - Interactive tooltips with sample details and competitive context
  - Logarithmic scaling for conductivity (wide industry range)

#### Chart.js Integration
- **Chart.js 4.4.0**: Modern charting library with responsive design
- **Date Adapter**: `chartjs-adapter-date-fns` for time-series X-axes
- **Chart Types**: Scatter plots with benchmark zone overlays
- **Features**:
  - Real-time data loading with Alpine.js reactivity
  - Data point overlap handling (time jitter for same-date measurements)
  - Enhanced tooltips showing all pressure levels and benchmark comparisons
  - Professional styling matching laboratory aesthetic

### Key Features
- **Strategic Insights**: Visual trend analysis showing improvement over time
- **Competitive Context**: Clear comparison against activated carbon (500-2,000 m²/g), carbon black (50-1,500 m²/g), synthetic graphite (1-20 m²/g)
- **Interactive Exploration**: Click-to-view sample details and cross-pressure measurements
- **Executive Ready**: Professional visualizations suitable for stakeholder presentations
- **Real Data Integration**: Live results from actual BET, Conductivity, and RAMAN tests

### Performance Data
- **BET Surface Area**: 6 results from 1,240-2,090 m²/g (Nov 2024 - Jan 2025)
- **Conductivity**: 6 results from 16.9-18.8 S/cm at 20kN (May 2025)  
- **RAMAN D/G Ratio**: 5 results at 1.0 D/G (Mar-July 2025)

### Technical Implementation
- **Lazy Loading**: Charts initialize only when Analysis tab is activated
- **Memory Management**: Existing charts destroyed before re-initialization
- **Error Handling**: Graceful fallbacks with comprehensive user feedback
- **Alpine.js Integration**: Reactive data binding with `switchTab()` lifecycle management

> **Process Reference**: For development workflows, troubleshooting, and implementation guides, see [CLAUDE-PROCESS.md](./CLAUDE-PROCESS.md)