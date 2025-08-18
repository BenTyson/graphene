# HGraphene Production Control System

## Quick Start for Claude Agents

### System Overview
**Purpose**: Track and analyze the complete graphene production workflow from biochar synthesis through BET surface area analysis with lot-based traceability, SEM report management, and research team tracking.

**Tech Stack**: Node.js + Express + PostgreSQL + Prisma + Alpine.js + Tailwind CSS

**Key Files for Understanding**:
1. `/phase1.md` - Complete technical specification and architecture
2. `/prisma/schema.prisma` - Database structure and relationships  
3. `/client/src/js/app-refactored.js` - Main application logic (modular)
4. `/server/routes/` - API endpoints for each table

### Critical Context
- **Production Flow**: Biochar → Graphene → BET Analysis
- **Lot System**: Multiple biochar experiments can be combined into lots
- **Research Teams**: Default is "Curia - Germany" 
- **SEM Reports**: PDF attachments for graphene experiments
- **Time Units**: Biochar uses HOURS, Graphene uses MINUTES

## Core Features

- **Three-Stage Tracking**: Biochar → Graphene → BET Analysis
- **SEM Integration**: PDF upload/view for graphene experiments  
- **Research Team Tracking**: Default "Curia - Germany" with extensible dropdown
- **Lot Management**: Combine multiple biochar experiments for batch processing
- **Scientific Notation**: BET supports values like 1.520e3 for surface areas
- **Modular Architecture**: ES6 modules for maintainable code
- **File Management**: Automatic PDF cleanup on record deletion
- **Memory Protection**: Array bounds checking and defensive programming

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Frontend**: Vite + Tailwind CSS + Alpine.js

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

## Installation

1. **Clone the repository**
   ```bash
   cd /Users/bentyson/graphene
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Start PostgreSQL database**
   ```bash
   docker-compose up -d
   ```

5. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5174
- API: http://localhost:3000

## Project Structure

```
graphene/
├── server/                 # Backend (Express + Prisma)
│   ├── routes/            # API endpoints (biochar, graphene, bet)
│   └── middleware/        # Error handling
├── client/                # Frontend (Alpine.js + Tailwind)
│   ├── index.html        # Main UI (3 tabs + modals)
│   └── src/js/           # Modular JavaScript
│       ├── app-refactored.js  # Main app (450 lines)
│       ├── app-original.js    # Backup monolithic version
│       ├── services/         # API layer (170 lines)
│       └── utils/           # Formatters & validators (420 lines)
├── prisma/               # Database
│   └── schema.prisma    # 4 models with relationships
├── uploads/              # File storage
│   └── sem-reports/     # PDF attachments
├── REFACTORING.md       # Modular architecture guide
├── phase1.md            # COMPLETE SPECIFICATION
└── docker-compose.yml   # PostgreSQL setup
```

## API Endpoints

### Biochar
- `GET /api/biochar` - List with search/sort
- `POST /api/biochar` - Create record
- `PUT /api/biochar/:id` - Update record  
- `DELETE /api/biochar/:id` - Delete record
- `POST /api/biochar/combine-lot` - Create lot from experiments
- `GET /api/biochar/lots` - Get all lots
- `GET /api/biochar/export/csv` - Export to CSV

### Graphene (with SEM PDF support)
- `GET /api/graphene` - List with search/sort
- `POST /api/graphene` - Create (supports file upload)
- `PUT /api/graphene/:id` - Update (supports file upload)
- `DELETE /api/graphene/:id` - Delete (removes PDF)
- `GET /api/graphene/export/csv` - Export to CSV

### BET Analysis
- `GET /api/bet` - List with search/sort
- `POST /api/bet` - Create record
- `PUT /api/bet/:id` - Update record
- `DELETE /api/bet/:id` - Delete record
- `GET /api/bet/export/csv` - Export to CSV

## Database Management

```bash
# View database in Prisma Studio
npm run db:studio

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset
```

## Development

```bash
# Run development server
npm run dev

# Run only backend
npm run server:dev

# Run only frontend
npm run client:dev

# Build for production
npm run build
```

## Production Deployment

1. Build the application
   ```bash
   npm run build
   ```

2. Set production environment variables
   ```bash
   NODE_ENV=production
   DATABASE_URL=your_production_database_url
   ```

3. Start production server
   ```bash
   node server/index.js
   ```

## Database Schema (4 Tables)

### 1. Biochar Production
- **Core**: experimentNumber, researchTeam, testOrder, experimentDate
- **Material**: reactor, rawMaterial, startingAmount
- **Acid**: acidAmount, acidConcentration, acidMolarity, acidType
- **Process**: temperature, time (HOURS), pressureInitial, pressureFinal
- **Output**: washAmount, washMedium, output, dryingTemp, kftPercentage
- **Grouping**: lotNumber (links to BiocharLot table)

### 2. Graphene Production  
- **Core**: experimentNumber, researchTeam, testOrder, experimentDate
- **Setup**: oven, quantity, biocharExperiment OR biocharLotNumber
- **Base**: baseAmount, baseType, baseConcentration
- **Grinding**: grindingMethod (manual/mill), grindingTime, homogeneous
- **Temperature**: gas, tempRate, tempMax, time (MINUTES)
- **Wash**: washAmount, washSolution, washConcentration, washWater
- **Drying**: dryingTemp, dryingAtmosphere, dryingPressure
- **Results**: volumeMl, density, species, appearanceTags[], output
- **Files**: semReportPath (PDF storage path)

### 3. BET Analysis
- **Core**: testDate, grapheneSample (links to Graphene)
- **Measurements**: multipointBetArea, langmuirSurfaceArea (scientific notation)
- **Classification**: species, comments

### 4. BiocharLot (Grouping)
- **Core**: lotNumber, lotName, description
- **Relationships**: Links multiple Biochar experiments

## Common Tasks for Claude Agents

### Adding a New Field
1. Update Prisma schema in `/prisma/schema.prisma`
2. Run `npx prisma db push` to update database
3. Add field to form in `/client/index.html`
4. Update form object in `/client/src/js/app-refactored.js`
5. Add to validators if numeric in `/client/src/js/utils/validators.js`

### Adding a New Dropdown
1. Add array to app initialization (line ~90 in app-refactored.js)
2. Create modal for adding new values in HTML
3. Add method for adding new dropdown value
4. Connect to form field with change handler

### Debugging
- **Check Backend**: `curl http://localhost:3000/api/health`
- **View Logs**: Backend logs to console
- **Database Issues**: `npx prisma studio` for GUI  
- **File Issues**: Check `/uploads/sem-reports/` permissions

### Code Architecture  
- **app-refactored.js**: Main Alpine.js application (450 lines)
- **services/api.js**: Centralized API calls (170 lines)
- **utils/formatters.js**: Data formatting functions (120 lines)
- **utils/validators.js**: Form validation logic (160 lines)
- **utils/dataHelpers.js**: Data manipulation utilities (140 lines)

### Rollback Instructions
If refactored code has issues:
1. Change `app-refactored.js` to `app-original.js` in HTML
2. Remove `type="module"` from script tag
3. Original functionality restored

## Future Enhancements

- Phase 2: Direct spreadsheet upload
- Phase 3: Comparative analysis tools
- Phase 4: Pattern recognition and ML insights

## License

ISC