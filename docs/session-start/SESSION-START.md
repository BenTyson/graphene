# Session Start Guide

Quick context for AI agents. Read this first, then drill into core-reference/ only if needed.

Last Updated: March 2026

---

## System Overview

**Graphene Production Control System** - Internal admin dashboard tracking the full material pipeline:
Biochar -> Graphene -> CompoundBatch / Micronization -> MCB (optional) -> Tests -> Shipments

**Stack:** Node.js + Express + Prisma (PostgreSQL) | Alpine.js + Tailwind CSS | Vite | Railway

**Ports:** Vite dev: 5174, Express: 3001 (dev) / 3000 (prod). Local dev: use `localhost:5174` (NOT 3001 -- Express serves raw files without Tailwind processing).

---

## Deployment

| Environment | URL | Branch | Database |
|---|---|---|---|
| Local | localhost:5174 | any | Local PostgreSQL |
| Staging | Railway staging | staging | Separate Railway PG |
| Production | admin.hgraphene.com | main | Production Railway PG |

**Workflow:** staging -> test -> merge to main -> auto-deploys to prod. Never push directly to main.

```bash
npm run dev              # Start both servers (Vite + Express)
npm run build            # Production build
npx prisma db push       # Apply schema changes
npx prisma studio        # Database GUI
npm run backup:create    # Backup before major changes
```

---

## Database Models

**Source:** `prisma/schema.prisma`

### Production Pipeline
- **Biochar** -> **Graphene** -> **CompoundBatch** (many-to-many via GrapheneCompoundBatch)
- **Micronization** (references Graphene + CompoundBatch)
- **MicronizedCompoundBatch (MCB)** (groups multiple Micronizations via MicronizationMCB junction)
- **MaterialShipment** (references Graphene, CompoundBatch, Micronization, or MCB)

### Test Types (7 total)
All reference Graphene and/or CompoundBatch by experiment/batch number string.
- **BET** - Surface area (multipointBetArea, langmuirSurfaceArea)
- **ConductivityTest** - Conductivity at 1kN/8kN/12kN/20kN
- **RamanTest** - D, G, 2D peak analysis
- **TEMTest** - TEM microscopy
- **ParticleSizeTest** - d10, d50, d90, span (also references Micronization, MCB)
- **XRDTest** - X-ray diffraction (also references Micronization, MCB)
- **XPSTest** - X-ray photoelectron spectroscopy, extensive elemental composition (also references Micronization, MCB)

### Reports
- **UpdateReport**, **SemReport** - many-to-many with Graphene and CompoundBatch via junction tables

### Task Management
- **Task** - title, description, status (TODO/IN_PROGRESS/IN_REVIEW/DONE/ARCHIVED), priority (LOW/MEDIUM/HIGH/URGENT), dueDate, tags[], position. Self-referencing parentId for subtasks. Links to User (creator, assignee).
- **TaskComment** - content, linked to Task and User (author)
- **TaskActivity** - audit log (action, fromValue, toValue) for all task changes

### Users & Auth
- **User** - JWT auth with bcrypt. Roles: SUPER_ADMIN, SCIENCE_TEAM, EXECUTIVE_TEAM, INVESTOR, TEAM_MEMBER, THIRD_PARTY
- THIRD_PARTY: view-only (all mutations blocked server-side via `requireEditAccess` middleware)
- INVESTOR: excluded from Tasks tab
- **CharacterizationReference** - external benchmarks

### News/AI
- **NewsArticle**, **NewsSource**, **KnowledgeDocument** - RSS aggregation + GPT-4 summarization

---

## Architecture

### Frontend Pattern
Alpine.js tab-based SPA. Each tab is an HTML template string function:

```
client/src/js/components/tabs/GrapheneTab.js    -> getGrapheneTabHtml()
client/src/js/components/modals/TaskModal.js    -> getTaskModalHtml()
client/src/js/services/api.js                   -> API.tasks.create(), API.graphene.getAll(), etc.
```

State lives in `app-refactored.js` (~5000 lines) as Alpine.js data. Methods on the same object delegate to API service functions.

**Navigation:** `client/index.html` has desktop nav (border-bottom tabs) and mobile nav (hamburger with collapsible sections). Tabs registered in `switchTab()` method.

### Backend Pattern
Express routes in `server/routes/*.js`. Each route file exports an express Router. Prisma accessed via `req.app.locals.prisma`.

Auth middleware exported from `auth.js`: `authenticateToken`, `requireEditAccess`, `requireSuperAdmin`. Tasks route adds its own `requireInternalAccess` (blocks THIRD_PARTY + INVESTOR).

### Styling
Tailwind CSS. Black primary, Bronze (#B87333) link accent. No UI library. Responsive: tables on desktop, card layout on mobile.

---

## Key Files

| Purpose | Path |
|---|---|
| Server entry | `server/index.js` |
| All API routes | `server/routes/*.js` (26 files) |
| Auth middleware | `server/routes/auth.js` (authenticateToken, requireEditAccess) |
| Database schema | `prisma/schema.prisma` |
| Main app state | `client/src/js/app-refactored.js` |
| HTML shell + nav | `client/index.html` |
| API client | `client/src/js/services/api.js` |
| Tab components | `client/src/js/components/tabs/*.js` (21 files) |
| Modal components | `client/src/js/components/modals/*.js` (21 files) |
| CSS entry | `client/src/styles/main.css` |

---

## API Routes Summary

| Base Path | Entity | Auth |
|---|---|---|
| /api/auth | Login/logout/me | Public (login), JWT (me) |
| /api/users | User CRUD | SUPER_ADMIN only |
| /api/biochar | Biochar CRUD + lots | Global middleware |
| /api/graphene | Graphene CRUD + filters | Global middleware |
| /api/compound-batches | CompoundBatch CRUD + related | Global middleware |
| /api/micronization | Micronization CRUD | Global middleware |
| /api/mcb | MCB CRUD | Global middleware |
| /api/shipments | Shipment CRUD + locations | Global middleware |
| /api/bet | BET test CRUD | Global middleware |
| /api/conductivity | Conductivity test CRUD | Global middleware |
| /api/raman | Raman test CRUD | Global middleware |
| /api/tem | TEM test CRUD | Global middleware |
| /api/particle-size | Particle size test CRUD | Global middleware |
| /api/xrd | XRD test CRUD (multi-file) | Global middleware |
| /api/xps | XPS test CRUD (multi-file) | Global middleware |
| /api/update-reports | Update report CRUD | Global middleware |
| /api/sem-reports | SEM report CRUD | Global middleware |
| /api/tasks | Task CRUD + comments + status | JWT + internal roles only |
| /api/dashboard | Production metrics, inventory | Global middleware |
| /api/analysis | Competitive metrics, charts | Global middleware |
| /api/ai-insights | GPT-4 analysis | Global middleware |
| /api/news | RSS articles, bookmarks | Global middleware |
| /api/knowledge-base | Document upload + processing | Global middleware |
| /api/data | Generic data page lookup | Global middleware |

Global middleware: THIRD_PARTY blocked on POST/PUT/DELETE. GET open to all authenticated users.

---

## Environment Variables

| Var | Purpose |
|---|---|
| DATABASE_URL | PostgreSQL connection |
| PORT | Server port (default 3000) |
| NODE_ENV | development/staging/production |
| JWT_SECRET | Token signing key |
| OPENAI_API_KEY | GPT-4 for insights/news |
| USE_CLOUDINARY | Enable cloud file storage |
| CLOUDINARY_* | Cloudinary credentials |

---

## Gotchas

- Local dev: always use `localhost:5174` (Vite), not `:3001` (Express). Express serves raw unprocessed files in dev mode.
- `prisma migrate dev` fails due to old shadow DB issues. Use `prisma db push` instead.
- Biochar time is in HOURS, Graphene time is in MINUTES.
- Test models use string references (experimentNumber/batchNumber), not foreign keys.
- XRD and XPS support multi-file upload (array of report URLs).
- MCB micronizations are excluded from individual inventory counts to prevent double-counting.
- app-refactored.js is ~5000 lines. State + methods for all tabs live here. New features add state properties + methods to this file.
