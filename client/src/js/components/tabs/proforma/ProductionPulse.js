// ═══════════════════════════════════════════════════════════════
// Production Pulse — live material-flow visualization
// ═══════════════════════════════════════════════════════════════
// Three stacked stripes on a shared 0–48 month axis:
//   1. HEMP IN     (kg/mo, amber bars)
//   2. GRAPHENE OUT (kg/mo, stacked by machine, indigo/amber)
//   3. STOCK       (kg cumulative produced − sold, emerald area)
//
// The whole thing animates as assumptions change. Hover any column to
// lock a vertical cursor and see exact numbers for that month.

const MONTHS = 48;

// ── stock series computation ──
// Exposed on window so inline Alpine expressions can call it. The engine
// doesn't model inventory directly, so we derive "sold kg" from revenue
// divided by per-year unit price, then compound cumulative produced − sold.
function _stockSeries(computed, assumptions) {
  if (!computed || !assumptions) return { sold: [], stock: [] };
  const sold = new Array(MONTHS).fill(0);
  const stock = new Array(MONTHS).fill(0);
  const streams = assumptions.revenue?.streams || [];
  const outlook = computed.outlook || {};
  const produced = computed.production?.monthlyGrapheneKg || [];

  // Only `linked` streams have a price/kg we can back-solve from. Direct
  // streams are dollar-only and don't contribute to the kg-out tally.
  const linked = streams.filter(s => s.market?.mode !== 'direct');

  let running = 0;
  for (let m = 0; m < MONTHS; m++) {
    const y = 'year' + Math.min(3, Math.floor(m / 12));
    let monthSold = 0;
    for (const s of linked) {
      const price = s.pricing?.[y] || 0;
      const rev = outlook['revenueStream_' + s.id]?.[m] || 0;
      if (price > 0) monthSold += rev / price;
    }
    sold[m] = monthSold;
    running += (produced[m] || 0) - sold[m];
    stock[m] = Math.max(0, running);
  }
  return { sold, stock };
}

function _monthTotals(computed, assumptions) {
  if (!computed) return null;
  const produced = computed.production?.monthlyGrapheneKg || [];
  const hemp = computed.production?.monthlyHempKg || [];
  const hempCost = computed.outlook?.cogsHemp || [];
  const { sold, stock } = _stockSeries(computed, assumptions);
  return {
    peakProduced: Math.max(0, ...produced),
    peakHemp: Math.max(0, ...hemp),
    peakStock: Math.max(0, ...stock),
    peakStockMonth: stock.reduce((best, v, i) => v > stock[best] ? i : best, 0),
    totalHempCost: hempCost.reduce((a, b) => a + (b || 0), 0),
    totalProduced: produced.reduce((a, b) => a + (b || 0), 0),
    totalSold: sold.reduce((a, b) => a + (b || 0), 0)
  };
}

if (typeof window !== 'undefined') {
  window._pfStockSeries = _stockSeries;
  window._pfMonthTotals = _monthTotals;
}

// ── SVG geometry constants ──
const VB_W = 960;              // viewBox width
const PAD_L = 72;              // left label gutter
const PAD_R = 20;              // right gutter
const PLOT_W = VB_W - PAD_L - PAD_R;
const COL_W = PLOT_W / MONTHS;
const STRIPE_H = { hemp: 74, graphene: 128, stock: 106 };
const STRIPE_Y = {
  hemp: 24,
  graphene: 24 + STRIPE_H.hemp + 12,
  stock: 24 + STRIPE_H.hemp + STRIPE_H.graphene + 24
};
const VB_H = STRIPE_Y.stock + STRIPE_H.stock + 40;

// ── SVG builders (pure, Alpine-driven) ──

function _axisGridlines() {
  const ticks = [0, 12, 24, 36, 48];
  return ticks.map(m => {
    const x = PAD_L + m * COL_W;
    const label = m === 0 ? 'M0' : m === MONTHS ? 'Y3 end' : 'Y' + (m / 12);
    return `
      <line x1="${x}" x2="${x}" y1="${STRIPE_Y.hemp - 8}" y2="${STRIPE_Y.stock + STRIPE_H.stock + 4}"
            stroke="#E5E7EB" stroke-dasharray="2 3"/>
      <text x="${x}" y="${STRIPE_Y.stock + STRIPE_H.stock + 20}"
            font-size="11" fill="#9CA3AF" font-family="ui-monospace, monospace"
            text-anchor="${m === 0 ? 'start' : m === MONTHS ? 'end' : 'middle'}">${label}</text>
    `;
  }).join('');
}

function _stripeLabel(label, sublabel, y) {
  return `
    <text x="0" y="${y + 14}" font-size="11" font-weight="600" fill="#374151"
          font-family="system-ui, sans-serif" style="text-transform: uppercase; letter-spacing: 0.06em;">
      ${label}
    </text>
    <text x="0" y="${y + 28}" font-size="10" fill="#9CA3AF" font-family="ui-monospace, monospace">
      ${sublabel}
    </text>
  `;
}

// Hemp stripe: simple amber bars scaled to peakHemp
function _hempStripe() {
  const base = STRIPE_Y.hemp + STRIPE_H.hemp - 4;
  const maxH = STRIPE_H.hemp - 18;
  return `
    ${_stripeLabel('Hemp in', 'kg/mo', STRIPE_Y.hemp)}
    <!-- baseline -->
    <line x1="${PAD_L}" x2="${PAD_L + PLOT_W}" y1="${base}" y2="${base}" stroke="#F3F4F6"/>
    <template x-for="m in ${MONTHS}" :key="'hemp-' + m">
      <rect :x="${PAD_L} + (m - 1) * ${COL_W} + 0.5"
            :y="${base} - (proformaComputed.production.monthlyHempKg[m-1] || 0) / Math.max(1, window._pfMonthTotals(proformaComputed, proformaAssumptions)?.peakHemp || 1) * ${maxH}"
            :width="${COL_W} - 1"
            :height="(proformaComputed.production.monthlyHempKg[m-1] || 0) / Math.max(1, window._pfMonthTotals(proformaComputed, proformaAssumptions)?.peakHemp || 1) * ${maxH}"
            fill="#F59E0B" opacity="0.85"
            style="transition: all 200ms ease-out;"/>
    </template>
  `;
}

// Graphene stripe: stacked by machine, per-month
// We walk machineTimelines[] and stack bars. Height scales to peakProduced.
function _grapheneStripe() {
  const base = STRIPE_Y.graphene + STRIPE_H.graphene - 4;
  const maxH = STRIPE_H.graphene - 18;
  // The stacking is done inline per-month by walking machineTimelines.
  // We emit one <template> outer loop over months and an inner stacker.
  return `
    ${_stripeLabel('Graphene out', 'kg/mo, stacked by machine', STRIPE_Y.graphene)}
    <line x1="${PAD_L}" x2="${PAD_L + PLOT_W}" y1="${base}" y2="${base}" stroke="#F3F4F6"/>

    <!-- Month columns, with stacked rects one per machine -->
    <template x-for="m in ${MONTHS}" :key="'gr-' + m">
      <g>
        <template x-for="(mt, mi) in (proformaComputed.production.machineTimelines || [])" :key="'gr-' + m + '-' + mi">
          <rect
            :x="${PAD_L} + (m - 1) * ${COL_W} + 0.5"
            :y="(() => {
              const peak = Math.max(1, window._pfMonthTotals(proformaComputed, proformaAssumptions)?.peakProduced || 1);
              let acc = 0;
              for (let j = 0; j < mi; j++) {
                acc += (proformaComputed.production.machineTimelines[j].monthlyKg[m-1] || 0);
              }
              const cur = mt.monthlyKg[m-1] || 0;
              return ${base} - (acc + cur) / peak * ${maxH};
            })()"
            :width="${COL_W} - 1"
            :height="(mt.monthlyKg[m-1] || 0) / Math.max(1, window._pfMonthTotals(proformaComputed, proformaAssumptions)?.peakProduced || 1) * ${maxH}"
            :fill="mt.type === 'broderick'
              ? ['#F59E0B', '#FBBF24', '#FCD34D'][mi % 3]
              : ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'][mi % 4]"
            opacity="0.92"
            style="transition: all 200ms ease-out;"/>
        </template>
      </g>
    </template>
  `;
}

// Stock stripe: emerald area chart
function _stockStripe() {
  const base = STRIPE_Y.stock + STRIPE_H.stock - 4;
  const maxH = STRIPE_H.stock - 18;
  return `
    ${_stripeLabel('Stock', 'kg produced − sold (cumulative)', STRIPE_Y.stock)}
    <line x1="${PAD_L}" x2="${PAD_L + PLOT_W}" y1="${base}" y2="${base}" stroke="#F3F4F6"/>

    <!-- Area polygon with Alpine-computed d attribute -->
    <path
      :d="(() => {
        const stock = (window._pfStockSeries(proformaComputed, proformaAssumptions).stock || []);
        const peak = Math.max(1, window._pfMonthTotals(proformaComputed, proformaAssumptions)?.peakStock || 1);
        let d = 'M ${PAD_L} ${base} ';
        for (let m = 0; m < ${MONTHS}; m++) {
          const x = ${PAD_L} + (m + 0.5) * ${COL_W};
          const y = ${base} - (stock[m] || 0) / peak * ${maxH};
          d += 'L ' + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
        }
        d += 'L ${PAD_L + PLOT_W} ${base} Z';
        return d;
      })()"
      fill="url(#stockGradient)"
      stroke="#10B981"
      stroke-width="1.5"
      style="transition: all 200ms ease-out;"/>
  `;
}

// Vertical cursor + tooltip data (hover state)
function _hoverOverlay() {
  return `
    <!-- invisible hit-tracker: a single rect covering the plot area -->
    <rect
      x="${PAD_L}" y="${STRIPE_Y.hemp - 8}"
      width="${PLOT_W}" height="${STRIPE_Y.stock + STRIPE_H.stock + 4 - (STRIPE_Y.hemp - 8)}"
      fill="transparent"
      @mousemove="
        (() => {
          const svg = $event.currentTarget.ownerSVGElement;
          const pt = svg.createSVGPoint();
          pt.x = $event.clientX; pt.y = $event.clientY;
          const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
          const idx = Math.max(0, Math.min(${MONTHS - 1}, Math.floor((loc.x - ${PAD_L}) / ${COL_W})));
          proformaPulseHover = idx;
        })()
      "
      @mouseleave="proformaPulseHover = null"/>

    <!-- cursor line + endpoint dots -->
    <g x-show="proformaPulseHover !== null" style="pointer-events: none;">
      <line
        :x1="${PAD_L} + (proformaPulseHover + 0.5) * ${COL_W}"
        :x2="${PAD_L} + (proformaPulseHover + 0.5) * ${COL_W}"
        :y1="${STRIPE_Y.hemp - 4}"
        :y2="${STRIPE_Y.stock + STRIPE_H.stock}"
        stroke="#111827" stroke-width="1" stroke-dasharray="3 3"/>
      <circle
        :cx="${PAD_L} + (proformaPulseHover + 0.5) * ${COL_W}"
        :cy="${STRIPE_Y.stock + STRIPE_H.stock - 4} - ((window._pfStockSeries(proformaComputed, proformaAssumptions).stock[proformaPulseHover] || 0) / Math.max(1, window._pfMonthTotals(proformaComputed, proformaAssumptions)?.peakStock || 1)) * ${STRIPE_H.stock - 18}"
        r="3.5" fill="#10B981" stroke="white" stroke-width="1.5"/>
    </g>
  `;
}

// ── main export ──

export function productionPulse() {
  return `
    <figure class="relative rounded-2xl border border-gray-200 bg-white p-6 mb-6" x-data="{ proformaPulseHover: null }">
      <figcaption class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 class="text-[15px] font-semibold text-gray-900 tracking-tight">Material flow</h3>
          <p class="text-xs text-gray-500 mt-0.5">Hemp in → graphene out → stock. Hover to scrub. Edit any assumption below to animate the flow.</p>
        </div>
        <div class="flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>Hemp in</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>Pilot output</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>Broderick output</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>Stock</span>
        </div>
      </figcaption>

      <div class="relative" x-show="proformaComputed">
        <svg viewBox="0 0 ${VB_W} ${VB_H}" width="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Monthly material flow: hemp consumption, graphene production, and stock">
          <defs>
            <linearGradient id="stockGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="#10B981" stop-opacity="0.35"/>
              <stop offset="1" stop-color="#10B981" stop-opacity="0.03"/>
            </linearGradient>
          </defs>

          ${_axisGridlines()}
          ${_hempStripe()}
          ${_grapheneStripe()}
          ${_stockStripe()}
          ${_hoverOverlay()}
        </svg>

        <!-- Hover tooltip: floating pill above the SVG with 4 numbers -->
        <div x-show="proformaPulseHover !== null"
             x-transition.opacity
             class="pointer-events-none absolute top-0 translate-x-[-50%] -translate-y-full mt-1 bg-gray-900 text-white text-[11px] font-mono rounded-lg px-3 py-2 shadow-lg whitespace-nowrap"
             :style="'left:' + ((${PAD_L} + (proformaPulseHover + 0.5) * ${COL_W}) / ${VB_W} * 100) + '%'">
          <div class="font-sans font-semibold text-[11px] text-gray-300 mb-1"
               x-text="'Month ' + proformaPulseHover + ' (Y' + Math.floor(proformaPulseHover / 12) + ' Q' + (Math.floor((proformaPulseHover % 12) / 3) + 1) + ')'"></div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-0.5">
            <span class="text-amber-300">Hemp:</span>
            <span x-text="(proformaComputed.production.monthlyHempKg[proformaPulseHover] || 0).toFixed(1) + ' kg'"></span>
            <span class="text-amber-300">Hemp cost:</span>
            <span x-text="window._pfFmtC(proformaComputed.outlook.cogsHemp[proformaPulseHover] || 0)"></span>
            <span class="text-indigo-300">Graphene:</span>
            <span x-text="(proformaComputed.production.monthlyGrapheneKg[proformaPulseHover] || 0).toFixed(1) + ' kg'"></span>
            <span class="text-emerald-300">Stock:</span>
            <span x-text="(window._pfStockSeries(proformaComputed, proformaAssumptions).stock[proformaPulseHover] || 0).toFixed(0) + ' kg'"></span>
          </div>
        </div>
      </div>

      <!-- Summary chips -->
      <div class="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2" x-show="proformaComputed">
        <div class="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2">
          <p class="text-[10px] uppercase tracking-[0.08em] text-indigo-600/70 font-medium">Peak production</p>
          <p class="text-sm font-semibold text-indigo-900 font-mono tabular-nums mt-0.5"
             x-text="Math.round(window._pfMonthTotals(proformaComputed, proformaAssumptions)?.peakProduced || 0).toLocaleString() + ' kg/mo'"></p>
        </div>
        <div class="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
          <p class="text-[10px] uppercase tracking-[0.08em] text-amber-700/80 font-medium">Peak hemp use</p>
          <p class="text-sm font-semibold text-amber-900 font-mono tabular-nums mt-0.5"
             x-text="Math.round(window._pfMonthTotals(proformaComputed, proformaAssumptions)?.peakHemp || 0).toLocaleString() + ' kg/mo'"></p>
        </div>
        <div class="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
          <p class="text-[10px] uppercase tracking-[0.08em] text-amber-700/80 font-medium">Total hemp spend</p>
          <p class="text-sm font-semibold text-amber-900 font-mono tabular-nums mt-0.5"
             x-text="window._pfFmtC(window._pfMonthTotals(proformaComputed, proformaAssumptions)?.totalHempCost || 0, true)"></p>
        </div>
        <div class="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
          <p class="text-[10px] uppercase tracking-[0.08em] text-emerald-700/80 font-medium">Peak stock</p>
          <p class="text-sm font-semibold text-emerald-900 font-mono tabular-nums mt-0.5"
             x-text="Math.round(window._pfMonthTotals(proformaComputed, proformaAssumptions)?.peakStock || 0).toLocaleString() + ' kg @ Mo ' + (window._pfMonthTotals(proformaComputed, proformaAssumptions)?.peakStockMonth || 0)"></p>
        </div>
      </div>
    </figure>
  `;
}
