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

async function logDealActivity(prisma, { dealId, userId, action, content, fromValue, toValue }) {
  await prisma.dealActivity.create({
    data: { dealId, userId, action, content: content || null, fromValue: fromValue || null, toValue: toValue || null }
  });
}

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

  const [contactsByType, dealsByStage, overdueFollowUps] = await Promise.all([
    prisma.contact.groupBy({ by: ['contactType'], _count: true }),
    prisma.$queryRaw`
      SELECT d.stage, c.contact_type, COUNT(*)::int as count
      FROM deals d
      JOIN contacts c ON d.contact_id = c.id
      GROUP BY d.stage, c.contact_type
    `,
    prisma.contact.count({
      where: { nextFollowUpAt: { lt: new Date() } }
    })
  ]);

  const contacts = { CLIENT: 0, INVESTOR: 0, PARTNER: 0 };
  contactsByType.forEach(c => { contacts[c.contactType] = c._count; });

  const deals = {};
  dealsByStage.forEach(d => {
    if (!deals[d.contact_type]) deals[d.contact_type] = {};
    deals[d.contact_type][d.stage] = d.count;
  });

  res.json({ contacts, deals, overdueFollowUps });
}));

// ── Contacts CRUD ──────────────────────────────────────────────────────

router.get('/contacts', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { contactType, contactKind, ownerId, search, sortBy = 'createdAt', order = 'desc', limit, offset } = req.query;

  const where = {};
  if (contactType) where.contactType = contactType;
  if (contactKind) where.contactKind = contactKind;
  if (ownerId) where.ownerId = ownerId;

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
      { companyContact: { name: { contains: search, mode: 'insensitive' } } }
    ];
  }

  const orderBy = sortBy === 'name' ? { name: order }
    : sortBy === 'nextFollowUpAt' ? { nextFollowUpAt: { sort: order, nulls: 'last' } }
    : sortBy === 'lastContactedAt' ? { lastContactedAt: { sort: order, nulls: 'last' } }
    : { createdAt: order };

  const queryOptions = {
    where,
    include: {
      owner: { select: userSelect },
      companyContact: { select: { id: true, name: true } },
      _count: { select: { deals: true, attachments: true, people: true } }
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
      deals: {
        include: {
          owner: { select: userSelect }
        },
        orderBy: { createdAt: 'desc' }
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
      _count: { select: { deals: true, attachments: true, people: true } }
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
  if (!contactType || !['CLIENT', 'INVESTOR', 'PARTNER'].includes(contactType)) {
    return res.status(400).json({ error: 'Valid contactType is required (CLIENT, INVESTOR, PARTNER)' });
  }

  const contact = await prisma.contact.create({
    data: {
      name: name.trim(),
      contactKind: contactKind || 'PERSON',
      email: email || null,
      phone: phone || null,
      role: role || null,
      contactType,
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
      _count: { select: { deals: true, attachments: true, people: true } }
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
  const { name, contactKind, email, phone, role, contactType, source, tags, notes, linkedInUrl, website, companyId, ownerId, lastContactedAt, nextFollowUpAt } = req.body;

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Contact not found' });

  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (contactKind !== undefined) data.contactKind = contactKind;
  if (email !== undefined) data.email = email || null;
  if (phone !== undefined) data.phone = phone || null;
  if (role !== undefined) data.role = role || null;
  if (contactType !== undefined) data.contactType = contactType;
  if (companyId !== undefined) data.companyId = companyId || null;
  if (source !== undefined) data.source = source || null;
  if (tags !== undefined) data.tags = tags;
  if (notes !== undefined) data.notes = notes || null;
  if (linkedInUrl !== undefined) data.linkedInUrl = linkedInUrl || null;
  if (website !== undefined) data.website = website || null;
  if (ownerId !== undefined) data.ownerId = ownerId || null;
  if (lastContactedAt !== undefined) data.lastContactedAt = lastContactedAt ? new Date(lastContactedAt) : null;
  if (nextFollowUpAt !== undefined) data.nextFollowUpAt = nextFollowUpAt ? new Date(nextFollowUpAt) : null;

  // Log notable changes
  if (contactType !== undefined && contactType !== existing.contactType) {
    await logContactActivity(prisma, { contactId: id, userId, action: 'type_changed', fromValue: existing.contactType, toValue: contactType });
  }
  if (ownerId !== undefined && ownerId !== existing.ownerId) {
    await logContactActivity(prisma, { contactId: id, userId, action: 'owner_changed', fromValue: existing.ownerId, toValue: ownerId });
  }

  const contact = await prisma.contact.update({
    where: { id },
    data,
    include: {
      owner: { select: userSelect },
      companyContact: { select: { id: true, name: true } },
      _count: { select: { deals: true, attachments: true, people: true } }
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

// ── Deals CRUD ─────────────────────────────────────────────────────────

router.get('/deals', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const { contactType, stage, ownerId, contactId, search, sortBy = 'position', order = 'asc' } = req.query;

  const where = {};
  if (stage) where.stage = stage;
  if (ownerId) where.ownerId = ownerId;
  if (contactId) where.contactId = contactId;

  if (contactType) {
    where.contact = { contactType };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { contact: { name: { contains: search, mode: 'insensitive' } } },
      { contact: { company: { contains: search, mode: 'insensitive' } } }
    ];
  }

  const orderBy = sortBy === 'createdAt' ? { createdAt: order }
    : sortBy === 'title' ? { title: order }
    : [{ position: order }, { createdAt: 'desc' }];

  const deals = await prisma.deal.findMany({
    where,
    include: {
      contact: { select: { id: true, name: true, contactKind: true, contactType: true, email: true, companyId: true, companyContact: { select: { id: true, name: true } } } },
      owner: { select: userSelect },
      _count: { select: { activities: true } }
    },
    orderBy
  });

  res.json(deals);
}));

router.get('/deals/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;

  const deal = await prisma.deal.findUnique({
    where: { id: req.params.id },
    include: {
      contact: {
        select: { id: true, name: true, contactKind: true, contactType: true, email: true, phone: true, companyId: true, companyContact: { select: { id: true, name: true } } }
      },
      owner: { select: userSelect },
      activities: {
        include: { user: { select: userSelect } },
        orderBy: { createdAt: 'desc' },
        take: 50
      },
      _count: { select: { activities: true } }
    }
  });

  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  res.json(deal);
}));

router.post('/deals', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { title, contactId, stage, description, tags, ownerId } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!contactId) {
    return res.status(400).json({ error: 'Contact is required' });
  }

  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  // Default to first stage for the contact's type
  const defaultStages = { CLIENT: 'LEAD', INVESTOR: 'IDENTIFIED', PARTNER: 'IDENTIFIED' };
  const dealStage = stage || defaultStages[contact.contactType] || 'LEAD';

  // Get max position for the stage column
  const maxPos = await prisma.deal.aggregate({
    where: { stage: dealStage, contact: { contactType: contact.contactType } },
    _max: { position: true }
  });

  const deal = await prisma.deal.create({
    data: {
      title: title.trim(),
      contactId,
      stage: dealStage,
      position: (maxPos._max.position ?? -1) + 1,
      description: description || null,
      tags: tags || [],
      ownerId: ownerId || userId
    },
    include: {
      contact: { select: { id: true, name: true, contactKind: true, contactType: true, email: true, companyId: true, companyContact: { select: { id: true, name: true } } } },
      owner: { select: userSelect },
      _count: { select: { activities: true } }
    }
  });

  await logDealActivity(prisma, { dealId: deal.id, userId, action: 'created' });

  res.status(201).json(deal);
}));

router.put('/deals/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;
  const { title, stage, description, tags, ownerId, lostReason } = req.body;

  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Deal not found' });

  const data = {};
  if (title !== undefined) data.title = title.trim();
  if (description !== undefined) data.description = description || null;
  if (tags !== undefined) data.tags = tags;
  if (lostReason !== undefined) data.lostReason = lostReason || null;
  if (ownerId !== undefined) data.ownerId = ownerId || null;

  if (stage !== undefined && stage !== existing.stage) {
    data.stage = stage;
    // Set closedAt for terminal stages
    const terminalStages = ['WON', 'LOST', 'COMMITTED', 'PASSED', 'INACTIVE'];
    if (terminalStages.includes(stage) && !existing.closedAt) {
      data.closedAt = new Date();
    } else if (!terminalStages.includes(stage) && existing.closedAt) {
      data.closedAt = null;
    }
    await logDealActivity(prisma, { dealId: id, userId, action: 'stage_changed', fromValue: existing.stage, toValue: stage });
  }

  if (ownerId !== undefined && ownerId !== existing.ownerId) {
    await logDealActivity(prisma, { dealId: id, userId, action: 'owner_changed', fromValue: existing.ownerId, toValue: ownerId });
  }

  const deal = await prisma.deal.update({
    where: { id },
    data,
    include: {
      contact: { select: { id: true, name: true, contactKind: true, contactType: true, email: true, companyId: true, companyContact: { select: { id: true, name: true } } } },
      owner: { select: userSelect },
      _count: { select: { activities: true } }
    }
  });

  res.json(deal);
}));

// PATCH /api/pipeline/deals/reorder - drag-and-drop
router.patch('/deals/reorder', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { dealId, newStage, positions } = req.body;

  if (!dealId || !positions || !Array.isArray(positions)) {
    return res.status(400).json({ error: 'dealId and positions array are required' });
  }

  const existing = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!existing) return res.status(404).json({ error: 'Deal not found' });

  await prisma.$transaction(async (tx) => {
    if (newStage && newStage !== existing.stage) {
      const data = { stage: newStage };
      const terminalStages = ['WON', 'LOST', 'COMMITTED', 'PASSED', 'INACTIVE'];
      if (terminalStages.includes(newStage) && !existing.closedAt) {
        data.closedAt = new Date();
      } else if (!terminalStages.includes(newStage) && existing.closedAt) {
        data.closedAt = null;
      }
      await tx.deal.update({ where: { id: dealId }, data });
      await logDealActivity(prisma, {
        dealId, userId, action: 'stage_changed',
        fromValue: existing.stage, toValue: newStage
      });
    }

    for (const item of positions) {
      await tx.deal.update({
        where: { id: item.id },
        data: { position: item.position }
      });
    }
  });

  res.json({ success: true });
}));

router.delete('/deals/:id', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;

  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  if (deal.ownerId !== userId && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only the deal owner or admin can delete this deal' });
  }

  await prisma.deal.delete({ where: { id } });
  res.json({ success: true });
}));

// ── Deal Activities ────────────────────────────────────────────────────

router.post('/deals/:id/activities', asyncHandler(async (req, res) => {
  const { prisma } = req.app.locals;
  const userId = req.user.userId;
  const { id } = req.params;
  const { action, content } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Action type is required' });
  }

  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  const activity = await prisma.dealActivity.create({
    data: {
      dealId: id,
      userId,
      action,
      content: content ? content.trim() : null
    },
    include: { user: { select: userSelect } }
  });

  res.status(201).json(activity);
}));

export default router;
