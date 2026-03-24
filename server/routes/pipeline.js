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

const attachmentUpload = createFileUploadMiddleware('contact-attachments', {
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

const userSelect = { id: true, firstName: true, lastName: true, username: true };

async function logContactActivity(prisma, { contactId, userId, action, content, fromValue, toValue }) {
  await prisma.contactActivity.create({
    data: { contactId, userId, action, content: content || null, fromValue: fromValue || null, toValue: toValue || null }
  });
}

const TERMINAL_STAGES = ['WON', 'LOST', 'COMMITTED', 'PASSED', 'INACTIVE'];
const DEFAULT_STAGES = { CLIENT: 'LEAD', INVESTOR: 'IDENTIFIED', PARTNER: 'IDENTIFIED' };

// All routes require auth + internal access
router.use(authenticateToken, requireInternalAccess);

// ── Owners (lightweight user list for dropdowns) ───────────────────────

router.get('/owners', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const users = await prisma.user.findMany({
    where: { isActive: true, role: { in: INTERNAL_ROLES } },
    select: userSelect,
    orderBy: { firstName: 'asc' }
  });
  res.json(users);
}));

// ── Stats ──────────────────────────────────────────────────────────────

router.get('/stats', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const [contactsByType, pipelineByStage, overdueFollowUps] = await Promise.all([
    prisma.contact.groupBy({ by: ['contactType'], _count: true }),
    prisma.$queryRaw`
      SELECT stage, contact_type, COUNT(*)::int as count
      FROM contacts
      WHERE stage IS NOT NULL AND contact_type IS NOT NULL
      GROUP BY stage, contact_type
    `,
    prisma.contact.count({
      where: { nextFollowUpAt: { lt: new Date() } }
    })
  ]);

  const contacts = { CLIENT: 0, INVESTOR: 0, PARTNER: 0 };
  contactsByType.forEach(c => { if (c.contactType) contacts[c.contactType] = c._count; });

  const pipeline = {};
  pipelineByStage.forEach(d => {
    if (!pipeline[d.contact_type]) pipeline[d.contact_type] = {};
    pipeline[d.contact_type][d.stage] = d.count;
  });

  res.json({ contacts, pipeline, overdueFollowUps });
}));

// ── Contacts CRUD ──────────────────────────────────────────────────────

router.get('/contacts', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { contactType, contactKind, ownerId, search, onPipeline, sortBy = 'createdAt', order = 'desc', limit, offset } = req.query;

  const where = {};
  if (contactType) where.contactType = contactType;
  if (contactKind) where.contactKind = contactKind;
  if (ownerId) where.ownerId = ownerId;
  if (onPipeline === 'true') where.stage = { not: null };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
      { companyContact: { name: { contains: search, mode: 'insensitive' } } }
    ];
  }

  const orderBy = sortBy === 'name' ? { name: order }
    : sortBy === 'position' ? [{ position: order }, { createdAt: 'desc' }]
    : sortBy === 'nextFollowUpAt' ? { nextFollowUpAt: { sort: order, nulls: 'last' } }
    : sortBy === 'lastContactedAt' ? { lastContactedAt: { sort: order, nulls: 'last' } }
    : { createdAt: order };

  const queryOptions = {
    where,
    include: {
      owner: { select: userSelect },
      companyContact: { select: { id: true, name: true } },
      _count: { select: { attachments: true, people: true } }
    },
    orderBy
  };

  if (limit) queryOptions.take = parseInt(limit);
  if (offset) queryOptions.skip = parseInt(offset);

  const contacts = await prisma.contact.findMany(queryOptions);

  const result = contacts.map(c => ({
    ...c,
    lastContactedAt: c.lastContactedAt ? c.lastContactedAt.toISOString() : null,
    nextFollowUpAt: c.nextFollowUpAt ? c.nextFollowUpAt.toISOString().split('T')[0] : null
  }));

  res.json(result);
}));

router.get('/contacts/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const contact = await prisma.contact.findUnique({
    where: { id: req.params.id },
    include: {
      owner: { select: userSelect },
      companyContact: { select: { id: true, name: true, contactType: true } },
      people: {
        select: { id: true, name: true, role: true, email: true, contactType: true },
        orderBy: { name: 'asc' }
      },
      activities: {
        include: { user: { select: userSelect } },
        orderBy: { createdAt: 'desc' },
        take: 50
      },
      attachments: {
        include: { uploadedBy: { select: userSelect } },
        orderBy: { createdAt: 'desc' }
      },
      _count: { select: { attachments: true, people: true } }
    }
  });

  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  res.json({
    ...contact,
    lastContactedAt: contact.lastContactedAt ? contact.lastContactedAt.toISOString() : null,
    nextFollowUpAt: contact.nextFollowUpAt ? contact.nextFollowUpAt.toISOString().split('T')[0] : null
  });
}));

router.post('/contacts', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { name, contactKind, email, phone, role, contactType, source, tags, notes, linkedInUrl, website, companyId, ownerId, nextFollowUpAt } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (contactType && !['CLIENT', 'INVESTOR', 'PARTNER', 'OTHER'].includes(contactType)) {
    return res.status(400).json({ error: 'contactType must be CLIENT, INVESTOR, PARTNER, or OTHER' });
  }

  const contact = await prisma.contact.create({
    data: {
      name: name.trim(),
      contactKind: contactKind || 'PERSON',
      email: email || null,
      phone: phone || null,
      role: role || null,
      contactType: contactType || null,
      source: source || null,
      tags: tags || [],
      notes: notes || null,
      linkedInUrl: linkedInUrl || null,
      website: website || null,
      companyId: companyId || null,
      ownerId: ownerId || userId,
      nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : null
    },
    include: {
      owner: { select: userSelect },
      companyContact: { select: { id: true, name: true } },
      _count: { select: { attachments: true, people: true } }
    }
  });

  await logContactActivity(prisma, { contactId: contact.id, userId, action: 'created' });

  res.status(201).json({
    ...contact,
    lastContactedAt: null,
    nextFollowUpAt: contact.nextFollowUpAt ? contact.nextFollowUpAt.toISOString().split('T')[0] : null
  });
}));

router.put('/contacts/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;
  const { name, contactKind, email, phone, role, contactType, source, tags, notes, linkedInUrl, website, companyId, ownerId, lastContactedAt, nextFollowUpAt, stage, lostReason, pipelineTitle } = req.body;

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Contact not found' });

  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (contactKind !== undefined) data.contactKind = contactKind;
  if (email !== undefined) data.email = email || null;
  if (phone !== undefined) data.phone = phone || null;
  if (role !== undefined) data.role = role || null;
  if (contactType !== undefined) data.contactType = contactType || null;
  if (companyId !== undefined) data.companyId = companyId || null;
  if (source !== undefined) data.source = source || null;
  if (tags !== undefined) data.tags = tags;
  if (notes !== undefined) data.notes = notes || null;
  if (linkedInUrl !== undefined) data.linkedInUrl = linkedInUrl || null;
  if (website !== undefined) data.website = website || null;
  if (ownerId !== undefined) data.ownerId = ownerId || null;
  if (lastContactedAt !== undefined) data.lastContactedAt = lastContactedAt ? new Date(lastContactedAt) : null;
  if (nextFollowUpAt !== undefined) data.nextFollowUpAt = nextFollowUpAt ? new Date(nextFollowUpAt) : null;
  if (lostReason !== undefined) data.lostReason = lostReason || null;
  if (pipelineTitle !== undefined) data.pipelineTitle = pipelineTitle || null;

  // Log notable changes
  if (contactType !== undefined && contactType !== existing.contactType) {
    await logContactActivity(prisma, { contactId: id, userId, action: 'type_changed', fromValue: existing.contactType, toValue: contactType });
  }
  if (ownerId !== undefined && ownerId !== existing.ownerId) {
    await logContactActivity(prisma, { contactId: id, userId, action: 'owner_changed', fromValue: existing.ownerId, toValue: ownerId });
  }
  if (stage !== undefined && stage !== existing.stage) {
    data.stage = stage;
    if (TERMINAL_STAGES.includes(stage) && !existing.closedAt) {
      data.closedAt = new Date();
    } else if (!TERMINAL_STAGES.includes(stage) && existing.closedAt) {
      data.closedAt = null;
    }
    await logContactActivity(prisma, { contactId: id, userId, action: 'stage_changed', fromValue: existing.stage, toValue: stage });
  }

  const contact = await prisma.contact.update({
    where: { id },
    data,
    include: {
      owner: { select: userSelect },
      companyContact: { select: { id: true, name: true } },
      _count: { select: { attachments: true, people: true } }
    }
  });

  res.json({
    ...contact,
    lastContactedAt: contact.lastContactedAt ? contact.lastContactedAt.toISOString() : null,
    nextFollowUpAt: contact.nextFollowUpAt ? contact.nextFollowUpAt.toISOString().split('T')[0] : null
  });
}));

router.delete('/contacts/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;

  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  // Only owner or SUPER_ADMIN can delete
  if (contact.ownerId !== userId && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only the contact owner or admin can delete this contact' });
  }

  // Clean up attachment files before cascade delete
  const attachments = await prisma.contactAttachment.findMany({
    where: { contactId: id },
    select: { filePath: true }
  });
  for (const att of attachments) {
    await deleteFileFromStorage(att.filePath);
  }

  await prisma.contact.delete({ where: { id } });
  res.json({ success: true });
}));

// ── Contact Activities (notes, calls, emails, meetings) ────────────────

router.post('/contacts/:id/activities', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;
  const { action, content } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Action type is required' });
  }

  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  const activity = await prisma.contactActivity.create({
    data: {
      contactId: id,
      userId,
      action,
      content: content ? content.trim() : null
    },
    include: { user: { select: userSelect } }
  });

  // Update lastContactedAt for interaction-type activities
  const interactionActions = ['note_added', 'call_logged', 'email_sent', 'meeting'];
  if (interactionActions.includes(action)) {
    await prisma.contact.update({
      where: { id },
      data: { lastContactedAt: new Date() }
    });
  }

  res.status(201).json(activity);
}));

// ── Contact Attachments ────────────────────────────────────────────────

router.post('/contacts/:id/attachments', attachmentUpload.array('attachments', 5), asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;

  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files provided' });
  }

  const attachments = [];
  for (const file of req.files) {
    const result = await uploadFile(file, 'contact-attachments');
    if (result.success) {
      const attachment = await prisma.contactAttachment.create({
        data: {
          contactId: id,
          uploadedById: userId,
          fileName: file.originalname,
          filePath: result.path,
          fileSize: file.size,
          mimeType: file.mimetype
        },
        include: { uploadedBy: { select: userSelect } }
      });
      attachments.push(attachment);

      await logContactActivity(prisma, {
        contactId: id, userId, action: 'attachment_added', toValue: file.originalname
      });
    }
  }

  res.status(201).json(attachments);
}));

router.delete('/contacts/:id/attachments/:attachmentId', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id, attachmentId } = req.params;

  const attachment = await prisma.contactAttachment.findUnique({
    where: { id: attachmentId },
    include: { contact: { select: { ownerId: true } } }
  });

  if (!attachment) return res.status(404).json({ error: 'Attachment not found' });

  const canDelete = attachment.uploadedById === userId
    || attachment.contact.ownerId === userId
    || req.user.role === 'SUPER_ADMIN';

  if (!canDelete) {
    return res.status(403).json({ error: 'Only the uploader, contact owner, or admin can delete this attachment' });
  }

  await deleteFileFromStorage(attachment.filePath);
  await prisma.contactAttachment.delete({ where: { id: attachmentId } });

  await logContactActivity(prisma, {
    contactId: id, userId, action: 'attachment_removed', fromValue: attachment.fileName
  });

  res.json({ success: true });
}));

// ── Pipeline Operations ───────────────────────────────────────────────

// POST /contacts/:id/add-to-pipeline - Add a contact to a pipeline board
router.post('/contacts/:id/add-to-pipeline', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;
  const { contactType, pipelineTitle } = req.body;

  if (!contactType || !['CLIENT', 'INVESTOR', 'PARTNER'].includes(contactType)) {
    return res.status(400).json({ error: 'Valid contactType is required (CLIENT, INVESTOR, PARTNER)' });
  }

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Contact not found' });

  if (existing.stage) {
    return res.status(400).json({ error: 'Contact is already on a pipeline board' });
  }

  const stage = DEFAULT_STAGES[contactType];

  // Get max position for the stage column
  const maxPos = await prisma.contact.aggregate({
    where: { stage, contactType },
    _max: { position: true }
  });

  const contact = await prisma.contact.update({
    where: { id },
    data: {
      contactType,
      pipelineTitle: pipelineTitle || null,
      stage,
      position: (maxPos._max.position ?? -1) + 1,
      closedAt: null,
      lostReason: null
    },
    include: {
      owner: { select: userSelect },
      companyContact: { select: { id: true, name: true } },
      _count: { select: { attachments: true, people: true } }
    }
  });

  await logContactActivity(prisma, {
    contactId: id, userId, action: 'added_to_pipeline', toValue: contactType
  });

  res.json({
    ...contact,
    lastContactedAt: contact.lastContactedAt ? contact.lastContactedAt.toISOString() : null,
    nextFollowUpAt: contact.nextFollowUpAt ? contact.nextFollowUpAt.toISOString().split('T')[0] : null
  });
}));

// POST /contacts/:id/remove-from-pipeline - Remove a contact from pipeline
router.post('/contacts/:id/remove-from-pipeline', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Contact not found' });

  if (!existing.stage) {
    return res.status(400).json({ error: 'Contact is not on any pipeline board' });
  }

  const contact = await prisma.contact.update({
    where: { id },
    data: { stage: null, position: 0, closedAt: null, lostReason: null, pipelineTitle: null },
    include: {
      owner: { select: userSelect },
      companyContact: { select: { id: true, name: true } },
      _count: { select: { attachments: true, people: true } }
    }
  });

  await logContactActivity(prisma, {
    contactId: id, userId, action: 'removed_from_pipeline', fromValue: existing.stage
  });

  res.json({
    ...contact,
    lastContactedAt: contact.lastContactedAt ? contact.lastContactedAt.toISOString() : null,
    nextFollowUpAt: contact.nextFollowUpAt ? contact.nextFollowUpAt.toISOString().split('T')[0] : null
  });
}));

// PATCH /contacts/reorder - drag-and-drop
router.patch('/contacts/reorder', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { contactId, newStage, positions } = req.body;

  if (!contactId || !positions || !Array.isArray(positions)) {
    return res.status(400).json({ error: 'contactId and positions array are required' });
  }

  const existing = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!existing) return res.status(404).json({ error: 'Contact not found' });

  await prisma.$transaction(async (tx) => {
    if (newStage && newStage !== existing.stage) {
      const data = { stage: newStage };
      if (TERMINAL_STAGES.includes(newStage) && !existing.closedAt) {
        data.closedAt = new Date();
      } else if (!TERMINAL_STAGES.includes(newStage) && existing.closedAt) {
        data.closedAt = null;
      }
      await tx.contact.update({ where: { id: contactId }, data });
      await logContactActivity(prisma, {
        contactId, userId, action: 'stage_changed',
        fromValue: existing.stage, toValue: newStage
      });
    }

    for (const item of positions) {
      await tx.contact.update({
        where: { id: item.id },
        data: { position: item.position }
      });
    }
  });

  res.json({ success: true });
}));

export default router;
