import express from 'express';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import { authenticateToken, requireSuperAdmin } from './auth.js';
import { calculateProforma } from '../../shared/proformaEngine.js';
import { getDefaultAssumptions, validateAssumptions } from '../../shared/proformaDefaults.js';

const router = express.Router();

// All proforma routes require super admin
router.use(authenticateToken, requireSuperAdmin);

// GET /api/proforma/defaults - Return default assumptions template
router.get('/defaults', asyncHandler(async (req, res) => {
  res.json({ assumptions: getDefaultAssumptions() });
}));

// GET /api/proforma/scenarios - List all scenarios (auto-seeds default on first visit)
router.get('/scenarios', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const count = await prisma.proformaScenario.count();
  if (count === 0) {
    await prisma.proformaScenario.create({
      data: {
        name: '2025 Projections',
        description: 'Default scenario based on current spreadsheet assumptions',
        assumptions: getDefaultAssumptions(),
        isDefault: true,
        createdById: req.user.userId
      }
    });
  }

  // Variant clones (shared with investors) are excluded — they are not master
  // scenarios and must never clutter the admin list.
  const scenarios = await prisma.proformaScenario.findMany({
    where: { isVariant: false },
    select: {
      id: true,
      name: true,
      description: true,
      isDefault: true,
      locked: true,
      createdAt: true,
      updatedAt: true,
      createdBy: {
        select: { id: true, firstName: true, lastName: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
  res.json(scenarios);
}));

// GET /api/proforma/scenarios/:id - Get scenario with computed output
router.get('/scenarios/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const scenario = await prisma.proformaScenario.findUnique({
    where: { id: req.params.id },
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true }
      }
    }
  });

  if (!scenario) {
    return res.status(404).json({ error: 'Scenario not found' });
  }

  const computed = calculateProforma(scenario.assumptions);
  res.json({ scenario, computed });
}));

// POST /api/proforma/scenarios - Create new scenario
router.post('/scenarios', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { name, description, assumptions } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const assumptionsData = assumptions || getDefaultAssumptions();
  const errors = validateAssumptions(assumptionsData);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Invalid assumptions', details: errors });
  }

  const scenario = await prisma.proformaScenario.create({
    data: {
      name,
      description: description || null,
      assumptions: assumptionsData,
      createdById: req.user.userId
    }
  });

  const computed = calculateProforma(scenario.assumptions);
  res.status(201).json({ scenario, computed });
}));

// PATCH /api/proforma/scenarios/:id/lock - Toggle locked state
router.patch('/scenarios/:id/lock', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const existing = await prisma.proformaScenario.findUnique({
    where: { id: req.params.id }
  });
  if (!existing) {
    return res.status(404).json({ error: 'Scenario not found' });
  }
  const scenario = await prisma.proformaScenario.update({
    where: { id: req.params.id },
    data: { locked: !existing.locked }
  });
  res.json({ id: scenario.id, locked: scenario.locked });
}));

// PUT /api/proforma/scenarios/:id - Update scenario
router.put('/scenarios/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { name, description, assumptions } = req.body;

  const existing = await prisma.proformaScenario.findUnique({
    where: { id: req.params.id }
  });
  if (!existing) {
    return res.status(404).json({ error: 'Scenario not found' });
  }
  if (existing.locked) {
    return res.status(403).json({ error: 'Scenario is locked' });
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (assumptions !== undefined) {
    const errors = validateAssumptions(assumptions);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Invalid assumptions', details: errors });
    }
    updateData.assumptions = assumptions;
  }

  const scenario = await prisma.proformaScenario.update({
    where: { id: req.params.id },
    data: updateData
  });

  const computed = calculateProforma(scenario.assumptions);
  res.json({ scenario, computed });
}));

// DELETE /api/proforma/scenarios/:id
router.delete('/scenarios/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const existing = await prisma.proformaScenario.findUnique({
    where: { id: req.params.id }
  });
  if (!existing) {
    return res.status(404).json({ error: 'Scenario not found' });
  }
  // Mirror the PUT guard: a locked scenario cannot be deleted.
  if (existing.locked) {
    return res.status(403).json({ error: 'Scenario is locked' });
  }

  await prisma.proformaScenario.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

// POST /api/proforma/compute - Preview computation without saving
router.post('/compute', asyncHandler(async (req, res) => {
  const { assumptions } = req.body;
  if (!assumptions) {
    return res.status(400).json({ error: 'Assumptions are required' });
  }

  const errors = validateAssumptions(assumptions);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Invalid assumptions', details: errors });
  }

  const computed = calculateProforma(assumptions);
  res.json({ computed });
}));

// ---------------------------------------------------------------------------
// Sharing (admin/JWT side). The investor-facing token routes live in a SEPARATE
// router (server/routes/proformaShare.js) with NO requireSuperAdmin guard.
// ---------------------------------------------------------------------------

// POST /api/proforma/scenarios/:id/share - Clone a master into an isolated
// variant and mint a share token. The master row is never modified.
router.post('/scenarios/:id/share', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const mode = req.body?.mode || 'view';

  if (!['view', 'edit'].includes(mode)) {
    return res.status(400).json({ error: "mode must be 'view' or 'edit'" });
  }

  const master = await prisma.proformaScenario.findUnique({
    where: { id: req.params.id }
  });
  if (!master) {
    return res.status(404).json({ error: 'Scenario not found' });
  }
  // Only masters can be shared — never re-share a variant clone.
  if (master.isVariant) {
    return res.status(400).json({ error: 'Cannot share a variant; share a master scenario.' });
  }

  // Snapshot the master's assumptions into a brand-new variant row. The clone is
  // the ONLY thing the token will ever touch.
  const variant = await prisma.proformaScenario.create({
    data: {
      name: `${master.name} (shared)`,
      description: master.description,
      assumptions: master.assumptions,
      isVariant: true,
      parentId: master.id,
      locked: false,
      createdById: req.user.userId
    }
  });

  const token = crypto.randomBytes(32).toString('base64url');
  const share = await prisma.proformaShare.create({
    data: {
      token,
      scenarioId: variant.id,
      mode,
      createdById: req.user.userId
    }
  });

  const embedUrl = `${req.protocol}://${req.get('host')}/proforma-embed.html?token=${token}`;
  res.status(201).json({ share, variant: { id: variant.id, name: variant.name }, embedUrl });
}));

// GET /api/proforma/scenarios/:id/shares - List share tokens for a master.
router.get('/scenarios/:id/shares', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const shares = await prisma.proformaShare.findMany({
    where: { scenario: { parentId: req.params.id } },
    select: {
      id: true,
      token: true,
      mode: true,
      revoked: true,
      createdAt: true,
      scenarioId: true,
      scenario: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(shares);
}));

// POST /api/proforma/shares/:shareId/revoke - Revoke a share token.
router.post('/shares/:shareId/revoke', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const existing = await prisma.proformaShare.findUnique({
    where: { id: req.params.shareId }
  });
  if (!existing) {
    return res.status(404).json({ error: 'Share not found' });
  }
  const share = await prisma.proformaShare.update({
    where: { id: req.params.shareId },
    data: { revoked: true }
  });
  res.json({ id: share.id, revoked: share.revoked });
}));

export default router;
