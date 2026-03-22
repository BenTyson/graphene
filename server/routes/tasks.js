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

async function logActivity(prisma, { taskId, userId, action, fromValue, toValue }) {
  await prisma.taskActivity.create({
    data: { taskId, userId, action, fromValue: fromValue || null, toValue: toValue || null }
  });
}

// All routes require auth + internal access
router.use(authenticateToken, requireInternalAccess);

// GET /api/tasks/assignees - lightweight user list for dropdowns
router.get('/assignees', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      role: { in: INTERNAL_ROLES }
    },
    select: { id: true, firstName: true, lastName: true, username: true, role: true },
    orderBy: { firstName: 'asc' }
  });

  res.json(users);
}));

// GET /api/tasks/stats - counts by status for dashboard
router.get('/stats', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;

  const [statusCounts, myTaskCount, overdueCount] = await Promise.all([
    prisma.task.groupBy({
      by: ['status'],
      where: { parentId: null, status: { not: 'ARCHIVED' } },
      _count: true
    }),
    prisma.task.count({
      where: { assigneeId: userId, status: { notIn: ['DONE', 'ARCHIVED'] } }
    }),
    prisma.task.count({
      where: {
        status: { notIn: ['DONE', 'ARCHIVED'] },
        dueDate: { lt: new Date() }
      }
    })
  ]);

  const stats = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
  statusCounts.forEach(s => { stats[s.status] = s._count; });

  res.json({ ...stats, myTasks: myTaskCount, overdue: overdueCount });
}));

// GET /api/tasks - list with filters
router.get('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const {
    status, priority, assigneeId, creatorId, search,
    parentId, overdue, sortBy = 'position', order = 'asc',
    limit, offset
  } = req.query;

  const where = {};

  // Default: show only root tasks (no subtasks) unless parentId specified
  if (parentId === undefined) {
    where.parentId = null;
  } else if (parentId !== 'all') {
    where.parentId = parentId;
  }

  if (status) {
    const statuses = status.split(',');
    where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
  }

  if (priority) {
    const priorities = priority.split(',');
    where.priority = priorities.length === 1 ? priorities[0] : { in: priorities };
  }

  if (assigneeId) where.assigneeId = assigneeId;
  if (creatorId) where.creatorId = creatorId;

  if (overdue === 'true') {
    where.dueDate = { lt: new Date() };
    where.status = { notIn: ['DONE', 'ARCHIVED'] };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  const orderBy = sortBy === 'dueDate'
    ? [{ dueDate: { sort: order, nulls: 'last' } }, { position: 'asc' }]
    : sortBy === 'priority'
      ? [{ priority: order }, { position: 'asc' }]
      : [{ position: order }, { createdAt: 'desc' }];

  const queryOptions = {
    where,
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, username: true } },
      assignee: { select: { id: true, firstName: true, lastName: true, username: true } },
      _count: { select: { subtasks: true, comments: true } },
      subtasks: {
        select: { id: true, status: true },
        orderBy: { position: 'asc' }
      }
    },
    orderBy
  };

  if (limit) queryOptions.take = parseInt(limit);
  if (offset) queryOptions.skip = parseInt(offset);

  const tasks = await prisma.task.findMany(queryOptions);

  // Convert dates
  const result = tasks.map(t => ({
    ...t,
    dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : null
  }));

  res.json(result);
}));

// GET /api/tasks/:id - single task with full details
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, username: true } },
      assignee: { select: { id: true, firstName: true, lastName: true, username: true } },
      subtasks: {
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true, username: true } },
          _count: { select: { subtasks: true, comments: true } }
        },
        orderBy: { position: 'asc' }
      },
      comments: {
        include: {
          author: { select: { id: true, firstName: true, lastName: true, username: true } }
        },
        orderBy: { createdAt: 'asc' }
      },
      activities: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, username: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      },
      _count: { select: { subtasks: true, comments: true } }
    }
  });

  if (!task) return res.status(404).json({ error: 'Task not found' });

  res.json({
    ...task,
    dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
    subtasks: task.subtasks.map(s => ({
      ...s,
      dueDate: s.dueDate ? s.dueDate.toISOString().split('T')[0] : null
    }))
  });
}));

// POST /api/tasks - create
router.post('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { title, description, status, priority, dueDate, assigneeId, parentId, tags } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Get max position for the target status column
  const maxPos = await prisma.task.aggregate({
    where: { status: status || 'TODO', parentId: parentId || null },
    _max: { position: true }
  });

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description || null,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      position: (maxPos._max.position ?? -1) + 1,
      tags: tags || [],
      creatorId: userId,
      assigneeId: assigneeId || null,
      parentId: parentId || null
    },
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, username: true } },
      assignee: { select: { id: true, firstName: true, lastName: true, username: true } },
      _count: { select: { subtasks: true, comments: true } },
      subtasks: { select: { id: true, status: true } }
    }
  });

  await logActivity(prisma, { taskId: task.id, userId, action: 'created' });

  if (assigneeId) {
    await logActivity(prisma, { taskId: task.id, userId, action: 'assigned', toValue: assigneeId });
  }

  res.status(201).json({
    ...task,
    dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null
  });
}));

// PUT /api/tasks/:id - update
router.put('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;
  const { title, description, status, priority, dueDate, assigneeId, tags } = req.body;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  // Only creator or SUPER_ADMIN can edit
  if (existing.creatorId !== userId && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only the task creator or admin can edit this task' });
  }

  const data = {};
  if (title !== undefined) data.title = title.trim();
  if (description !== undefined) data.description = description || null;
  if (tags !== undefined) data.tags = tags;
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

  // Track changes for activity log
  if (status !== undefined && status !== existing.status) {
    data.status = status;
    await logActivity(prisma, { taskId: id, userId, action: 'status_changed', fromValue: existing.status, toValue: status });
  }

  if (priority !== undefined && priority !== existing.priority) {
    data.priority = priority;
    await logActivity(prisma, { taskId: id, userId, action: 'priority_changed', fromValue: existing.priority, toValue: priority });
  }

  if (assigneeId !== undefined && assigneeId !== existing.assigneeId) {
    data.assigneeId = assigneeId || null;
    await logActivity(prisma, { taskId: id, userId, action: 'assigned', fromValue: existing.assigneeId, toValue: assigneeId || null });
  }

  if (dueDate !== undefined) {
    const oldDate = existing.dueDate ? existing.dueDate.toISOString().split('T')[0] : null;
    if (dueDate !== oldDate) {
      await logActivity(prisma, { taskId: id, userId, action: 'due_date_changed', fromValue: oldDate, toValue: dueDate || null });
    }
  }

  if (title !== undefined && title.trim() !== existing.title) {
    await logActivity(prisma, { taskId: id, userId, action: 'edited', fromValue: existing.title, toValue: title.trim() });
  }

  const task = await prisma.task.update({
    where: { id },
    data,
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, username: true } },
      assignee: { select: { id: true, firstName: true, lastName: true, username: true } },
      _count: { select: { subtasks: true, comments: true } },
      subtasks: { select: { id: true, status: true } }
    }
  });

  res.json({
    ...task,
    dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null
  });
}));

// PATCH /api/tasks/:id/status - quick status change
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;
  const { status, position } = req.body;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  const data = { status };
  if (position !== undefined) data.position = position;

  if (status !== existing.status) {
    await logActivity(prisma, { taskId: id, userId, action: 'status_changed', fromValue: existing.status, toValue: status });
  }

  const task = await prisma.task.update({
    where: { id },
    data,
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, username: true } },
      assignee: { select: { id: true, firstName: true, lastName: true, username: true } },
      _count: { select: { subtasks: true, comments: true } },
      subtasks: { select: { id: true, status: true } }
    }
  });

  res.json({
    ...task,
    dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null
  });
}));

// PATCH /api/tasks/:id/position - reorder
router.patch('/:id/position', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { id } = req.params;
  const { position } = req.body;

  const task = await prisma.task.update({
    where: { id },
    data: { position }
  });

  res.json(task);
}));

// DELETE /api/tasks/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (task.creatorId !== userId && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only the task creator or admin can delete this task' });
  }

  await prisma.task.delete({ where: { id } });
  res.json({ success: true });
}));

// POST /api/tasks/:id/comments
router.post('/:id/comments', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const comment = await prisma.taskComment.create({
    data: {
      content: content.trim(),
      taskId: id,
      authorId: userId
    },
    include: {
      author: { select: { id: true, firstName: true, lastName: true, username: true } }
    }
  });

  await logActivity(prisma, { taskId: id, userId, action: 'comment_added' });

  res.status(201).json(comment);
}));

// DELETE /api/tasks/:id/comments/:commentId
router.delete('/:id/comments/:commentId', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { commentId } = req.params;

  const comment = await prisma.taskComment.findUnique({ where: { id: commentId } });
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

  if (comment.authorId !== userId && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only the comment author or admin can delete this comment' });
  }

  await prisma.taskComment.delete({ where: { id: commentId } });
  res.json({ success: true });
}));

export default router;
