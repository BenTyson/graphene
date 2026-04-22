# Proforma Roadmap

Future enhancements to the financial modeling system. Grouped by category, roughly prioritized within each.

Prereq: read `docs/features/PROFORMA-SYSTEM.md` for current architecture.

---

## Modeling Gaps (Engine)

### Machine Ramp-Up Curves
Production currently jumps from 0 to full capacity the month after validation ends. Real equipment ramps over 2-4 months. Add a `rampMonths` field per machine in the assumptions. Engine applies linear or S-curve interpolation from 0% to 100% capacity over that window. Affects `computeProduction()` in `shared/proformaEngine.js`.

### Working Capital / Accounts Receivable Lag
Cash flow assumes customers pay the month revenue is recognized. Add a `receivableDays` input (30/60/90) to assumptions. Engine shifts cash inflow by N months relative to revenue recognition in `assembleOutlook()`. Significantly increases peak cash need and delays break-even -- critical for fundraising accuracy.

### Price Erosion
Pricing is flat within each year (`pricing.supercapPerKg.year1 = 200` for all 12 months). Add a per-year quarterly decline rate or allow monthly pricing arrays. Affects `computeRevenue()` -- monthly price lookup instead of yearly.

### Machine Downtime / Utilization
`bufferToggle` is a single global multiplier. Replace with per-phase utilization percentage (e.g., Phase 1: 85%, Phase 2: 92%, Phase 3: 95%) accounting for maintenance, cleaning, and failures. More transparent than a single magic number. Modify `computeProduction()` to apply utilization per machine per phase.

### Depreciation & Amortization
Not needed for EBITDA but required for net income, tax modeling, or investor P&L. Machines have known costs and useful lives. Add straight-line depreciation as a new outlook row below EBITDA. Minimal engine work -- iterate machines, spread `cost / usefulLifeMonths` across active months.

### Cost of Capital / NPV / IRR
No discount rate currently. Add `capital.wacc` input (e.g., 0.12 for 12%). Compute NPV of cash flows and IRR in the metrics output. Use simple bisection for IRR (no circular refs). Add to metrics banner and summary view.

### Tax Modeling
Currently no tax line. Add a simple `taxRate` assumption applied to positive EBITDA (or net income if depreciation is added). Creates a new "Taxes" row in outlook between EBITDA and Cash Flow.

---

## Assumptions Structure

### Hemp Cost Timing Offset
Known discrepancy: engine starts hemp cost the same month as production. Spreadsheet delays 1 month (you procure hemp before processing). Fix in `computeCOGS()` by shifting `monthlyHempKg` forward 1 month. Small impact but removes a known validation gap.

### Normalize Staffing Salary to Always-Array
`opex.staffing.*.salary` is sometimes a number (uniform) and sometimes an array of 4 (per-quarter). This polymorphism complicates the engine (`Array.isArray` checks) and UI (toggle logic). Normalize to always `[val, val, val, val]` in defaults. Engine drops the conditional. UI still shows a single input when all 4 are equal.

### Revenue Segment Extensibility
Hardcoded to 2 segments (supercap, carbon black) with deeply nested paths. Adding a third product line requires touching engine, defaults, outlook row builder, charts, and section templates. Refactor to `revenue.segments[]` array where each segment has `{ name, type, startMonth, pricing, marketShare, qDist }`. Engine iterates the array. Outlook rows are generated dynamically. Medium-sized refactor.

### Q Distribution Presets
Quarterly distribution weights (e.g., `[0.10, 0.20, 0.30, 0.40]`) are arbitrary manual inputs. Add preset shapes: "Linear ramp" (10/20/30/40), "Back-loaded" (5/15/30/50), "Uniform" (25/25/25/25), "Front-loaded" (40/30/20/10). User picks a preset or enters custom values. UI-only change -- presets just fill in the 4 values.

### Seasonality
No seasonal patterns in revenue or costs. Some markets have Q4 spikes or summer slowdowns. Could add an optional monthly seasonality multiplier array (12 values, default all 1.0) per revenue segment.

---

## Presentation / UX

### Scenario Comparison (High Priority)
Side-by-side two scenarios in the outlook table and overlay on charts. "What if we delay Broderick by 6 months?" currently requires opening each scenario separately. Implementation: load two `proformaComputed` objects, render a comparison outlook table with delta columns, overlay line charts. Add a "Compare" button on the scenario list view.

### Sensitivity / Tornado Chart (High Priority)
Show which assumptions have the biggest impact on a target metric (e.g., Y3 EBITDA). Run the engine N times, varying each key input +/-10%, rank by absolute impact. Display as horizontal tornado bar chart (Chart.js). Engine runs in ~1ms so 50 runs is trivial. New sub-tab or section within Summary.

### Export (PDF / Excel / Clipboard)
Board decks need portable output. Options in order of effort:
1. "Copy table to clipboard" button on Outlook -- lowest effort, uses `navigator.clipboard` API
2. CSV export of outlook data -- iterate rows, generate CSV string, trigger download
3. Excel export via SheetJS (xlsx) library -- preserves formatting, multiple sheets
4. PDF export via html2canvas + jsPDF -- captures rendered charts and tables

### Scenario Versioning / History
Currently only `updatedAt` tracks changes. Options:
- "Duplicate scenario" button (simplest -- just POST with cloned assumptions + " (copy)" name)
- Save history: store previous assumptions snapshots in a `ProformaVersion` model with timestamp. "Revert to version" button.

### Waterfall Chart
Revenue → COGS → Gross Margin → OPEX → EBITDA as a waterfall visualization. More intuitive than stacked bars for margin decomposition. Chart.js doesn't have native waterfall but it can be built with floating bar segments (positive/negative offsets).

### Outlook Conditional Formatting
- Months where cumulative cash is negative: red cell background
- Break-even month: highlighted column or marker
- Gross margin % below a threshold: amber/red text
- Revenue growth acceleration: green gradient
Implement via Alpine `:class` expressions on the outlook table `<td>` elements.

### Metrics Banner Deltas
When an assumption changes and recompute fires, show delta arrows on the metrics banner (e.g., "Break-Even: Mo 19 ↑2" if it moved from 17). Requires storing the previous `proformaComputed.metrics` before recompute and diffing.

### Annotations / Notes
Allow users to attach notes to specific months or assumptions (e.g., "Assumes Broderick delivery on schedule" on month 27). Store as a `notes` object in the assumptions JSON keyed by month or field path. Display as tooltip icons in the outlook table and assumption inputs.

### Machine Timeline / Gantt View
Horizontal bar chart showing each machine's construction → validation → production phases across 48 months. Pure CSS/Tailwind implementation (colored div segments in a flex row) or Chart.js horizontal bar. Read-only visualization in the Machines section, driven by machine start months and phase durations.

---

## Priority Recommendation

**Next sprint (highest impact):**
1. Scenario comparison -- presentation multiplier for executive decision-making
2. Machine ramp-up curves -- improves model accuracy for realistic production forecasts
3. Working capital / AR lag -- critical for fundraising conversations (peak cash need is understated)

**Following sprint:**
4. Sensitivity tornado chart -- helps identify which assumptions matter most
5. Export (start with clipboard/CSV)
6. Duplicate scenario button

**Later:**
7. Revenue segment extensibility
8. Depreciation + tax modeling
9. NPV/IRR
10. Everything else
