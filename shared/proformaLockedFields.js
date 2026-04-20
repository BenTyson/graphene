// ═══════════════════════════════════════════════════════════════
// Proforma Locked Fields Registry
// ═══════════════════════════════════════════════════════════════
//
// Assumption paths listed here are rendered as read-only in the editor:
// faded red background, disabled input, lock-cursor tooltip.
//
// Use for fields whose value is derived from a formula in the source
// spreadsheet — they're stored as numbers in the JSON but shouldn't be
// hand-edited because changing them silently breaks the model's internal
// consistency.
//
// Paths use dot notation matching the assumption object structure, e.g.
//   'production.biocharYieldG'
//   'technical.evBattery.cathodeAnodeRatio'
//   'cogs.hempCostPerKilo'
//
// To lock a field: add its exact dotted path as a string to LOCKED_FIELDS.
// To unlock: remove it.
//
// Only fields rendered via the numInput() helper are affected. Matrix
// cells (quarterlyMatrix, staffing tables, payment schedules) are not
// wired up here yet — add if needed.

export const LOCKED_FIELDS = new Set([
  // Populate with dotted paths. Examples (uncomment to lock):
  // 'production.biocharYieldG',
  // 'production.volumeConversionCuFt',
  // 'technical.evBattery.energyDensityWhKg',
]);

export function isLocked(path) {
  return LOCKED_FIELDS.has(path);
}
