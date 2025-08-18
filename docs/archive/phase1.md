# Phase 1: Graphene Admin Control Panel

## Project Overview
A modern, minimal admin control panel for tracking and analyzing the complete graphene production workflow: Biochar synthesis → Graphene production → BET surface area analysis, with advanced lot-based traceability and scientific data management.

## Technology Stack
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (local)
- **ORM**: Prisma
- **Frontend**: Vite + Tailwind CSS + Alpine.js
- **Port**: Frontend 5174, Backend 3000

## Database Schema (Prisma)

### Biochar Production Table
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| experiment_number | String (unique) | Unique experiment identifier - used as reference for graphene |
| test_order | Int? | Manual chronological ordering |
| experiment_date | DateTime? | Experiment date (nullable for unknown) |
| reactor | String? | Reactor used (dropdown: AV1, AV5) |
| raw_material | String? | Source material (dropdown: BAFA neu Hemp Fibre VF, Canadian Rockies Hemp) |
| starting_amount | Decimal? | Starting amount in grams |
| acid_amount | Decimal? | Amount in grams |
| acid_concentration | Decimal? | Percentage concentration |
| acid_molarity | Decimal? | Molar concentration |
| acid_type | String? | Type of acid (dropdown: Sulfuric Acid) |
| temperature | Decimal? | Temperature in °C |
| time | Decimal? | Time in HOURS (not minutes) |
| pressure_initial | Decimal? | Initial pressure in bar |
| pressure_final | Decimal? | Final pressure in bar |
| wash_amount | Decimal? | Wash amount in grams |
| wash_medium | String? | Wash medium (dropdown: Water) |
| output | Decimal? | Output in grams |
| drying_temp | Decimal? | Drying temperature in °C |
| kft_percentage | Decimal? | Karl Fischer Titration % (moisture) |
| comments | Text? | Additional notes |
| created_at | DateTime | Auto timestamp |
| updated_at | DateTime | Auto timestamp |

**Indexes**: test_order, experiment_date, created_at, lot_number
**Lot System**: lot_number field links experiments to BiocharLot table for combination functionality

### Graphene Production Table
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| experiment_number | String (unique) | Unique experiment identifier |
| test_order | Int? | Manual chronological ordering |
| experiment_date | DateTime? | Experiment date (nullable for unknown) |
| oven | String? | Oven identifier (dropdown: A, B, C) |
| quantity | Decimal? | Quantity in grams |
| biochar_experiment | String? | Reference to biochar experiment_number (FOREIGN KEY) |
| biochar_lot_number | String? | Reference to biochar lot_number (FOREIGN KEY) |
| base_amount | Decimal? | Base amount in grams |
| base_type | String? | Type of base (dropdown: KOH) |
| base_concentration | Decimal? | Base concentration % |
| grinding_method | Enum? | 'manual' or 'mill' |
| grinding_time | Decimal? | Time in minutes if mill is used |
| homogeneous | Boolean? | Yes/No for homogeneity |
| gas | String? | Gas type used (dropdown: Ar, N2) |
| temp_rate | String? | Temperature rate (e.g., "20-27°C/min") |
| temp_max | Decimal? | Maximum temperature in °C |
| time | Decimal? | Time in minutes |
| wash_amount | Decimal? | Wash amount in grams |
| wash_solution | String? | Wash solution (dropdown: HCl) |
| wash_concentration | Decimal? | Wash compound concentration % |
| wash_water | String? | Additional water wash (dropdown: + Water) |
| drying_temp | Decimal? | Drying temperature in °C |
| drying_atmosphere | String? | Drying atmosphere (dropdown: N2 stream) |
| drying_pressure | String? | Drying pressure (dropdown: atm. Pressure) |
| volume_ml | Decimal? | Volume in milliliters |
| density | Decimal? | Density in ml/g |
| species | String? | Species classification (dropdown: 1, 2, 1/2 Mix, Mostly 1, Mostly 2, Mostly 1/2 Mix, 1 + Fibres) |
| appearance_tags | String[] | Array of appearance tags (multiselect) |
| output | Decimal? | Output in grams (positioned at end of form) |
| comments | Text? | Additional notes |
| created_at | DateTime | Auto timestamp |
| updated_at | DateTime | Auto timestamp |

**Relationships**: 
- biocharExperimentRef (biochar_experiment → Biochar.experiment_number)
- biocharLotRef (biochar_lot_number → BiocharLot.lot_number)
- betTests (one-to-many → BET.graphene_sample)
**Indexes**: biochar_experiment, biochar_lot_number, test_order, experiment_date, created_at

### BiocharLot Table (Lot Management)
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| lot_number | String (unique) | Unique lot identifier (user-defined) |
| lot_name | String? | Optional descriptive name |
| description | Text? | Optional lot description |
| created_at | DateTime | Auto timestamp |
| updated_at | DateTime | Auto timestamp |

**Relationships**: experiments (one-to-many → Biochar.lot_number), grapheneProductions (one-to-many → Graphene.biochar_lot_number)
**Purpose**: Allows combining multiple biochar experiments into logical lots for graphene production

### BET Surface Area Analysis Table
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| test_date | DateTime? | Test date (nullable for unknown) |
| graphene_sample | String? | Reference to graphene experiment_number (FOREIGN KEY) |
| multipoint_bet_area | Decimal(10,4)? | Multipoint BET surface area (m²/g) |
| langmuir_surface_area | Decimal(10,4)? | Langmuir surface area (m²/g) |
| species | String? | Species classification (from graphene dropdown) |
| comments | Text? | Additional notes |
| created_at | DateTime | Auto timestamp |
| updated_at | DateTime | Auto timestamp |

**Relationship**: grapheneRef (graphene_sample → Graphene.experiment_number)
**Indexes**: graphene_sample, test_date, created_at
**Scientific Notation**: Supports values like 1.520e3 (1.520 × 10³) for surface area measurements

## Critical Architecture Decisions

### Data Flow & Relationships
1. **Biochar → Graphene**: One-to-many via experiment_number OR lot_number (flexible referencing)
2. **Biochar → Lots**: Many biochar experiments can be combined into named lots
3. **Graphene → BET**: One-to-many via experiment_number (graphene samples feed BET analysis)
4. **Dual Reference System**: Graphene can reference either individual biochar experiments OR combined lots
5. **Chronological Ordering**: test_order field handles historical data without dates for biochar and graphene tables
6. **Dropdown Architecture**: All major fields use controlled vocabularies with "Add New" capability
7. **Appearance Tags**: Multi-select tag system with predefined options (Shiny, Somewhat Shiny, Barely Shiny, Black, Black/Grey, Voluminous, Very Voluminous)
8. **Scientific Data Handling**: BET table supports scientific notation for large surface area values

### Sorting Logic (API)
Records sorted by: `test_order ASC` → `experiment_date ASC` → `created_at ASC` (nulls last)

### Key UI Patterns
1. **Biochar Interface**
   - Advanced CRUD interface WITH lot combination functionality
   - Copy button for quick record duplication with auto-incremented test order
   - Checkbox selection system for multi-experiment lot creation
   - Two-tier table headers with separate columns for acid properties, temperature, pressure
   - Visual indicators: Blue highlighting for experiments assigned to lots
   - "Combine into Lot" button with modal for lot creation (lot number, name, description)
   - "Unknown" date checkbox for records without known experiment dates
   - All major fields are dropdowns with extensible options
   - Starting amount field for raw material input
   - Time displayed in hours (not minutes)
   - Individual columns for: Acid Amt, Acid %, Molarity, Acid Type, Temp, Time, P Initial, P Final
   
2. **Graphene Interface**
   - Dual-source dropdown: Shows BOTH individual biochar experiments AND combined lots
   - Two-tier table header system for organized data display
   - Enhanced Results section with automatic Output % calculation (output/quantity × 100)
   - Appearance tags with multi-select interface (20-item limit with memory protection)
   - "Unknown" date checkbox for records without known experiment dates
   - Homogeneous Yes/No dropdown after grinding
   - Enhanced wash section (amount, solution, concentration%, water)
   - Drying pressure as dropdown with "atm. Pressure" default
   - Output field positioned at end of form
   - Volume (ml) and Density (ml/g) fields
   - Grinding time only enabled when method="mill"
   - Separate columns for all base properties instead of concatenated display
   - Defensive null checking on all array operations
   
3. **BET Interface**
   - Clean CRUD interface for surface area analysis data
   - Graphene sample dropdown populated from existing graphene experiments
   - Scientific notation input support (1.520e3 or 1520)
   - Species dropdown shared with graphene form options
   - Test date with "Unknown" checkbox option
   - Automatic formatting of large numbers in scientific notation display

4. **Form Architecture**
   - All forms support both Add/Edit modes with copy functionality
   - Dropdowns auto-populate from existing data + predefined options
   - Modal system for adding new dropdown values
   - Enhanced form validation with memory leak prevention
   - Array bounds checking (20-item limit on appearance tags)
   - Defensive null checking on all array operations
   - Proper null handling for empty numeric fields
   - "Unknown" date checkbox handling for historical records
   - Auto-save on form submission with proper error handling

### Dropdown Data Sources
**Biochar**: rawMaterials, acidTypes, reactors, washMediums
**Graphene**: ovens, baseTypes, gases (Ar, N2), washSolutions, washWaters, dryingAtmospheres, dryingPressures, species, appearanceTags
**Shared**: All maintain session-level persistence with database integration

### Two-Tier Table Structure (Graphene)
**Main Headers** (bg-gray-100, darker): Base, Grinding, Temperature, Wash, Drying, Results
**Sub-Headers** (bg-gray-50, lighter): Specific fields under each section
- Base: Amount, Type, Concentration%
- Grinding: Method, Time
- Temperature: Rate, Max, Time
- Wash: Amount, Solution, Concentration%, Water
- Drying: Temp, Atmosphere, Pressure
- Results: Volume(ml), Density, Output(g)

## Design System

### Color Palette (Monochrome)
- Primary Background: `#FFFFFF`
- Secondary Background: `#F9FAFB`
- Border: `#E5E7EB`
- Text Primary: `#111827`
- Text Secondary: `#6B7280`
- Accent/Focus: `#000000`

### Typography
- Font Family: `system-ui, -apple-system, sans-serif`
- Data Tables: `monospace` for numbers
- Headers: Bold weight, increased size
- Body: Regular weight, base size

### UI Components
- **Tables**: Clean borders, hover states, alternating row colors
- **Forms**: Minimal inputs with subtle borders
- **Buttons**: Ghost and solid variants, minimal shadows
- **Layout**: 8px grid system, consistent spacing

## Project Structure
```
graphene/
├── server/
│   ├── index.js                 # Express server with multer file handling
│   ├── routes/
│   │   ├── biochar.js           # Biochar CRUD + lot management
│   │   ├── graphene.js          # Graphene CRUD + SEM PDF uploads
│   │   └── bet.js               # BET Analysis CRUD
│   └── middleware/
│       └── errorHandler.js      # Centralized error handling
├── prisma/
│   ├── schema.prisma            # Database schema (4 models with relationships)
│   └── migrations/              # Database migrations
├── client/
│   ├── index.html               # Main HTML (1503 lines, 3 tabs + modals)
│   ├── src/
│   │   ├── styles/
│   │   │   └── main.css         # Tailwind CSS
│   │   ├── js/
│   │   │   ├── app-refactored.js    # Modular Alpine.js app (450 lines)
│   │   │   ├── app-original.js      # Backup of monolithic version
│   │   │   ├── services/
│   │   │   │   └── api.js           # Centralized API layer (170 lines)
│   │   │   └── utils/
│   │   │       ├── formatters.js    # Data formatting (120 lines)
│   │   │       ├── validators.js    # Form validation (160 lines)
│   │   │       └── dataHelpers.js   # Data utilities (140 lines)
│   │   └── components/          # Reserved for future component extraction
│   └── dist/                    # Build output
├── uploads/
│   └── sem-reports/             # SEM PDF storage
├── docker-compose.yml           # PostgreSQL container
├── package.json                 # Dependencies (includes multer)
├── REFACTORING.md               # Refactoring documentation
├── phase1.md                    # This documentation file
├── README.md                    # Project README
└── .gitignore
```

## Implementation Timeline

### Week 1: Infrastructure Setup
- [x] Project planning and requirements
- [ ] Initialize Node.js project
- [ ] Setup PostgreSQL with Docker
- [ ] Configure Prisma ORM
- [ ] Create database schemas and migrations

### Week 2: Backend Development
- [ ] Build Express server
- [ ] Create API routes for Biochar
- [ ] Create API routes for Graphene
- [ ] Implement data validation
- [ ] Add export functionality

### Week 3: Frontend Development
- [ ] Setup Vite and Tailwind
- [ ] Create table components
- [ ] Implement inline editing
- [ ] Add filtering and sorting
- [ ] Build data entry forms

### Week 4: Testing and Polish
- [ ] Data validation testing
- [ ] UI responsiveness
- [ ] Performance optimization
- [ ] Documentation
- [ ] Deployment preparation

## API Endpoints

### Biochar Endpoints
- `GET /api/biochar?sortBy=chronological&order=asc&search=term` - List with smart sorting
- `GET /api/biochar/lots` - Get all biochar lots with experiment counts
- `GET /api/biochar/export/csv` - Export to CSV
- `GET /api/biochar/:id` - Get single record
- `POST /api/biochar` - Create new record
- `POST /api/biochar/combine-lot` - Combine experiments into lots
- `PUT /api/biochar/:id` - Update record
- `DELETE /api/biochar/:id` - Delete record

### Graphene Endpoints
- `GET /api/graphene?sortBy=chronological&order=asc&search=term&biocharExperiment=exp` - List with filtering
- `GET /api/graphene/export/csv` - Export to CSV
- `GET /api/graphene/by-biochar/:biocharExperiment` - Get by biochar experiment
- `GET /api/graphene/:id` - Get single record
- `POST /api/graphene` - Create new record
- `PUT /api/graphene/:id` - Update record
- `DELETE /api/graphene/:id` - Delete record

### BET Analysis Endpoints
- `GET /api/bet?sortBy=chronological&order=asc&search=term` - List with smart sorting
- `GET /api/bet/export/csv` - Export to CSV
- `GET /api/bet/:id` - Get single record
- `POST /api/bet` - Create new record
- `PUT /api/bet/:id` - Update record
- `DELETE /api/bet/:id` - Delete record

### Critical API Behaviors
- **Chronological sorting**: Default sortBy='chronological' uses multi-field ordering
- **Search**: Full-text search across experiment_number, biochar_experiment, comments, material fields
- **Experiment enforcement**: Graphene biochar_experiment must exist in Biochar table
- **Null handling**: Empty numeric fields properly converted to null (not empty strings)

## Future Phases

### Phase 2: Enhanced Import/Export
- Direct spreadsheet upload (Excel/CSV)
- Bulk data import with validation
- Advanced export options
- Data templates

### Phase 3: Analytics and Visualization
- Comparative analysis tools
- Time-series visualizations
- Yield calculations
- Process optimization metrics

### Phase 4: Advanced Features
- User authentication and roles
- Audit logging
- API integration
- Machine learning insights
- Predictive analytics

## Success Metrics
- Clean, intuitive interface
- < 2 second page load times
- Zero data loss
- Accurate lot number tracking
- Efficient data entry workflow

## Recent Updates (Latest)

### SEM Report Integration
- **PDF Upload**: Graphene records now support SEM report PDF attachments (max 10MB)
- **File Management**: Automatic cleanup on record deletion/update
- **Viewer Modal**: Large format modal for viewing PDFs inline
- **Storage**: Files stored in `/uploads/sem-reports/` with unique timestamps

### Research Team Tracking
- **New Field**: Added to both Biochar and Graphene tables
- **Default Value**: "Curia - Germany" pre-selected
- **Extensible**: Dropdown with "Add New Team" functionality

### Code Refactoring (Modular Architecture)
- **API Service Layer**: All HTTP requests centralized in `services/api.js`
- **Utility Functions**: Extracted formatters, validators, and data helpers
- **Reduced Complexity**: Main app reduced from 829 to 450 lines (45% reduction)
- **ES6 Modules**: Modern JavaScript module system for better tree-shaking
- **Backward Compatible**: Original `app.js` backed up, can rollback instantly

## Implementation Status: COMPLETE

### Current State
- ✅ Full CRUD operations for all three tables (Biochar, Graphene, BET)
- ✅ Complete BET Analysis tab with surface area measurements
- ✅ Dropdown system with extensible vocabularies
- ✅ Lot-based traceability (Biochar → Graphene → BET)
- ✅ Experiment combination into lots
- ✅ Copy functionality for quick record duplication
- ✅ Chronological ordering system (test_order + dates)
- ✅ Search and export functionality for all tables
- ✅ Enhanced form validation and memory protection
- ✅ Unknown date handling with checkbox options
- ✅ Scientific notation support for BET measurements
- ✅ Responsive monochrome UI

### Key Implementation Notes
- **Database**: PostgreSQL local, Prisma ORM with migrations applied
- **Lot Numbers**: Unique in Biochar, foreign key in Graphene (enforced at UI level)
- **KFT**: Karl Fischer Titration measures moisture content percentage
- **Test Order**: Manual integer for chronological sorting when dates unknown
- **Species**: Fixed scientific classifications for graphene characterization
- **Combine Feature**: Multiple biochar experiments → single lot via UI checkboxes
- **Copy Feature**: Duplicate existing records with auto-incremented test order
- **Memory Protection**: Array bounds checking and defensive null handling
- **BET Integration**: Full surface area analysis workflow with graphene sample linking

### Startup Sequence
1. `npm install` (if packages missing)
2. `createdb graphene_db` (if database missing) 
3. `npx prisma db push` (schema sync)
4. `npm run dev` (starts both frontend:5174 and backend:3000)