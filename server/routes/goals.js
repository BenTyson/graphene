import express from 'express';
import asyncHandler from 'express-async-handler';
import { authenticateToken } from './auth.js';
import { orgYmd } from '../../shared/orgTimezone.js';

const router = express.Router();

const INTERNAL_ROLES = ['SUPER_ADMIN', 'SCIENCE_TEAM', 'EXECUTIVE_TEAM', 'TEAM_MEMBER'];

function requireInternalAccess(req, res, next) {
  if (!INTERNAL_ROLES.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}

router.use(authenticateToken, requireInternalAccess);

const userSelect = { id: true, firstName: true, lastName: true, username: true };

function shapeGoal(goal, taskBuckets = {}) {
  const buckets = taskBuckets[goal.id] || { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0, ARCHIVED: 0, total: 0 };
  const counted = buckets.total - buckets.ARCHIVED;
  const done = buckets.DONE;
  const progress = counted > 0 ? Math.round((done / counted) * 100) : 0;
  return {
    ...goal,
    targetDate: goal.targetDate ? goal.targetDate.toISOString().split('T')[0] : null,
    archivedAt: goal.archivedAt ? goal.archivedAt.toISOString() : null,
    taskCounts: {
      total: counted,
      todo: buckets.TODO,
      inProgress: buckets.IN_PROGRESS,
      inReview: buckets.IN_REVIEW,
      done: buckets.DONE
    },
    progress
  };
}

async function buildTaskBuckets(prisma, goalIds) {
  if (!goalIds.length) return {};
  const grouped = await prisma.task.groupBy({
    by: ['goalId', 'status'],
    where: { goalId: { in: goalIds }, parentId: null },
    _count: true
  });
  const buckets = {};
  for (const row of grouped) {
    if (!buckets[row.goalId]) buckets[row.goalId] = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0, ARCHIVED: 0, total: 0 };
    buckets[row.goalId][row.status] = row._count;
    buckets[row.goalId].total += row._count;
  }
  return buckets;
}

// GET /api/goals - list (filters: status, ownerId, search, includeArchived)
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { status, ownerId, search, includeArchived } = req.query;

  const where = {};
  if (!includeArchived || includeArchived === 'false') where.archivedAt = null;
  if (status) {
    const list = status.split(',');
    where.status = list.length === 1 ? list[0] : { in: list };
  }
  if (ownerId) where.ownerId = ownerId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  const goals = await prisma.goal.findMany({
    where,
    include: {
      owner: { select: userSelect },
      createdBy: { select: userSelect }
    },
    orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'desc' }]
  });

  const buckets = await buildTaskBuckets(prisma, goals.map(g => g.id));
  res.json(goals.map(g => shapeGoal(g, buckets)));
}));

// GET /api/goals/:id - single goal with tasks
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const goal = await prisma.goal.findUnique({
    where: { id: req.params.id },
    include: {
      owner: { select: userSelect },
      createdBy: { select: userSelect }
    }
  });
  if (!goal) return res.status(404).json({ error: 'Goal not found' });

  const tasks = await prisma.task.findMany({
    where: { goalId: goal.id, parentId: null },
    include: {
      creator: { select: userSelect },
      assignees: { include: { user: { select: userSelect } } },
      _count: { select: { subtasks: true, comments: true, attachments: true } },
      subtasks: { select: { id: true, status: true, dueDate: true }, orderBy: { position: 'asc' } }
    },
    orderBy: [{ status: 'asc' }, { position: 'asc' }]
  });

  const buckets = await buildTaskBuckets(prisma, [goal.id]);

  res.json({
    ...shapeGoal(goal, buckets),
    tasks: tasks.map(t => ({
      ...t,
      dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : null,
      // Same shape serializeTask() emits in routes/tasks.js: a resolved YYYY-MM-DD, with the
      // null column falling back to createdAt in the org timezone (D-016 -- no backfill), plus
      // the derived flag. Without this the raw column shipped from here as a full ISO timestamp
      // (and as null for every legacy row) while the tasks router shipped a plain date — the same
      // field in two shapes, which is worse than missing: a consumer looks correct until it meets
      // a row of the other kind. `createdAt` is on these objects because the query above uses
      // `include`, not a narrowing `select`.
      startDate: t.startDate ? t.startDate.toISOString().split('T')[0] : orgYmd(t.createdAt),
      startDateIsDerived: t.startDate == null
    }))
  });
}));

// POST /api/goals
router.post('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { title, description, status, targetDate, ownerId, tags } = req.body;

  if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });

  const maxPos = await prisma.goal.aggregate({
    where: { status: status || 'ACTIVE' },
    _max: { position: true }
  });

  const goal = await prisma.goal.create({
    data: {
      title: title.trim(),
      description: description || null,
      status: status || 'ACTIVE',
      targetDate: targetDate ? new Date(targetDate) : null,
      position: (maxPos._max.position ?? -1) + 1,
      tags: Array.isArray(tags) ? tags : [],
      ownerId: ownerId || null,
      createdById: userId
    },
    include: {
      owner: { select: userSelect },
      createdBy: { select: userSelect }
    }
  });

  res.status(201).json(shapeGoal(goal));
}));

// PUT /api/goals/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;
  const { title, description, status, targetDate, ownerId, tags } = req.body;

  const existing = await prisma.goal.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Goal not found' });
  if (existing.createdById !== userId && req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'EXECUTIVE_TEAM') {
    return res.status(403).json({ error: 'Only the goal creator, exec team, or admin can edit this goal' });
  }

  const data = {};
  if (title !== undefined) data.title = title.trim();
  if (description !== undefined) data.description = description || null;
  if (status !== undefined) data.status = status;
  if (targetDate !== undefined) data.targetDate = targetDate ? new Date(targetDate) : null;
  if (ownerId !== undefined) data.ownerId = ownerId || null;
  if (tags !== undefined) data.tags = Array.isArray(tags) ? tags : [];

  const goal = await prisma.goal.update({
    where: { id },
    data,
    include: {
      owner: { select: userSelect },
      createdBy: { select: userSelect }
    }
  });

  const buckets = await buildTaskBuckets(prisma, [goal.id]);
  res.json(shapeGoal(goal, buckets));
}));

// DELETE /api/goals/:id - archive (soft delete) by default; ?hard=true for full delete
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;
  const hard = req.query.hard === 'true';

  const existing = await prisma.goal.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Goal not found' });
  if (existing.createdById !== userId && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only the goal creator or admin can delete this goal' });
  }

  if (hard) {
    await prisma.goal.delete({ where: { id } });
  } else {
    await prisma.goal.update({ where: { id }, data: { archivedAt: new Date() } });
  }
  res.json({ success: true });
}));

// POST /api/goals/:id/restore - unarchive
router.post('/:id/restore', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const goal = await prisma.goal.update({
    where: { id: req.params.id },
    data: { archivedAt: null }
  });
  res.json(goal);
}));

// PATCH /api/goals/:id/tasks - bulk attach/detach tasks
router.patch('/:id/tasks', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  const { addTaskIds = [], removeTaskIds = [] } = req.body;

  const exists = await prisma.goal.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return res.status(404).json({ error: 'Goal not found' });

  if (addTaskIds.length) {
    await prisma.task.updateMany({
      where: { id: { in: addTaskIds } },
      data: { goalId: id }
    });
  }
  if (removeTaskIds.length) {
    await prisma.task.updateMany({
      where: { id: { in: removeTaskIds }, goalId: id },
      data: { goalId: null }
    });
  }
  res.json({ success: true });
}));

export default router;
