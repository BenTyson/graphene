# Proforma Financial Modeling System

## Overview

Native financial projection tool replacing a Google Sheets proforma. SUPER_ADMIN only. Lets executives create scenarios with editable assumptions, instantly recomputes a 48-month P&L projection, and displays results across Outlook (table), Charts, and Summary views.

Single calculation engine (`shared/proformaEngine.js`) is a pure function importable by both server and client (via Vite alias `@shared`). No external formula libraries.

## Architecture

```
shared/proformaDefaults.js    -- Default assumptions JSON + validation
shared/proformaEngine.js      -- 7-layer calculation pipeline (pure function)
         |
         ├── server/routes/proforma.js       -- CRUD API, runs engine on save/load
         |
         └── client (via @shared Vite alias)
              ├── services/ProformaService.js -- State management, chart lifecycle
              ├── components/tabs/ProformaTab.js -- Main tab shell (list, editor, outlook, charts, summary)
              └── components/tabs/proforma/   -- 7 section files + helpers
                   ├── helpers.js             -- numInput(), card(), quarterlyMatrix(), metricsBanner(), sectionNav(), HELP text registry
                   ├── ProductionSection.js   -- Process chemistry, kiln specs, schedule, efficiency
                   ├── RevenueSection.js      -- Pricing, 2 segments with Q Distribution validation
                   ├── CostsSection.js        -- Hemp, manufacturing labor, biochar
                   ├── OperationsSection.js   -- Staffing matrix, benefits, overhead, legal, R&D, insurance
                   ├── MachinesSection.js     -- Machine cards with payment schedules, phase overrides
                   ├── CapitalSection.js      -- Starting cash, raises, CapEx Lab quarterly matrix
                   └── TechnicalSection.js    -- EV battery, supercap, market sizing, derived TAM
```

## Database Schema

```prisma
model ProformaScenario {
  id          String   @id @default(cuid())
  name        String
  description String?
  assumptions Json              // Full assumptions object (see below)
  isDefault   Boolean  @default(false)
  locked      Boolean  @default(false)
  createdById String
  createdBy   User     @relation("ProformaCreator")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

User model has `proformaScenarios ProformaScenario[] @relation("ProformaCreator")`.

Use `npx prisma db push` (not `migrate dev`) to apply schema changes.

## API Endpoints

All routes require `authenticateToken` + `requireSuperAdmin`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/proforma/scenarios` | List all (auto-seeds "2025 Projections" if empty) |
| GET | `/api/proforma/scenarios/:id` | Get scenario + computed output |
| POST | `/api/proforma/scenarios` | Create (name required, assumptions optional → defaults) |
| PUT | `/api/proforma/scenarios/:id` | Update (blocked if scenario is locked) |
| PATCH | `/api/proforma/scenarios/:id/lock` | Toggle locked state |
| DELETE | `/api/proforma/scenarios/:id` | Delete scenario |
| POST | `/api/proforma/compute` | Preview: send assumptions, get computed output (no save) |
| GET | `/api/proforma/defaults` | Return default assumptions template |

## Assumptions JSON Shape

The `assumptions` field stores a deeply nested JSON object. Top-level keys:

| Key | Purpose | Editable In |
|-----|---------|-------------|
| `pricing` | Supercap + carbon black $/kg by year | Revenue section |
| `production` | Biochar/KOH/yield/kilns/phases/efficiency | Production section |
| `machines[]` | Array of machines with payments, phase overrides | Machines section |
| `manufacturing` | FTE roles, shifts, maintenance, biochar cost | Costs section |
| `revenue` | 2 segments (supercap, carbon black): market share, Q distribution, start month | Revenue section |
| `opex` | Staffing (year x quarter x role), benefits, legal, overhead, insurance, royalties, commissions | Operations section |
| `cogs` | Hemp cost, contingency, shipping | Costs section |
| `rnd` | Quarterly R&D spend by year | Operations section |
| `capexLab` | Quarterly lab equipment CapEx by year | Capital section |
| `capital` | Starting cash, initial investment, raises[] | Capital section |
| `technical` | EV battery specs, HGraphene replacement factors, supercap specs, market sizing | Technical section |

Full shape is in `shared/proformaDefaults.js` → `getDefaultAssumptions()`.

Key data quirks:
- `opex.staffing` salary can be a number (uniform) OR an array of 4 (per-quarter). Executive Y0/Y1 defaults are arrays.
- `machines[].payments[]` has `{ month, pct }` where pct values should sum to 1.0.
- `revenue.*.qDist[]` quarterly distribution weights should sum to 1.0.

## Calculation Engine

`shared/proformaEngine.js` exports `calculateProforma(assumptions) -> computedOutput`.

**7-layer pipeline:**

1. **deriveTechnical** → Market sizes in kg, HGraphene replacement weights
2. **computeProduction** → Per-machine monthly kg, CapEx payments, manufacturing costs
3. **computeRevenue** → Monthly revenue by segment (market share x TAM x price)
4. **computeCOGS** → Hemp, biochar, manufacturing costs
5. **computeOPEX** → Staffing, benefits, overhead, legal, R&D, royalties, commissions, insurance
6. **assembleOutlook** → Monthly P&L: revenue, COGS, gross margin, OPEX, EBITDA, CapEx, cash flow, cumulative cash
7. **aggregateViews** → Quarterly (16 periods) and yearly (4 years) aggregations

**Output structure** (key paths for frontend):
- `production.monthlyGrapheneKg[48]`, `production.machineTimelines[].monthlyKg[48]`
- `production.pilotMonthlyByPhase[3]`, `production.broderickMonthlyByPhase[3]`
- `outlook.*[48]` — 25 monthly arrays (revenue, cogs, grossMargin, opex, ebitda, capex, cashFlow, cumulativeCash, plus sub-line breakdowns)
- `quarterly.*[16]`, `yearly.*[4]` — same 25 keys aggregated
- `revenue.supercap[48]`, `revenue.carbonBlack[48]`
- `techRef.conductiveByYear[4]`, `techRef.supercapByYear[4]`
- `metrics` — `{ breakEvenMonth, peakCashNeed, y3Revenue, y3Ebitda, y3EbitdaMargin, totalCapex, peakMonthlyProductionKg }`

## Frontend Architecture

### State (in app-refactored.js)

```js
proformaScenarios: [],          // List view data
proformaScenario: null,         // Active scenario (includes .locked, .name)
proformaAssumptions: null,      // Deep-cloned assumptions for editing
proformaComputed: null,         // Engine output (outlook, quarterly, yearly, metrics, etc.)
proformaView: 'list',           // 'list' | 'editor'
proformaEditorTab: 'assumptions', // 'assumptions' | 'outlook' | 'charts' | 'summary'
proformaOutlookView: 'monthly', // 'monthly' | 'quarterly' | 'yearly'
proformaSection: 'production',  // Active assumptions section
proformaStaffingYear: 'year0',  // Year selector within staffing card
proformaCollapsed: {},          // Outlook table row collapse state
proformaDirty: false,
proformaLoading: false,
```

### Service Methods (ProformaService.js)

Scenario CRUD: `loadScenarios`, `openScenario`, `createScenario`, `deleteScenario`, `saveScenario`, `toggleLock`

Editor: `recompute` (runs engine client-side, sets `proformaComputed`), `markDirty`, `backToList`, `setAssumption`

Data management: `addMachine`, `removeMachine`, `addMachinePayment`, `removeMachinePayment`, `addRaise`, `removeRaise`, `addFteRole`, `removeFteRole`, `normalizeQDist`, `toggleSalaryMode`

Outlook: `getOutlookRows` (builds row array with parent/child collapse structure), `getColumnLabels`

Charts: `renderCharts` (uses requestAnimationFrame for canvas sizing), `destroyCharts`, `_buildCharts`

### Assumptions Editor Layout

Section nav (left sidebar on desktop, horizontal pills on mobile) with 7 sections. Persistent metrics banner (6 KPIs) at top. Each section is a separate file returning an HTML template string.

Shared helpers in `proforma/helpers.js`:
- `numInput(label, path, opts)` — number input with optional help text, unit, and computed indicator
- `card(title, content, opts)` — bordered card with gray header
- `quarterlyMatrix(title, basePath, opts)` — year x quarter editable grid with computed Annual column
- `metricsBanner()` — sticky KPI strip
- `sectionNav()` — 7-section navigation
- `HELP` — help text registry keyed by field path

### Live Recomputation

Every assumption input calls `proformaRecompute()` on change, which runs the full engine client-side (~1ms). All computed indicators and the metrics banner read from `proformaComputed` and update automatically via Alpine reactivity.

### Locked Scenarios

When `proformaScenario.locked === true`:
- Name input disabled, Save button disabled
- Assumptions section gets `opacity-60 pointer-events-none`
- Server rejects PUT requests with 403
- Outlook, Charts, Summary remain fully viewable

## Validated Numbers (from spreadsheet)

| Metric | Engine Output | Source |
|--------|--------------|--------|
| Pilot Phase 1 production | 2,392.2 kg/mo | Exact match |
| Broderick Phase 3 production | 151,490.4 kg/mo | Exact match |
| Supercap Y1 revenue | $14,246,400 | Exact match |
| Y3 total revenue | $101,838,266 | Exact match |
| Staffing Y2 Q1 monthly | $89,583 | Exact match |
| Gross margin Y1 Q1 | ~69% | Within tolerance (known 1-month hemp offset) |
| Break-even | Month 19 | — |
| Peak cash need | -$2,060,647 | — |

## File Locations

| File | Purpose |
|------|---------|
| `shared/proformaDefaults.js` | Default assumptions + `validateAssumptions()` |
| `shared/proformaEngine.js` | 7-layer calculation engine |
| `server/routes/proforma.js` | CRUD + compute API |
| `client/src/js/services/ProformaService.js` | Frontend service |
| `client/src/js/components/tabs/ProformaTab.js` | Tab shell (list, editor, outlook, charts, summary) |
| `client/src/js/components/tabs/proforma/helpers.js` | Shared UI helpers + HELP text |
| `client/src/js/components/tabs/proforma/*Section.js` | 7 assumption editor sections |
| `client/src/js/services/api.js` | `proformaAPI` block |
| `client/src/js/app-refactored.js` | State + 20 delegate methods |
| `vite.config.js` | `@shared` alias for client imports |

## Gotchas

- Use `prisma db push`, never `prisma migrate dev`
- The engine starts hemp cost the same month as production (spreadsheet delays 1 month). Known ~3-5% Y0/Y1 COGS variance.
- `opex.businessInsurance` is an array `[Y0, Y1, Y2, Y3]`, not an object with year keys.
- Charts use `requestAnimationFrame` after `$nextTick` for canvas sizing when switching sub-tabs.
- Outlook table collapse uses direct `proformaCollapsed[key]` access in template (not pre-computed) for Alpine reactivity.
- Auto-seed: GET `/api/proforma/scenarios` creates "2025 Projections" if table is empty, attributed to requesting user.

---

**Implementation Date**: March 2026 (Sessions 1-3)
**Status**: Complete
