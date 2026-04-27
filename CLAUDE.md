# Graphene Production Control System

## What This Is
Internal admin dashboard for tracking the full material pipeline:
Biochar -> Graphene -> CompoundBatch / Micronization -> MCB -> Tests -> Shipments
Plus: goal & task management (Goals -> Tasks -> Subtasks), news aggregation, AI insights, competitive analysis.

## Stack
- **Backend:** Node.js + Express + Prisma ORM + PostgreSQL
- **Frontend:** Alpine.js + Tailwind CSS (NOT React/Next.js)
- **Build:** Vite
- **Deploy:** Railway (admin.hgraphene.com)
- **Files:** Cloudinary CDN

This is a tab-based SPA. Each tab returns an HTML template string (e.g., `getGrapheneTabHtml()`). State lives in Alpine.js data on `app-refactored.js`. There are no JSX components.

## Key Files
- `server/index.js` - Express entry, route registration, global middleware
- `server/routes/*.js` - 29 API route files (incl. `tasks.js`, `goals.js`, `tags.js`, `pipeline.js`, `proforma.js`)
- `server/routes/auth.js` - JWT auth middleware (authenticateToken, requireEditAccess, requireSuperAdmin)
- `prisma/schema.prisma` - All database models
- `client/index.html` - HTML shell, left sidebar nav, top header bar, tab/modal containers
- `client/src/js/app-refactored.js` - Main Alpine.js app (~5500 lines): state + delegate methods
- `client/src/js/services/api.js` - All API client functions
- `client/src/js/services/TaskService.js` - Task CRUD, comments, attachments, subtasks logic
- `client/src/js/services/GoalService.js` - Goal CRUD, task linking, status changes
- `client/src/js/services/PipelineService.js` - Contact CRUD, pipeline board ops, activities, stage constants
- `client/src/js/services/KanbanService.js` - Shared SortableJS wrapper (Tasks + Pipeline)
- `client/src/js/services/CRUDService.js` - Biochar/Graphene/CompoundBatch/etc. CRUD logic
- `client/src/js/components/tabs/*.js` - tab components (incl. `TasksTab.js`, `GoalsTab.js`, `PipelineTab.js`)
- `client/src/js/components/modals/*.js` - modal components (incl. `GoalModal.js`, `GoalDetailPanel.js`, `TaskModal.js`, `TaskDetailPanel.js`)
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
4. Create service file `client/src/js/services/NewThingService.js` (follows CRUDService pattern: methods receive `appContext`)
5. Add state properties to `client/src/js/app-refactored.js`, add one-liner delegate methods that call the service
6. Add nav item to sidebar in `client/index.html` (with icon, role visibility, active state)
7. Create `client/src/js/components/tabs/NewThingTab.js` -> `getNewThingTabHtml()`
8. Create modal in `client/src/js/components/modals/NewThingModal.js`
9. Add `<div x-html="getNewThingTabHtml()"></div>` + modal div to `index.html`
10. Import service + components in `app-refactored.js`, expose via method, add to `switchTab()` and `validTabs`

### Service Layer Pattern
Domain logic lives in `client/src/js/services/*Service.js`. Each service is a class whose methods receive `appContext` (the Alpine.js instance) and mutate it directly. `app-refactored.js` methods are one-liner delegates:
```js
// In app-refactored.js
async loadTasks() { await taskService.loadTasks(this); },
async saveTask() { await taskService.saveTask(this); },
```
Services can access `appContext.$nextTick()` and all Alpine state. Shared utilities (date labels, user name formatting) live in `client/src/js/utils/formatters.js`.

### Auth & Roles
6 roles: SUPER_ADMIN, SCIENCE_TEAM, EXECUTIVE_TEAM, INVESTOR, TEAM_MEMBER, THIRD_PARTY
- THIRD_PARTY: view-only. All POST/PUT/DELETE blocked by global middleware. Hidden tabs: Dashboard, News, Insights, Shipments, Tasks, Goals, User Management.
- INVESTOR: no Tasks/Goals tab access.
- SUPER_ADMIN: full access + user management.

### Layout & Navigation
- **Sidebar:** Dark (`bg-gray-950`) collapsible left sidebar (240px expanded, 64px collapsed). White logo area at top (48px, centered logo, no text). Grouped sections: Production, Analytics, Test Results. Collapse state persisted in localStorage.
- **Mobile:** Sidebar becomes overlay drawer (slide from left) below `lg` (1024px) breakpoint.
- **Header:** Thin 48px top bar with breadcrumb. User info lives in sidebar footer.
- **Test subtabs:** Horizontal pill bar in content area when on `test-*` tabs.
- **Content:** Flex layout, content fills `100% - sidebar width`. No `max-w-7xl` on outer container.
- Sidebar state vars: `sidebarExpanded`, `sidebarOpen`, `sidebarProductionOpen`, `sidebarAnalyticsOpen`, `sidebarTestResultsOpen`.
- Navigation helpers: `sidebarNavigate()`, `getPageTitle()`, `getPageSection()`, `autoExpandParentGroup()`.

### Frontend conventions
- Black primary buttons, Bronze (#B87333) link accent
- No UI component library -- custom Tailwind throughout
- Tables on desktop, card layout on mobile
- Modals: centered for forms, slide-over panel for task/contact detail
- Alpine.js directives: `x-show`, `x-cloak`, `x-html`, `x-model`, `@click`, `x-collapse`, etc.

## Gotchas
- `prisma migrate dev` fails (old shadow DB issues). Use `prisma db push` instead.
- Biochar time = HOURS. Graphene time = MINUTES.
- Test models use string references (experimentNumber), not foreign keys.
- XRD, XPS, and Task attachments support multi-file upload (Cloudinary in prod, local in dev).
- MCB micronizations excluded from individual inventory counts (double-counting prevention).
- app-refactored.js is ~5300 lines. State lives here; logic delegates to service files. New features should create a dedicated service.
- News Feed tab is hidden (`x-show="false"`), code preserved for later.
- Tasks and Pipeline both use KanbanService (shared SortableJS wrapper) for drag-and-drop.
- Pipeline has no Deal/Lead entity. Contacts ARE pipeline items (stage/position/pipelineTitle on Contact model). `contactType` is optional (CLIENT/INVESTOR/PARTNER/OTHER). `DealModal.js` and `DealDetailPanel.js` are dead code (not imported). Contacts view has sortable columns (click headers) and filters (type, pipeline status, owner).
- System tags (category + institution) live in the `Tag` Prisma model with `kind: CATEGORY | INSTITUTION`, NOT in a hardcoded constants file. The legacy `TASK_CATEGORY_TAGS`/`TASK_INSTITUTION_TAGS` arrays in `client/src/js/utils/constants.js` are unused — `server/routes/tags.js` lazy-seeds them on first GET. Tasks/Goals store tags as plain `tags[]` strings (not FKs), so renaming/deleting a system tag does NOT propagate to existing records — add-only is the safe pattern. The Alpine app loads tags into `systemCategoryTags`/`systemInstitutionTags` state on init via `loadSystemTags()`. Inline `+ Add tag`/`+ Add institution` buttons in TaskModal/TaskDetailPanel/GoalModal POST to `/api/tags` and refresh state. Use `isSystemTag(tag)` to distinguish system vs. custom tags.
- Goals are top-level outcomes that group tasks. `Goal` model has status (ACTIVE/ON_HOLD/ACHIEVED/ABANDONED), optional champion (`ownerId`) and target date. Tasks have a nullable `goalId` FK with `onDelete: SetNull` so deleting a goal unlinks tasks rather than cascading. Subtasks inherit their parent's goal — only top-level tasks expose the goal field. Goal progress is derived (`done_tasks / total_tasks`); status is manual. `GoalDetailPanel.js` is the slide-over (matches Task pattern); `GoalsTab.js` is a card grid; `goalService` follows the appContext pattern. Tasks tab integrates goals via filter dropdown + "Goal" group-by + clickable goal pill on cards/rows + goal field in task modal & detail panel.
- Task Kanban: "Show archived" checkbox reveals a 5th ARCHIVED column. Subtasks support due dates with inline date picker; parent cards show red "X overdue" indicator when subtasks are past due.
- Task dependencies (`TaskDependency` model): directional "blocks / blocked by" links between any two tasks (distinct from parent/subtask). Detail panel has "Blocked by" / "Blocking" sections with an inline search picker. Kanban cards + list view show a chain-link icon + count, red-tinted when any blocker is incomplete. Archived counts as DONE for blocker purposes. Moving a task to DONE with incomplete blockers triggers a browser `confirm()` listing blocker titles (warn-but-don't-block). Cycle prevention is BFS at write time. The DONE-transition guard is applied in `updateTaskInline`, `updateTaskStatus`, and the kanban `onReorder` — if adding a new DONE-transition code path, route it through one of these.
- Task assignees are many-to-many via `TaskAssignment` (composite PK taskId+userId). Task payloads include `assignees: [{ user }]` — use `getTaskAssigneeUsers(task)` to flatten. Create/update endpoints accept `assigneeIds: string[]`; PUT diffs old vs. new and emits `assigned`/`unassigned` activity per user. The `?assigneeId=x` list filter still exists and matches any assignee (drives the Tasks filter dropdown + dashboard "my tasks"). Kanban and list views show an avatar stack (up to 3, `+N` overflow). Tag + Institution filter dropdowns on the Tasks tab filter client-side via `getFilteredTasks()`; constants live in `client/src/js/utils/constants.js` (`TASK_CATEGORY_TAGS`, `TASK_INSTITUTION_TAGS`).
- Tab headers (h2 titles) removed from Pipeline and Tasks tabs -- breadcrumb bar provides the page title.
- Alpine.js Collapse plugin (`@alpinejs/collapse`) loaded via CDN for sidebar group animations.
- Proforma assumptions are stored as a single JSON blob (Postgres jsonb). Schema lives in `shared/proformaDefaults.js`; engine in `shared/proformaEngine.js`. Both are imported by client AND server, so any schema change must be backwards-compatible — extend `migrateAssumptions()` (idempotent, runs at the top of `calculateProforma()` and after every server load) instead of writing one-off DB migrations. Never break old blobs; always reshape them.
- Proforma editor sections are top-level "journey pills" in `client/src/js/components/tabs/proforma/cards.js` → `JOURNEY_SECTIONS`. Order: Revenue → Markets → Production → Costs → Operations → Machines → Capital. Each pill flips `proformaSection` and renders one section component. Battery/supercap physical specs live in a separate "Reference data" accordion at the bottom of the page (collapsed by default) — they feed the built-in market sources and are rarely edited.
- Proforma market sources (Markets tab): two bespoke built-ins (`supercap`, `conductive`) with formulas that pull from EV-battery / supercap composition fields, plus a generic `customSources[]` array of `{ id, label, baseTonnes, cagr, builtin }` using the simple `tonnes × CAGR^N` projection. Graphene Oxide is baked in as `builtin: true` (locked, undeletable). The engine emits a `<id>ByYear` array per source on `techRef`; revenue streams pick one via `market.linkedSource`. A stream linked to a missing source computes $0 (no crash). `proformaMarketSources` (Alpine state) is reseeded by `proformaService._reseedMarketSources()` at every open/create/clone/add/remove — never read `MARKET_SOURCE_CATALOG` directly, it doesn't exist anymore.
- Proforma revenue streams: every scenario ships with three built-in streams (`supercapElectrode`, `carbonBlackCathodeAnode`, `grapheneOxideStream`) each pre-linked to a market source. Built-ins can be edited but not deleted. Every stream has an `enabled: boolean` (default true) — `computeRevenue()` skips disabled streams but still emits a zero-stripe so chart datasets stay stable in size/color. Toggle via `toggleProformaRevenueStream(id)` (header switch on the Revenue tab card). Direct-$ mode replaces both Source and Capture sections with a single Yearly-revenue input.
- Proforma kg series: `computeRevenue()` emits `kgByStream`/`kgTotal` alongside dollar arrays (linked-mode = `marketKg × marketSharePct`; direct-mode = derived `revenue / pricePerKg` if price set, else 0). `assembleOutlook()` exposes `productionCapacityKg` (= `production.monthlyGrapheneKg`), `demandKgTotal`, `capacityShortfallKg`, and `demandKg_<streamId>` per stream — all participate in `aggregateViews()` so quarterly/yearly views populate automatically. Surfaced as the "Production Capacity vs Sales Demand" chart on the Charts sub-tab and the per-year strip at the top of the Machines section.
- Proforma hemp is JIT, not purchased: `monthlyHempKg[m] = monthlyGrapheneKg[m] × hempRatioMultiplier` — no inventory, no purchase schedule, no buffer field. Ratio derives from `production.initialHempKg` / `biocharYieldG` / kiln throughput; cost from `cogs.hempCostPerKilo` (+ contingency + shipping). The "Hemp purchases" strip at the top of the Costs section shows derived Y1/Y2/Y3 totals. A real pre-purchase / inventory model would be a schema addition, not a hidden field.

## Deeper Docs
For detailed reference: `docs/session-start/SESSION-START.md` (full project brief)
For architecture: `docs/core-reference/ARCHITECTURE.md`
For API endpoints: `docs/core-reference/API-REFERENCE.md`
For database: `docs/core-reference/DATABASE-SCHEMA.md`
