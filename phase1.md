# Phase 1: Graphene Admin Control Panel

## Project Overview
A modern, minimal admin control panel for tracking and analyzing the two-stage graphene production process: Biochar synthesis and Graphene production with lot-based traceability.

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

**Indexes**: test_order, experiment_date, created_at
**Note**: No lot_number field - experiment_number serves as the unique identifier

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

**Relationship**: biocharLot (biochar_experiment → Biochar.experiment_number)
**Indexes**: biochar_experiment, test_order, experiment_date, created_at

## Critical Architecture Decisions

### Data Flow & Relationships
1. **Biochar → Graphene**: One-to-many via experiment_number (biochar experiments feed graphene production)
2. **No Lot System**: Removed lot_number concept - direct experiment-to-experiment traceability
3. **Chronological Ordering**: test_order field handles historical data without dates
4. **Dropdown Architecture**: All major fields use controlled vocabularies with "Add New" capability
5. **Appearance Tags**: Multi-select tag system with predefined options (Shiny, Somewhat Shiny, Barely Shiny, Black, Black/Grey, Voluminous, Very Voluminous)

### Sorting Logic (API)
Records sorted by: `test_order ASC` → `experiment_date ASC` → `created_at ASC` (nulls last)

### Key UI Patterns
1. **Biochar Interface**
   - Simple CRUD interface without lot combination
   - All major fields are dropdowns with extensible options
   - Starting amount field for raw material input
   - Time displayed in hours (not minutes)
   
2. **Graphene Interface**
   - Biochar experiment dropdown ONLY shows biochar experiment numbers
   - Two-tier table header system for organized data display
   - Appearance tags with multi-select interface
   - Homogeneous Yes/No dropdown after grinding
   - Enhanced wash section (amount, solution, concentration%, water)
   - Drying pressure as dropdown with "atm. Pressure" default
   - Output field positioned at end of form
   - Volume (ml) and Density (ml/g) fields
   - Grinding time only enabled when method="mill"

3. **Form Architecture**
   - All forms support both Add/Edit modes
   - Dropdowns auto-populate from existing data + predefined options
   - Modal system for adding new dropdown values
   - Proper null handling for empty numeric fields
   - Auto-save on form submission

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
│   ├── index.js                 # Express server entry
│   ├── routes/
│   │   ├── biochar.js           # Biochar CRUD endpoints
│   │   └── graphene.js          # Graphene CRUD endpoints
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Database migrations
│   └── middleware/
│       └── errorHandler.js      # Error handling
├── client/
│   ├── index.html               # Main HTML entry
│   ├── src/
│   │   ├── styles/
│   │   │   └── main.css         # Tailwind CSS
│   │   ├── js/
│   │   │   ├── app.js           # Main application
│   │   │   ├── biochar.js       # Biochar table logic
│   │   │   └── graphene.js      # Graphene table logic
│   │   └── components/
│   │       ├── table.js         # Reusable table component
│   │       └── forms.js         # Form components
│   └── dist/                    # Build output
├── docker-compose.yml           # PostgreSQL container
├── package.json                 # Dependencies
├── .env.example                 # Environment variables
├── .gitignore
└── README.md
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
- `GET /api/biochar/:id` - Get single record
- `POST /api/biochar` - Create new record
- `PUT /api/biochar/:id` - Update record
- `DELETE /api/biochar/:id` - Delete record
- `GET /api/biochar/export/csv` - Export to CSV

### Graphene Endpoints
- `GET /api/graphene?sortBy=chronological&order=asc&search=term&biocharExperiment=exp` - List with filtering
- `GET /api/graphene/:id` - Get single record
- `POST /api/graphene` - Create new record
- `PUT /api/graphene/:id` - Update record
- `DELETE /api/graphene/:id` - Delete record
- `GET /api/graphene/export/csv` - Export to CSV
- `GET /api/graphene/by-biochar/:biocharExperiment` - Get by biochar experiment

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

## Implementation Status: COMPLETE

### Current State
- ✅ Full CRUD operations for both tables
- ✅ Dropdown system with extensible vocabularies
- ✅ Lot-based traceability (Biochar → Graphene)
- ✅ Experiment combination into lots
- ✅ Chronological ordering system (test_order + dates)
- ✅ Search and export functionality
- ✅ Responsive monochrome UI

### Key Implementation Notes
- **Database**: PostgreSQL local, Prisma ORM with migrations applied
- **Lot Numbers**: Unique in Biochar, foreign key in Graphene (enforced at UI level)
- **KFT**: Karl Fischer Titration measures moisture content percentage
- **Test Order**: Manual integer for chronological sorting when dates unknown
- **Species**: Fixed scientific classifications for graphene characterization
- **Combine Feature**: Multiple biochar experiments → single lot via UI checkboxes

### Startup Sequence
1. `npm install` (if packages missing)
2. `createdb graphene_db` (if database missing) 
3. `npx prisma db push` (schema sync)
4. `npm run dev` (starts both frontend:5174 and backend:3000)