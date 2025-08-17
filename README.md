# Graphene Admin Panel

A modern, minimal admin control panel for tracking and analyzing Graphene SEM test results through a two-stage production process.

## Features

- **Dual Process Tracking**: Separate management for Biochar and Graphene production
- **Dynamic Data Entry**: Inline editing with comprehensive field support
- **Data Export**: CSV export functionality for analysis
- **Clean UI**: Monochrome, minimal design focused on data clarity
- **Search & Filter**: Quick search across all fields
- **Lot Tracking**: Link Graphene production to Biochar lots

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
├── server/           # Express backend
│   ├── routes/       # API endpoints
│   └── middleware/   # Express middleware
├── client/           # Frontend application
│   ├── src/          # Source files
│   └── index.html    # Main HTML
├── prisma/           # Database schema
├── docker-compose.yml # PostgreSQL setup
└── phase1.md         # Project planning
```

## API Endpoints

### Biochar
- `GET /api/biochar` - List all records
- `POST /api/biochar` - Create record
- `PUT /api/biochar/:id` - Update record
- `DELETE /api/biochar/:id` - Delete record
- `GET /api/biochar/export/csv` - Export to CSV

### Graphene
- `GET /api/graphene` - List all records
- `POST /api/graphene` - Create record
- `PUT /api/graphene/:id` - Update record
- `DELETE /api/graphene/:id` - Delete record
- `GET /api/graphene/by-lot/:lotNumber` - Get by lot
- `GET /api/graphene/export/csv` - Export to CSV

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

## Data Fields

### Biochar Production
- Experiment Number, Reactor, Raw Material
- Acid properties (amount, concentration, molarity, type)
- Temperature, Time, Pressure (initial/final)
- Wash (amount, medium)
- Output, Lot Number, Drying Temperature
- KFT % (moisture content)

### Graphene Production
- Experiment Number, Oven, Quantity, Lot Number
- Base properties (amount, type, concentration)
- Grinding (method, time)
- Gas, Temperature (rate, max), Time
- Wash (amount, solution)
- Drying (temp, atmosphere, pressure)
- Output, Volume, Species, Appearance

## Future Enhancements

- Phase 2: Direct spreadsheet upload
- Phase 3: Comparative analysis tools
- Phase 4: Pattern recognition and ML insights

## License

ISC