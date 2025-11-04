# Database Schema Reference

Quick access to the complete Prisma database schema for the Graphene Production Control System.

## Instructions

Read the complete database schema documentation:

**Primary Reference**: `/docs/core-reference/DATABASE-SCHEMA.md`

This file contains:
- Complete Prisma schema (all models and relationships)
- Model descriptions and purposes
- Field definitions and constraints
- Relationship diagrams
- Design principles
- Common database operations

## Quick Schema Access

**Direct schema file**: `/prisma/schema.prisma` (727 lines)

## Material Pipeline Overview

```
Raw Materials → Biochar → Graphene → Compound Batch/Micronization → Testing → Shipment
```

## Core Models Summary

### Production Models
- **Biochar**: Raw material experiments (reactor processing)
- **BiocharLot**: Batch tracking for biochar
- **Graphene**: Graphene production from biochar
- **CompoundBatch**: Grouped graphene experiments
- **Micronization**: Micronization processing records

### Testing Models (All support dual referencing)
- **BET**: Surface area measurements
- **ConductivityTest**: Electrical conductivity at multiple pressures
- **RamanTest**: Raman spectroscopy (32-field matrix)
- **TEMTest**: TEM microscopy analysis

### Report Models
- **UpdateReport**: Weekly update PDFs
- **SemReport**: SEM imaging reports

### Shipment Models
- **MaterialShipment**: Shipment tracking (triple reference support)

### News & AI Models
- **NewsSource**: RSS feed sources
- **NewsArticle**: News with GPT-4 summarization
- **KnowledgeDocument**: Research papers with AI processing

### Authentication
- **User**: User accounts with role-based access

### References
- **CharacterizationReference**: External benchmarks (Dr. Li, ISO, ASTM, GEIC)

## Key Relationships

### Dual Referencing Architecture
Tests can reference **either**:
- Individual Graphene experiments (via `grapheneSample`)
- Compound Batches (via `compoundBatchNumber`)

### Triple Shipment Architecture
Shipments can reference:
- Graphene experiments (via `grapheneSample`)
- Compound Batches (via `compoundBatchNumber`)
- Micronization SKUs (via `micronizationSku`)

## Important Schema Notes

### Time Units
- **Biochar**: Time in HOURS
- **Graphene**: Time in MINUTES

### Unique Constraints
- **experimentNumber**: Unique per table (Biochar, Graphene)
- **batchNumber**: Unique in CompoundBatch
- **lotNumber**: Unique in BiocharLot
- **sku**: Unique in Micronization
- **username, email**: Unique in User

### Scientific Notation
- BET surface area supports format: `1.88e3` (displayed as 1.88 × 10³)

### File Storage
- **Development**: Cloudinary CDN (`graphene-uploads-dev`)
- **Production**: Cloudinary CDN (`graphene-uploads`)
- **Database**: Stores full Cloudinary URLs

## Common Prisma Commands

```bash
# View schema in GUI
npx prisma studio

# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema changes to database (development)
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset
```

## Database Backup

**Always backup before schema changes:**

```bash
npm run backup:create "description of changes"
```

Backups saved to: `/backups/graphene_backup_YYYY-MM-DDTHH-MM-SS.sql`

## Related Documentation

- **API Reference**: `/docs/core-reference/API-REFERENCE.md`
- **Architecture Overview**: `/docs/core-reference/ARCHITECTURE.md`
- **Session Start Guide**: `/docs/session-start/SESSION-START.md`

## Prisma Studio

Open interactive database GUI:

```bash
npx prisma studio
```

Access at: `http://localhost:5555`

**Features:**
- Browse all tables
- View relationships
- Edit data directly
- Test queries
- Export data

---

**Schema Location**: `/prisma/schema.prisma`
**Documentation**: `/docs/core-reference/DATABASE-SCHEMA.md`
**Last Updated**: January 2025
