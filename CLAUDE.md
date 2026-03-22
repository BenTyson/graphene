# Graphene Production Control System

## What This Is
Internal admin dashboard for tracking the full material pipeline:
Biochar -> Graphene -> CompoundBatch / Micronization -> MCB -> Tests -> Shipments
Plus: task management, news aggregation, AI insights, competitive analysis.

## Stack
- **Backend:** Node.js + Express + Prisma ORM + PostgreSQL
- **Frontend:** Alpine.js + Tailwind CSS (NOT React/Next.js)
- **Build:** Vite
- **Deploy:** Railway (admin.hgraphene.com)
- **Files:** Cloudinary CDN

This is a tab-based SPA. Each tab returns an HTML template string (e.g., `getGrapheneTabHtml()`). State lives in Alpine.js data on `app-refactored.js`. There are no JSX components.

## Key Files
- `server/index.js` - Express entry, route registration, global middleware
- `server/routes/*.js` - 26 API route files
- `server/routes/auth.js` - JWT auth middleware (authenticateToken, requireEditAccess, requireSuperAdmin)
- `prisma/schema.prisma` - All database models
- `client/index.html` - HTML shell, navigation (desktop + mobile), tab/modal containers
- `client/src/js/app-refactored.js` - Main Alpine.js app (~5000 lines): all state + methods
- `client/src/js/services/api.js` - All API client functions
- `client/src/js/components/tabs/*.js` - 21 tab components
- `client/src/js/components/modals/*.js` - 21 modal components
- `client/src/styles/main.css` - Tailwind entry + custom CSS

## Development
```bash
npm run dev          # Start Vite (5174) + Express (3001) via concurrently
npm run build        # Production build
npx prisma db push   # Apply schema changes (don't use migrate dev - shadow DB issues)
npx prisma studio    # Database GUI
```
Local dev: use `localhost:5174` (Vite). Do NOT use `:3001` -- Express serves raw files without CSS processing in dev.

## Deployment
- **staging** branch -> Railway staging (test here first)
- **main** branch -> admin.hgraphene.com (auto-deploys)
- Never push directly to main. Always: staging -> test -> merge to main.

## Architecture Patterns

### Adding a new tab
1. Add Prisma model to `prisma/schema.prisma`, run `npx prisma db push`
2. Create `server/routes/newThing.js`, register in `server/index.js`
3. Add API functions to `client/src/js/services/api.js`
4. Add state + methods to `client/src/js/app-refactored.js`
5. Add nav button to `client/index.html` (desktop + mobile sections)
6. Create `client/src/js/components/tabs/NewThingTab.js` -> `getNewThingTabHtml()`
7. Create modal in `client/src/js/components/modals/NewThingModal.js`
8. Add `<div x-html="getNewThingTabHtml()"></div>` + modal div to `index.html`
9. Import in `app-refactored.js`, expose via method, add to `switchTab()` and `validTabs`

### Auth & Roles
6 roles: SUPER_ADMIN, SCIENCE_TEAM, EXECUTIVE_TEAM, INVESTOR, TEAM_MEMBER, THIRD_PARTY
- THIRD_PARTY: view-only. All POST/PUT/DELETE blocked by global middleware. Hidden tabs: Dashboard, News, Insights, Shipments, Tasks, User Management.
- INVESTOR: no Tasks tab access.
- SUPER_ADMIN: full access + user management.

### Frontend conventions
- Black primary buttons, Bronze (#B87333) link accent
- No UI component library -- custom Tailwind throughout
- Tables on desktop, card layout on mobile
- Modals: centered for forms, slide-over panel for task detail
- Alpine.js directives: `x-show`, `x-cloak`, `x-html`, `x-model`, `@click`, etc.

## Gotchas
- `prisma migrate dev` fails (old shadow DB issues). Use `prisma db push` instead.
- Biochar time = HOURS. Graphene time = MINUTES.
- Test models use string references (experimentNumber), not foreign keys.
- XRD and XPS support multi-file upload (array of report URLs).
- MCB micronizations excluded from individual inventory counts (double-counting prevention).
- app-refactored.js is large (~5000 lines). Every new feature adds state + methods here.

## Deeper Docs
For detailed reference: `docs/session-start/SESSION-START.md` (full project brief)
For architecture: `docs/core-reference/ARCHITECTURE.md`
For API endpoints: `docs/core-reference/API-REFERENCE.md`
For database: `docs/core-reference/DATABASE-SCHEMA.md`
