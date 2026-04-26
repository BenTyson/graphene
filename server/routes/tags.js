import express from 'express';
import asyncHandler from 'express-async-handler';
import { authenticateToken } from './auth.js';

const router = express.Router();

const INTERNAL_ROLES = ['SUPER_ADMIN', 'SCIENCE_TEAM', 'EXECUTIVE_TEAM', 'TEAM_MEMBER'];

function requireInternalAccess(req, res, next) {
  if (!INTERNAL_ROLES.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}

router.use(authenticateToken, requireInternalAccess);

// Default seed values — used to populate the table on first read for a kind.
const DEFAULT_CATEGORY_TAGS = [
  'Fundraising', 'Shareholders', 'Patents', 'Legal',
  'Decks & Graphics', 'Notes & Research', 'Production',
  'Science', 'R&D',
  'Finances', 'Sales', 'Administrative Ops', 'Proforma', 'Web & Marketing'
];
const DEFAULT_INSTITUTION_TAGS = [
  'Curia', 'NEI', 'SpectraPower', 'GoEco',
  'Positron Magnetics', 'GEIC', 'Apollo', 'EAG'
];

async function ensureSeeded(prisma) {
  const counts = await prisma.tag.groupBy({ by: ['kind'], _count: true });
  const seenKinds = new Set(counts.map(c => c.kind));

  const writes = [];
  if (!seenKinds.has('CATEGORY')) {
    writes.push(prisma.tag.createMany({
      data: DEFAULT_CATEGORY_TAGS.map((name, i) => ({ name, kind: 'CATEGORY', position: i })),
      skipDuplicates: true
    }));
  }
  if (!seenKinds.has('INSTITUTION')) {
    writes.push(prisma.tag.createMany({
      data: DEFAULT_INSTITUTION_TAGS.map((name, i) => ({ name, kind: 'INSTITUTION', position: i })),
      skipDuplicates: true
    }));
  }
  if (writes.length) await Promise.all(writes);
}

// GET /api/tags - list all (or filter by kind=CATEGORY|INSTITUTION)
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  await ensureSeeded(prisma);

  const where = {};
  if (req.query.kind) where.kind = req.query.kind;

  const tags = await prisma.tag.findMany({
    where,
    orderBy: [{ kind: 'asc' }, { position: 'asc' }, { name: 'asc' }]
  });
  res.json(tags);
}));

// POST /api/tags - create (any internal user)
router.post('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { name, kind } = req.body;

  const cleanName = (name || '').trim();
  if (!cleanName) return res.status(400).json({ error: 'Name is required' });
  if (cleanName.length > 60) return res.status(400).json({ error: 'Name is too long (max 60)' });
  if (!['CATEGORY', 'INSTITUTION'].includes(kind)) {
    return res.status(400).json({ error: 'Kind must be CATEGORY or INSTITUTION' });
  }

  const existing = await prisma.tag.findUnique({
    where: { kind_name: { kind, name: cleanName } }
  });
  if (existing) return res.status(409).json({ error: 'A tag with that name already exists' });

  const maxPos = await prisma.tag.aggregate({
    where: { kind },
    _max: { position: true }
  });

  const tag = await prisma.tag.create({
    data: { name: cleanName, kind, position: (maxPos._max.position ?? -1) + 1 }
  });
  res.status(201).json(tag);
}));

// DELETE /api/tags/:id - remove from system. Existing task/goal tags retain
// the string but the option no longer appears in pickers. Restricted to
// SUPER_ADMIN and EXECUTIVE_TEAM since this affects the org-wide list.
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  if (!['SUPER_ADMIN', 'EXECUTIVE_TEAM'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only exec or admin can remove system tags' });
  }
  await prisma.tag.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

export default router;
