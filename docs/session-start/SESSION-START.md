# Session Start Guide

**Quick Context Loading for AI Agents** - Read this first for rapid codebase understanding.

---

## 🎯 System Overview

**Graphene Production Control System** - Full-stack web app tracking the complete material journey from biochar → graphene → compound batch/micronization → testing → shipment.

**Tech Stack:**
- Backend: Node.js + Express + Prisma ORM
- Database: PostgreSQL
- Frontend: Alpine.js + Tailwind CSS + Chart.js
- Build: Vite (Frontend: 5174, Backend: 3000)

---

## 🚨 CRITICAL: Deployment Workflow

**ALWAYS DEPLOY TO STAGING FIRST!**

### Environments
1. **Local**: `localhost:5174` (PostgreSQL local)
2. **Staging**: Railway staging environment (Test here first!)
3. **Production**: `admin.hgraphene.com` (Railway main branch)

### Branch Strategy
- **`staging`** ← Work here! Test all changes in staging first
- **`main`** ← Production only (merge from staging after testing)

### Standard Workflow
```bash
# 1. Work on staging branch
git checkout staging
# ... make changes ...

# 2. Push to staging for testing
git push origin staging

# 3. After testing passes, merge to production
git checkout main && git merge staging && git push origin main
```

**⚠️ Never deploy directly to main without staging testing!**

---

## 📊 Database Schema (Core Models)

Full schema: [/prisma/schema.prisma](/prisma/schema.prisma) or [DATABASE-SCHEMA.md](../core-reference/DATABASE-SCHEMA.md)

### Material Production Pipeline
```
Biochar → Graphene → CompoundBatch/Micronization → Tests → Shipments
```

#### Core Tables

**Biochar** (biochar experiments)
- `experimentNumber` (unique) - Primary identifier
- Links to: `BiocharLot`, `Graphene` (one-to-many)
- Key fields: reactor, rawMaterial, temperature, time, acid details

**Graphene** (graphene production)
- `experimentNumber` (unique) - Primary identifier
- Links to: `Biochar` (source), `CompoundBatch`, tests, shipments
- Key fields: oven, baseType, temperature, grindingMethod, output

**CompoundBatch** (compound batches)
- `batchNumber` (unique) - Primary identifier
- Links to: `Graphene` (many-to-many), tests, shipments, micronization
- Key fields: batchName, totalOutput, createdDate

**Micronization** (micronization processes)
- `micronizationNumber` (unique), `sku` (unique)
- Links to: `Graphene`, `CompoundBatch`, `MaterialShipment`
- Key fields: dx50, grindPressure, recoveredAmount

#### Testing Models
- **BET**: Surface area testing (multipointBetArea, langmuirSurfaceArea)
- **ConductivityTest**: Conductivity at 1kN, 8kN, 12kN, 20kN
- **RamanTest**: Raman spectroscopy (D, G, 2D peak analysis)
- **TEMTest**: TEM microscopy analysis

#### Reports & Shipments
- **UpdateReport**: Weekly update reports (many-to-many with Graphene/CompoundBatch)
- **SemReport**: SEM imaging reports (many-to-many with Graphene/CompoundBatch)
- **MaterialShipment**: Shipment tracking with locations, dates, status

#### News & AI Systems
- **NewsArticle**: RSS aggregation with GPT-4 summarization
- **KnowledgeDocument**: Research papers, patents with AI processing

#### Users & References
- **User**: Authentication (roles: SUPER_ADMIN, SCIENCE_TEAM, etc.)
- **CharacterizationReference**: External benchmarks (Dr. Li, ISO, ASTM, GEIC)

---

## 📁 Key File Locations

### Backend
- **Server Entry**: `server/index.js`
- **Routes**: `server/routes/*.js` (biochar, graphene, bet, conductivity, etc.)
- **Database Schema**: `prisma/schema.prisma`

### Frontend
- **Main App**: `client/src/js/app-refactored.js` (4,050 lines)
- **Services** (Service-oriented architecture):
  - `client/src/js/services/api.js` - API client
  - `client/src/js/services/AuthService.js` - Authentication
  - `client/src/js/services/CRUDService.js` - All CRUD operations
  - `client/src/js/services/NewsService.js` - News system
  - `client/src/js/services/FilterService.js` - Filtering
  - `client/src/js/services/DashboardService.js` - Dashboard data
- **Components**: `client/src/js/components/` (30+ modular UI components)
- **Modals**: `client/src/js/components/modals/` (GrapheneModal, BiocharModal, etc.)

### Configuration
- **Railway**: `railway.json`, `nixpacks.toml`
- **Startup**: `scripts/railway-startup.sh`
- **Cloudinary**: `.env.cloudinary` (production credentials)

---

## 🔧 Common Commands

### Development
```bash
npm run dev              # Start local dev server
npm run build            # Build for production
```

### Database
```bash
npx prisma migrate dev   # Run migrations (dev)
npx prisma studio        # Open Prisma Studio
npm run backup:create    # Create database backup
```

### Git
```bash
git status                              # Check working tree
git log --oneline --graph --all         # View branch history
git log --oneline staging ^main         # Check staging commits not in main
git checkout staging && git merge main  # Sync staging with main
```

### Railway
```bash
railway logs             # View deployment logs
railway run bash         # SSH into service
```

---

## 🛠️ Quick Troubleshooting

**Before starting any work:**
1. ✅ Verify branch: `git status` (should be on `staging`)
2. ✅ Create backup: `npm run backup:create`
3. ✅ Check sync: `git log --oneline --graph --all`

**Common Issues:**
- File uploads not working → Check Cloudinary configuration
- Database errors → Check `DATABASE_URL` in environment
- Deployment fails → Check Railway logs and environment variables
- Tests failing → Run `npm run test` locally first

**Full troubleshooting guide:** [/workflows/TROUBLESHOOTING.md](../workflows/TROUBLESHOOTING.md)

---

## 📚 Deep Documentation Links

### For Development Work
- **[GIT-WORKFLOW.md](GIT-WORKFLOW.md)** - Complete branch strategy and recovery commands
- **[DEVELOPMENT.md](../workflows/DEVELOPMENT.md)** - Local dev setup and workflows
- **[DEPLOYMENT.md](../workflows/DEPLOYMENT.md)** - Full staging/production deployment guide

### For Technical Reference
- **[ARCHITECTURE.md](../core-reference/ARCHITECTURE.md)** - System architecture overview
- **[DATABASE-SCHEMA.md](../core-reference/DATABASE-SCHEMA.md)** - Complete Prisma schema
- **[API-REFERENCE.md](../core-reference/API-REFERENCE.md)** - All REST endpoints
- **[COMPONENT-SYSTEM.md](../core-reference/COMPONENT-SYSTEM.md)** - UI component library

### For Features
- **[AI-INSIGHTS.md](../features/AI-INSIGHTS.md)** - GPT-4 integration and knowledge base
- **[NEWS-SYSTEM.md](../features/NEWS-SYSTEM.md)** - RSS aggregation and summarization
- **[CHARACTERIZATION-ANALYSIS.md](../features/CHARACTERIZATION-ANALYSIS.md)** - Comparison charts

---

## 💾 Backup Before Major Changes

**ALWAYS create backups before:**
- Database schema changes
- Major refactors
- Deployment to production

```bash
npm run backup:create "Description of what you're about to do"
```

Backups saved to: `/backups/graphene_backup_YYYY-MM-DDTHH-MM-SS.sql`

---

## 🌐 Cloudinary Structure

```
cloudinary.com/your-account/
├── graphene-uploads/         # Production files
├── graphene-uploads-staging/ # Staging files
└── graphene-uploads-dev/     # Development files
```

**Important:** Each environment has separate folders - never mix!

---

## 🔐 Environment Variables

Critical variables (set in Railway for staging/production):
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - "staging" or "production"
- `JWT_SECRET` - Authentication secret
- `OPENAI_API_KEY` - GPT-4 API access
- `CLOUDINARY_*` - Cloudinary credentials
- `USE_CLOUDINARY=true` - Enable cloud storage

---

## ✅ Session Start Checklist

Before starting work:
- [ ] Read this document (SESSION-START.md)
- [ ] Check current branch: `git status`
- [ ] Verify on staging branch (or switch: `git checkout staging`)
- [ ] Review database schema if working with data
- [ ] Create backup if making major changes
- [ ] Read relevant feature docs in `/features/`

---

**Last Updated:** November 2025
**For Questions:** Check [README.md](../README.md) for full documentation map
