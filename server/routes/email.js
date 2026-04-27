import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireSuperAdmin } from './auth.js';
import { sendLogged, subscribeUser, isConfigured } from '../services/sparrowClient.js';

const router = express.Router();
const prisma = new PrismaClient();

const DEFAULT_PREFS = {
  weeklyDigest: true,
  dueTomorrow: true,
  overdue3Day: true,
  overdue6Day: true,
  overdue9Day: true,
  onlyMyTasks: true,
  includeUnassigned: false,
  timezone: 'America/Los_Angeles',
};

const PREF_FIELDS = [
  'weeklyDigest', 'dueTomorrow',
  'overdue3Day', 'overdue6Day', 'overdue9Day',
  'onlyMyTasks', 'includeUnassigned', 'timezone',
];

function pickPrefs(body) {
  const out = {};
  for (const f of PREF_FIELDS) {
    if (body[f] !== undefined) out[f] = body[f];
  }
  return out;
}

async function loadOrCreatePrefs(userId) {
  const existing = await prisma.userEmailPreferences.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.userEmailPreferences.create({ data: { userId, ...DEFAULT_PREFS } });
}

async function loadOrCreateSettings() {
  const existing = await prisma.emailSettings.findUnique({ where: { id: 'default' } });
  if (existing) return existing;
  return prisma.emailSettings.create({ data: { id: 'default' } });
}

// === Settings (superadmin only) =============================================

router.get('/settings', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const settings = await loadOrCreateSettings();
    res.json({ success: true, data: { settings, sparrowConfigured: isConfigured() } });
  } catch (err) {
    console.error('[email/settings GET]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/settings', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const allowed = [
      'weeklyDigestEnabled', 'dueTomorrowEnabled', 'overdueAlertsEnabled',
      'fromAddress', 'replyTo', 'testRecipient',
      'templateIdWeekly', 'templateIdDueTomorrow', 'templateIdOverdue',
    ];
    const data = {};
    for (const f of allowed) {
      if (req.body[f] !== undefined) data[f] = req.body[f];
    }
    await loadOrCreateSettings();
    const settings = await prisma.emailSettings.update({ where: { id: 'default' }, data });
    res.json({ success: true, data: { settings } });
  } catch (err) {
    console.error('[email/settings PUT]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// === Email log (superadmin) =================================================

router.get('/logs', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const where = {};
    if (req.query.type) where.type = req.query.type;
    if (req.query.status) where.status = req.query.status;
    if (req.query.userId) where.userId = req.query.userId;

    const logs = await prisma.emailLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, username: true, email: true, firstName: true, lastName: true } } },
    });
    res.json({ success: true, data: { logs } });
  } catch (err) {
    console.error('[email/logs]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// === Per-user preferences ===================================================
// Self-service: any authenticated user can read/edit their own prefs.
// Superadmin can read/edit anyone's via :userId.

router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const prefs = await loadOrCreatePrefs(req.user.id);
    res.json({ success: true, data: { preferences: prefs } });
  } catch (err) {
    console.error('[email/preferences GET]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const data = pickPrefs(req.body);
    if (req.body.unsubscribedAt !== undefined) {
      data.unsubscribedAt = req.body.unsubscribedAt ? new Date(req.body.unsubscribedAt) : null;
    }
    await loadOrCreatePrefs(req.user.id);
    const prefs = await prisma.userEmailPreferences.update({
      where: { userId: req.user.id },
      data,
    });
    res.json({ success: true, data: { preferences: prefs } });
  } catch (err) {
    console.error('[email/preferences PUT]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/preferences/:userId', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const prefs = await loadOrCreatePrefs(req.params.userId);
    res.json({ success: true, data: { preferences: prefs } });
  } catch (err) {
    console.error('[email/preferences/:userId GET]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/preferences/:userId', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const data = pickPrefs(req.body);
    if (req.body.unsubscribedAt !== undefined) {
      data.unsubscribedAt = req.body.unsubscribedAt ? new Date(req.body.unsubscribedAt) : null;
    }
    await loadOrCreatePrefs(req.params.userId);
    const prefs = await prisma.userEmailPreferences.update({
      where: { userId: req.params.userId },
      data,
    });
    res.json({ success: true, data: { preferences: prefs } });
  } catch (err) {
    console.error('[email/preferences/:userId PUT]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// === Test send (superadmin) =================================================
// Sends a transactional or raw test email to verify Sparrow wiring without
// running the full cron pipeline. idempotencyKey includes a timestamp so it
// always sends.

router.post('/test', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { to, kind = 'raw', templateId, data, subject, html, from } = req.body;
    const recipient = to || (await loadOrCreateSettings()).testRecipient || req.user.email;
    if (!recipient) return res.status(400).json({ success: false, error: 'No recipient available' });

    const settings = await loadOrCreateSettings();
    const fromAddr = from || settings.fromAddress;

    const idempotencyKey = `test-${req.user.id}-${Date.now()}`;
    let payload;
    if (kind === 'transactional') {
      if (!templateId) return res.status(400).json({ success: false, error: 'templateId required' });
      payload = { kind: 'transactional', templateId, data: data || {} };
    } else {
      payload = {
        kind: 'raw',
        from: fromAddr,
        subject: subject || 'Graphene email test',
        html: html || '<p>This is a test email from the Graphene admin dashboard.</p>',
      };
    }

    const result = await sendLogged({
      type: 'TEST',
      recipient,
      userId: req.user.id,
      idempotencyKey,
      templateId: templateId || null,
      payload,
    });
    res.json({ success: result.status === 'SENT', result });
  } catch (err) {
    console.error('[email/test]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// === Manual subscribe (superadmin) ==========================================
// Re-subscribe a user to graphene-users in Listmonk. Useful for backfill or fix.

router.post('/subscribe/:userId', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;
    await subscribeUser({ email: user.email, name, list: 'users' });
    res.json({ success: true });
  } catch (err) {
    console.error('[email/subscribe]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
