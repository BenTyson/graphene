// ─────────────────────────────────────────────────────────────────────────
// PHASE 0 SPIKE — THROWAWAY. Do NOT build the token path on top of this.
// Proves the proforma editor/summary can mount on a chrome-less page driven
// only by proforma state. Seeds a default scenario LOCALLY (no auth/API) so
// the mount can be verified without a graphene login. Phase 2 replaces this
// with a real token-fed entry.
// ─────────────────────────────────────────────────────────────────────────
import { getDefaultAssumptions } from '@shared/proformaDefaults.js';
import { calculateProforma } from '@shared/proformaEngine.js';
import proformaService from './services/ProformaService.js';

// Called from x-init with the live grapheneApp() Alpine instance ($data).
// Mirrors ProformaService.openScenario() but sources the scenario locally.
window.__proformaSpikeSeed = (ctx) => {
  const assumptions = getDefaultAssumptions();
  ctx.proformaScenario = {
    id: 'spike-local',
    name: 'Spike Variant (local)',
    description: 'Phase 0 mount check — not persisted',
    locked: false,
    assumptions
  };
  ctx.proformaAssumptions = assumptions;
  ctx.proformaComputed = calculateProforma(assumptions);
  ctx.proformaView = 'editor';
  ctx.proformaEditorTab = 'summary';
  ctx.proformaDirty = false;
  proformaService._reseedMarketSources(ctx);
  console.log('[spike] seeded local scenario; proformaComputed set:', !!ctx.proformaComputed);
};
