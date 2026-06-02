import express from 'express';
import asyncHandler from 'express-async-handler';
import { calculateProforma } from '../../shared/proformaEngine.js';
import { validateAssumptions } from '../../shared/proformaDefaults.js';

// ---------------------------------------------------------------------------
// Investor-facing proforma share router.
//
// This router is deliberately SEPARATE from server/routes/proforma.js: it has
// NO requireSuperAdmin guard and is reached only by a share token in the URL.
//
// The master-safety invariant (must never break):
//   A share token can only ever READ or WRITE the single variant clone it
//   points at. It can never reach a master scenario — not via PUT, not via
//   DELETE, not via id substitution. There is no path here that accepts a
//   scenario id from the client; the target row is derived solely from the
//   token. PUT is allowed only when the share mode is 'edit'.
// ---------------------------------------------------------------------------

const router = express.Router();

// Token-auth middleware. Resolves :token -> its variant scenario, or rejects.
// On success, req.share / req.scenario are the ONLY scenario this request may
// touch. No scenario id ever comes from the client.
async function authenticateShareToken(req, res, next) {
  try {
    const { prisma } = req.app.locals;
    const token = req.params.token;

    if (!token) {
      return res.status(401).json({ error: 'Share token required' });
    }

    const share = await prisma.proformaShare.findUnique({
      where: { token },
      include: { scenario: true }
    });

    if (!share || share.revoked) {
      return res.status(404).json({ error: 'Share not found' });
    }

    // Master-safety: the token MUST point at a variant clone. If for any reason
    // it resolves to a master (or a deleted scenario), refuse — never serve or
    // mutate a master through a token.
    if (!share.scenario || !share.scenario.isVariant) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.share = share;
    req.scenario = share.scenario;
    next();
  } catch (err) {
    next(err);
  }
}

// GET /api/proforma/share/:token - Read the variant + its computed output.
// Available in both view and edit modes.
router.get('/:token', authenticateShareToken, asyncHandler(async (req, res) => {
  const { scenario, share } = req;
  const computed = calculateProforma(scenario.assumptions);
  res.json({
    scenario: {
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      assumptions: scenario.assumptions,
      isVariant: scenario.isVariant,
      updatedAt: scenario.updatedAt
    },
    computed,
    mode: share.mode
  });
}));

// PUT /api/proforma/share/:token - Write assumptions to the variant ONLY.
// Allowed only in edit mode. The write targets req.scenario.id (derived from
// the token) — never an id from the URL or body.
router.put('/:token', authenticateShareToken, asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { scenario, share } = req;

  if (share.mode !== 'edit') {
    return res.status(403).json({ error: 'This share is view-only' });
  }

  const { assumptions } = req.body || {};
  if (assumptions === undefined) {
    return res.status(400).json({ error: 'Assumptions are required' });
  }

  const errors = validateAssumptions(assumptions);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Invalid assumptions', details: errors });
  }

  // Only assumptions are writable, and only on the token's own variant row.
  const updated = await prisma.proformaScenario.update({
    where: { id: scenario.id },
    data: { assumptions }
  });

  const computed = calculateProforma(updated.assumptions);
  res.json({
    scenario: {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      assumptions: updated.assumptions,
      isVariant: updated.isVariant,
      updatedAt: updated.updatedAt
    },
    computed,
    mode: share.mode
  });
}));

export default router;
