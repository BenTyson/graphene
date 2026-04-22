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
    ...task,
    dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
    subtasks: task.subtasks.map(s => ({
      ...s,
      dueDate: s.dueDate ? s.dueDate.toISOString().split('T')[0] : null
    })),
    blockerCount,
    incompleteBlockerCount
  });
}));

// POST /api/tasks - create
router.post('/', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { title, description, status, priority, dueDate, assigneeIds, parentId, tags } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const cleanAssigneeIds = Array.isArray(assigneeIds) ? [...new Set(assigneeIds.filter(Boolean))] : [];

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
      parentId: parentId || null,
      assignees: cleanAssigneeIds.length
        ? { create: cleanAssigneeIds.map(uid => ({ userId: uid })) }
        : undefined
    },
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, username: true } },
      assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, username: true } } } },
      _count: { select: { subtasks: true, comments: true } },
      subtasks: { select: { id: true, status: true, dueDate: true } }
    }
  });

  await logActivity(prisma, { taskId: task.id, userId, action: 'created' });

  for (const uid of cleanAssigneeIds) {
    await logActivity(prisma, { taskId: task.id, userId, action: 'assigned', toValue: uid });
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
  const { title, description, status, priority, dueDate, assigneeIds, tags } = req.body;

  const existing = await prisma.task.findUnique({
    where: { id },
    include: { assignees: { select: { userId: true } } }
  });
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

  if (dueDate !== undefined) {
    const oldDate = existing.dueDate ? existing.dueDate.toISOString().split('T')[0] : null;
    if (dueDate !== oldDate) {
      await logActivity(prisma, { taskId: id, userId, action: 'due_date_changed', fromValue: oldDate, toValue: dueDate || null });
    }
  }

  if (title !== undefined && title.trim() !== existing.title) {
    await logActivity(prisma, { taskId: id, userId, action: 'edited', fromValue: existing.title, toValue: title.trim() });
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
      _count: { select: { subtasks: true, comments: true } },
      subtasks: { select: { id: true, status: true, dueDate: true } }
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
      assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, username: true } } } },
      _count: { select: { subtasks: true, comments: true } },
      subtasks: { select: { id: true, status: true, dueDate: true } }
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
