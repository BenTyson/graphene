import express from 'express';
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

  const scenarios = await prisma.proformaScenario.findMany({
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

export default router;
