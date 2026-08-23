import express from 'express';
import asyncHandler from 'express-async-handler';
import { authenticateToken } from './auth.js';
import { createFileUploadMiddleware, uploadFile, deleteFileFromStorage } from '../utils/fileUpload.js';

const router = express.Router();

const INTERNAL_ROLES = ['SUPER_ADMIN', 'SCIENCE_TEAM', 'EXECUTIVE_TEAM', 'TEAM_MEMBER'];

function requireInternalAccess(req, res, next) {
  if (!INTERNAL_ROLES.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}

const attachmentUpload = createFileUploadMiddleware('task-attachments', {
  allowedTypes: [
    'application/pdf', 'image/jpeg', 'image/png', 'image/gif',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel', 'application/msword', 'text/plain', 'text/csv'
  ],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.docx', '.xlsx', '.xls', '.doc', '.txt', '.csv'],
  maxSize: 15 * 1024 * 1024,
  validateContent: false
});

async function logActivity(prisma, { taskId, userId, action, fromValue, toValue }) {
  await prisma.taskActivity.create({
    data: { taskId, userId, action, fromValue: fromValue || null, toValue: toValue || null }
  });
}

function normalizeCost(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

function serializeTask(task) {
  if (!task) return task;
  return {
    ...task,
    dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
    cost: task.cost == null ? null : Number(task.cost),
    costPaidAt: task.costPaidAt ? task.costPaidAt.toISOString() : null
  };
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
      where: { assignees: { some: { userId } }, status: { notIn: ['DONE', 'ARCHIVED'] } }
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

// GET /api/tasks/costs/summary - aggregate totals for the Costs view
router.get('/costs/summary', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const tasks = await prisma.task.findMany({
    where: { cost: { not: null }, status: { not: 'ARCHIVED' } },
    select: { cost: true, costPaid: true, goalId: true, tags: true }
  });

  let openTotal = 0, paidTotal = 0, openCount = 0, paidCount = 0;
  for (const t of tasks) {
    const amt = Number(t.cost);
    if (t.costPaid) { paidTotal += amt; paidCount += 1; }
    else { openTotal += amt; openCount += 1; }
  }

  res.json({
    openTotal: Math.round(openTotal * 100) / 100,
    paidTotal: Math.round(paidTotal * 100) / 100,
    grandTotal: Math.round((openTotal + paidTotal) * 100) / 100,
    openCount,
    paidCount,
    totalCount: openCount + paidCount
  });
}));

// PATCH /api/tasks/:id/cost-paid - quick toggle
router.patch('/:id/cost-paid', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;
  const { paid } = req.body;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Task not found' });
  if (existing.cost == null) return res.status(400).json({ error: 'Task has no cost set' });

  const target = Boolean(paid);
  if (target !== existing.costPaid) {
    await prisma.task.update({
      where: { id },
      data: { costPaid: target, costPaidAt: target ? new Date() : null }
    });
    await logActivity(prisma, {
      taskId: id, userId,
      action: target ? 'cost_paid' : 'cost_unpaid',
      toValue: String(Number(existing.cost))
    });
  }

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, username: true } },
      assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, username: true } } } },
      goal: { select: { id: true, title: true, status: true } },
      _count: { select: { subtasks: true, comments: true } },
      subtasks: { select: { id: true, status: true, dueDate: true } }
    }
  });

  res.json(serializeTask(task));
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

  if (assigneeId) where.assignees = { some: { userId: assigneeId } };
  if (creatorId) where.creatorId = creatorId;
  if (req.query.goalId !== undefined) {
    where.goalId = req.query.goalId === 'none' ? null : req.query.goalId;
  }

  if (overdue === 'true') {
    where.dueDate = { lt: new Date() };
    if (where.status) {
      // Merge with existing status filter -- exclude DONE/ARCHIVED from the requested statuses
      const excluded = ['DONE', 'ARCHIVED'];
      const requested = Array.isArray(where.status?.in) ? where.status.in : [where.status];
      const filtered = requested.filter(s => !excluded.includes(s));
      where.status = filtered.length === 1 ? filtered[0] : { in: filtered };
    } else {
      where.status = { notIn: ['DONE', 'ARCHIVED'] };
    }
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
      assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, username: true } } } },
      goal: { select: { id: true, title: true, status: true } },
      _count: { select: { subtasks: true, comments: true, attachments: true } },
      subtasks: {
        select: { id: true, status: true, dueDate: true },
        orderBy: { position: 'asc' }
      }
    },
    orderBy
  };

  if (limit) queryOptions.take = parseInt(limit);
  if (offset) queryOptions.skip = parseInt(offset);

  const tasks = await prisma.task.findMany(queryOptions);

  // Blocker counts for all tasks in a single pair of aggregations
  const taskIds = tasks.map(t => t.id);
  const [totalCounts, incompleteCounts] = taskIds.length === 0 ? [[], []] : await Promise.all([
    prisma.taskDependency.groupBy({
      by: ['blockedTaskId'],
      where: { blockedTaskId: { in: taskIds } },
      _count: true
    }),
    prisma.taskDependency.groupBy({
      by: ['blockedTaskId'],
      where: {
        blockedTaskId: { in: taskIds },
        blockingTask: { status: { notIn: ['DONE', 'ARCHIVED'] } }
      },
      _count: true
    })
  ]);
  const totalByTask = Object.fromEntries(totalCounts.map(c => [c.blockedTaskId, c._count]));
  const incompleteByTask = Object.fromEntries(incompleteCounts.map(c => [c.blockedTaskId, c._count]));

  // Convert dates + attach blocker counts
  const result = tasks.map(t => ({
    ...t,
    dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : null,
    cost: t.cost == null ? null : Number(t.cost),
    costPaidAt: t.costPaidAt ? t.costPaidAt.toISOString() : null,
    blockerCount: totalByTask[t.id] || 0,
    incompleteBlockerCount: incompleteByTask[t.id] || 0
  }));

  res.json(result);
}));

// PATCH /api/tasks/reorder - batch update positions (drag-and-drop)
router.patch('/reorder', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { taskId, newStatus, positions } = req.body;

  if (!taskId || !positions || !Array.isArray(positions)) {
    return res.status(400).json({ error: 'taskId and positions array are required' });
  }

  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  await prisma.$transaction(async (tx) => {
    if (newStatus && newStatus !== existing.status) {
      await tx.task.update({ where: { id: taskId }, data: { status: newStatus } });
      await logActivity(prisma, {
        taskId, userId, action: 'status_changed',
        fromValue: existing.status, toValue: newStatus
      });
    }

    for (const item of positions) {
      await tx.task.update({
        where: { id: item.id },
        data: { position: item.position }
      });
    }
  });

  res.json({ success: true });
}));

// GET /api/tasks/:id - single task with full details
router.get('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, username: true } },
      assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, username: true } } } },
      subtasks: {
        include: {
          assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, username: true } } } },
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
      attachments: {
        include: {
          uploadedBy: { select: { id: true, firstName: true, lastName: true, username: true } }
        },
        orderBy: { createdAt: 'desc' }
      },
      activities: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, username: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      },
      blockedBy: {
        include: {
          blockingTask: { select: { id: true, title: true, status: true } }
        },
        orderBy: { createdAt: 'asc' }
      },
      blocking: {
        include: {
          blockedTask: { select: { id: true, title: true, status: true } }
        },
        orderBy: { createdAt: 'asc' }
      },
      _count: { select: { subtasks: true, comments: true, attachments: true } }
    }
  });

  if (!task) return res.status(404).json({ error: 'Task not found' });

  const blockerCount = task.blockedBy.length;
  const incompleteBlockerCount = task.blockedBy.filter(
    d => !['DONE', 'ARCHIVED'].includes(d.blockingTask.status)
  ).length;

  res.json({
    ...serializeTask(task),
    subtasks: task.subtasks.map(s => serializeTask(s)),
    blockerCount,
    incompleteBlockerCount
  });
}));

// POST /api/tasks - create
router.post('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { title, description, status, priority, dueDate, assigneeIds, parentId, goalId, tags, cost, costPaid } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const cleanAssigneeIds = Array.isArray(assigneeIds) ? [...new Set(assigneeIds.filter(Boolean))] : [];
  const normalizedCost = normalizeCost(cost);
  const isPaid = normalizedCost != null && Boolean(costPaid);

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
      cost: normalizedCost,
      costPaid: isPaid,
      costPaidAt: isPaid ? new Date() : null,
      creatorId: userId,
      parentId: parentId || null,
      goalId: goalId || null,
      assignees: cleanAssigneeIds.length
        ? { create: cleanAssigneeIds.map(uid => ({ userId: uid })) }
        : undefined
    },
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, username: true } },
      assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, username: true } } } },
      goal: { select: { id: true, title: true, status: true } },
      _count: { select: { subtasks: true, comments: true } },
      subtasks: { select: { id: true, status: true, dueDate: true } }
    }
  });

  await logActivity(prisma, { taskId: task.id, userId, action: 'created' });

  for (const uid of cleanAssigneeIds) {
    await logActivity(prisma, { taskId: task.id, userId, action: 'assigned', toValue: uid });
  }

  if (normalizedCost != null) {
    await logActivity(prisma, { taskId: task.id, userId, action: 'cost_set', toValue: String(normalizedCost) });
    if (isPaid) {
      await logActivity(prisma, { taskId: task.id, userId, action: 'cost_paid', toValue: String(normalizedCost) });
    }
  }

  res.status(201).json(serializeTask(task));
}));

// PUT /api/tasks/:id - update
router.put('/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;
  const { title, description, status, priority, dueDate, assigneeIds, goalId, tags, cost, costPaid } = req.body;

  const existing = await prisma.task.findUnique({
    where: { id },
    include: { assignees: { select: { userId: true } } }
  });
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  // Only creator or SUPER_ADMIN can edit
  if (existing.creatorId !== userId && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only the task creator or admin can edit this task' });
  }

  // A title, if sent, must be a non-empty string. Without this an inline edit that
  // submits "" or "   " would blank out the row's title (POST already guards this).
  let nextTitle;
  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    nextTitle = title.trim();
  }

  const data = {};
  if (nextTitle !== undefined) data.title = nextTitle;
  if (description !== undefined) data.description = description || null;
  if (tags !== undefined) data.tags = tags;
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
  if (goalId !== undefined) data.goalId = goalId || null;

  // Track changes for activity log
  if (status !== undefined && status !== existing.status) {
    data.status = status;
    await logActivity(prisma, { taskId: id, userId, action: 'status_changed', fromValue: existing.status, toValue: status });
  }

  if (priority !== undefined && priority !== existing.priority) {
    data.priority = priority;
    await logActivity(prisma, { taskId: id, userId, action: 'priority_changed', fromValue: existing.priority, toValue: priority });
  }

  if (dueDate !== undefined) {
    const oldDate = existing.dueDate ? existing.dueDate.toISOString().split('T')[0] : null;
    if (dueDate !== oldDate) {
      await logActivity(prisma, { taskId: id, userId, action: 'due_date_changed', fromValue: oldDate, toValue: dueDate || null });
    }
  }

  if (nextTitle !== undefined && nextTitle !== existing.title) {
    await logActivity(prisma, { taskId: id, userId, action: 'edited', fromValue: existing.title, toValue: nextTitle });
    // A subtask's own activity trail is not surfaced anywhere in the UI (subtask rows cannot be
    // opened as a detail panel), so mirror the rename onto the parent, where it is visible.
    if (existing.parentId) {
      await logActivity(prisma, {
        taskId: existing.parentId, userId, action: 'subtask_renamed',
        fromValue: existing.title, toValue: nextTitle
      });
    }
  }

  // Cost handling -- amount and paid flag are independent inputs
  let nextCost = existing.cost == null ? null : Number(existing.cost);
  let nextPaid = existing.costPaid;
  let costAmountChanged = false;
  let paidStateChanged = false;

  if (cost !== undefined) {
    const normalized = normalizeCost(cost);
    if (normalized !== nextCost) {
      nextCost = normalized;
      costAmountChanged = true;
    }
  }

  if (costPaid !== undefined) {
    const targetPaid = nextCost != null && Boolean(costPaid);
    if (targetPaid !== nextPaid) {
      nextPaid = targetPaid;
      paidStateChanged = true;
    }
  }

  // If cost was cleared, force paid -> false
  if (costAmountChanged && nextCost == null && nextPaid) {
    nextPaid = false;
    paidStateChanged = true;
  }

  if (costAmountChanged) {
    data.cost = nextCost;
    const fromVal = existing.cost == null ? null : String(Number(existing.cost));
    const toVal = nextCost == null ? null : String(nextCost);
    const action = existing.cost == null ? 'cost_set' : (nextCost == null ? 'cost_removed' : 'cost_changed');
    await logActivity(prisma, { taskId: id, userId, action, fromValue: fromVal, toValue: toVal });
  }

  if (paidStateChanged) {
    data.costPaid = nextPaid;
    data.costPaidAt = nextPaid ? new Date() : null;
    await logActivity(prisma, {
      taskId: id, userId,
      action: nextPaid ? 'cost_paid' : 'cost_unpaid',
      toValue: nextCost == null ? null : String(nextCost)
    });
  }

  // Reconcile assignee list if provided
  if (Array.isArray(assigneeIds)) {
    const nextSet = new Set(assigneeIds.filter(Boolean));
    const prevSet = new Set(existing.assignees.map(a => a.userId));
    const toAdd = [...nextSet].filter(uid => !prevSet.has(uid));
    const toRemove = [...prevSet].filter(uid => !nextSet.has(uid));

    if (toRemove.length) {
      await prisma.taskAssignment.deleteMany({ where: { taskId: id, userId: { in: toRemove } } });
    }
    if (toAdd.length) {
      await prisma.taskAssignment.createMany({
        data: toAdd.map(uid => ({ taskId: id, userId: uid })),
        skipDuplicates: true
      });
    }
    for (const uid of toAdd) {
      await logActivity(prisma, { taskId: id, userId, action: 'assigned', toValue: uid });
    }
    for (const uid of toRemove) {
      await logActivity(prisma, { taskId: id, userId, action: 'unassigned', fromValue: uid });
    }
  }

  const task = await prisma.task.update({
    where: { id },
    data,
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, username: true } },
      assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, username: true } } } },
      goal: { select: { id: true, title: true, status: true } },
      _count: { select: { subtasks: true, comments: true } },
      subtasks: { select: { id: true, status: true, dueDate: true } }
    }
  });

  res.json(serializeTask(task));
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
      assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, username: true } } } },
      goal: { select: { id: true, title: true, status: true } },
      _count: { select: { subtasks: true, comments: true } },
      subtasks: { select: { id: true, status: true, dueDate: true } }
    }
  });

  res.json(serializeTask(task));
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

  // Clean up attachment files before cascade delete
  const attachments = await prisma.taskAttachment.findMany({
    where: { taskId: id },
    select: { filePath: true }
  });
  for (const att of attachments) {
    await deleteFileFromStorage(att.filePath);
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

// POST /api/tasks/:id/attachments - upload files
router.post('/:id/attachments', attachmentUpload.array('attachments', 5), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files provided' });
  }

  const attachments = [];
  for (const file of req.files) {
    const result = await uploadFile(file, 'task-attachments');
    if (result.success) {
      const attachment = await prisma.taskAttachment.create({
        data: {
          taskId: id,
          uploadedById: userId,
          fileName: file.originalname,
          filePath: result.path,
          fileSize: file.size,
          mimeType: file.mimetype
        },
        include: {
          uploadedBy: { select: { id: true, firstName: true, lastName: true, username: true } }
        }
      });
      attachments.push(attachment);

      await logActivity(prisma, {
        taskId: id, userId, action: 'attachment_added',
        toValue: file.originalname
      });
    }
  }

  res.status(201).json(attachments);
}));

// DELETE /api/tasks/:id/attachments/:attachmentId
router.delete('/:id/attachments/:attachmentId', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id, attachmentId } = req.params;

  const attachment = await prisma.taskAttachment.findUnique({
    where: { id: attachmentId },
    include: { task: { select: { creatorId: true } } }
  });

  if (!attachment) return res.status(404).json({ error: 'Attachment not found' });

  const canDelete = attachment.uploadedById === userId
    || attachment.task.creatorId === userId
    || req.user.role === 'SUPER_ADMIN';

  if (!canDelete) {
    return res.status(403).json({ error: 'Only the uploader, task creator, or admin can delete this attachment' });
  }

  await deleteFileFromStorage(attachment.filePath);
  await prisma.taskAttachment.delete({ where: { id: attachmentId } });

  await logActivity(prisma, {
    taskId: id, userId, action: 'attachment_removed',
    fromValue: attachment.fileName
  });

  res.json({ success: true });
}));

// POST /api/tasks/:id/dependencies - add "blocked by" link (blockingTaskId blocks :id)
router.post('/:id/dependencies', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;
  const { blockingTaskId } = req.body;

  if (!blockingTaskId) return res.status(400).json({ error: 'blockingTaskId is required' });
  if (blockingTaskId === id) return res.status(400).json({ error: 'A task cannot block itself' });

  const [blockedTask, blockingTask] = await Promise.all([
    prisma.task.findUnique({ where: { id }, select: { id: true, title: true } }),
    prisma.task.findUnique({ where: { id: blockingTaskId }, select: { id: true, title: true } })
  ]);
  if (!blockedTask || !blockingTask) return res.status(404).json({ error: 'Task not found' });

  // Cycle check: BFS from :id forward along blocking edges. If we can reach blockingTaskId,
  // then blockingTaskId already depends (transitively) on :id, and adding this link would cycle.
  const visited = new Set([id]);
  let frontier = [id];
  for (let depth = 0; depth < 200 && frontier.length > 0; depth++) {
    const edges = await prisma.taskDependency.findMany({
      where: { blockingTaskId: { in: frontier } },
      select: { blockedTaskId: true }
    });
    const next = [];
    for (const e of edges) {
      if (e.blockedTaskId === blockingTaskId) {
        return res.status(400).json({ error: 'This link would create a circular dependency' });
      }
      if (!visited.has(e.blockedTaskId)) {
        visited.add(e.blockedTaskId);
        next.push(e.blockedTaskId);
      }
    }
    frontier = next;
  }

  try {
    const link = await prisma.taskDependency.create({
      data: { blockedTaskId: id, blockingTaskId },
      include: {
        blockingTask: { select: { id: true, title: true, status: true } }
      }
    });
    await logActivity(prisma, {
      taskId: id, userId, action: 'dependency_added', toValue: blockingTask.title
    });
    res.status(201).json(link);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'This dependency already exists' });
    }
    throw err;
  }
}));

// DELETE /api/tasks/:id/dependencies/:linkId - remove a dependency link
router.delete('/:id/dependencies/:linkId', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id, linkId } = req.params;

  const link = await prisma.taskDependency.findUnique({
    where: { id: linkId },
    include: {
      blockingTask: { select: { title: true } },
      blockedTask: { select: { title: true } }
    }
  });
  if (!link) return res.status(404).json({ error: 'Dependency link not found' });
  if (link.blockedTaskId !== id && link.blockingTaskId !== id) {
    return res.status(400).json({ error: 'Dependency link does not belong to this task' });
  }

  await prisma.taskDependency.delete({ where: { id: linkId } });

  // Record on whichever side the request came from
  const otherTitle = link.blockedTaskId === id ? link.blockingTask.title : link.blockedTask.title;
  await logActivity(prisma, {
    taskId: id, userId, action: 'dependency_removed', fromValue: otherTitle
  });

  res.json({ success: true });
}));

export default router;
