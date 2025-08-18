# HGraphene Production Control System

## Overview
Track and analyze the complete graphene production workflow from biochar synthesis through BET surface area analysis.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev
```

### Access
- Frontend: http://localhost:5174
- Database GUI: `npx prisma studio`

## Key Features

- **Material Journey Tracking**: Click experiment numbers to see complete biochar → graphene → BET journey
- **Lot Management**: Combine multiple biochar experiments into production lots
- **SEM Reports**: PDF upload and viewing for graphene experiments
- **Data Export**: CSV export for all tables
- **Copy/Duplicate**: Quick duplication of similar experiments

## Technology Stack

- **Frontend**: Alpine.js, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: Local filesystem for SEM PDFs

## Documentation

For detailed technical documentation, API references, and troubleshooting:
- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive guide for developers and AI agents

## Project Structure

```
graphene/
├── client/          # Frontend (Alpine.js + Tailwind)
├── server/          # Backend (Express + Prisma)
├── prisma/          # Database schema
├── uploads/         # File storage
└── docs/archive/    # Historical documentation
```

## License
Private - Internal Use Only