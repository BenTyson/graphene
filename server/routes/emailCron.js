import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireCronSecret } from '../middleware/cronAuth.js';
import { sendLogged } from '../services/sparrowClient.js';
import {
  listEligibleUsers,
  buildWeeklyDigest,
  buildDueTomorrow,
  buildOverduePayloads,
} from '../services/emailDigest.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(requireCronSecret);

async function getSettings() {
  let s = await prisma.emailSettings.findUnique({ where: { id: 'default' } });
  if (!s) s = await prisma.emailSettings.create({ data: { id: 'default' } });
  return s;
}

function disabledResponse(reason) {
  return { success: true, sent: 0, skipped: 0, failed: 0, disabled: true, reason };
}

async function dispatch({ payload, type, templateId, userId }) {
  if (!templateId) {
    return { status: 'FAILED', error: 'No template_id configured for this email type' };
  }
  return sendLogged({
    type,
    recipient: payload.to,
    userId,
    idempotencyKey: payload.idempotencyKey,
    templateId,
    taskIds: payload.taskIds || [],
    payload: { kind: 'transactional', templateId, data: payload.data },
  });
}

router.post('/weekly-digest', async (req, res) => {
  try {
    const settings = await getSettings();
    if (!settings.weeklyDigestEnabled) return res.json(disabledResponse('weeklyDigestEnabled=false'));
    if (!settings.templateIdWeekly) {
      return res.status(400).json({ success: false, error: 'templateIdWeekly not set' });
    }

    const users = await listEligibleUsers();
    let sent = 0, skipped = 0, failed = 0;
    const errors = [];

    for (const user of users) {
      const payload = await buildWeeklyDigest(user);
      if (!payload) { skipped++; continue; }
      const r = await dispatch({
        payload, type: 'WEEKLY_DIGEST', templateId: settings.templateIdWeekly, userId: user.id,
      });
      if (r.status === 'SENT') sent++;
      else if (r.status === 'SKIPPED') skipped++;
      else { failed++; errors.push({ userId: user.id, error: r.error }); }
    }

    await prisma.emailSettings.update({
      where: { id: 'default' },
      data: { lastWeeklyRunAt: new Date() },
    });
    res.json({ success: true, sent, skipped, failed, errors: errors.slice(0, 20) });
  } catch (err) {
    console.error('[email/cron/weekly-digest]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/due-tomorrow', async (req, res) => {
  try {
    const settings = await getSettings();
    if (!settings.dueTomorrowEnabled) return res.json(disabledResponse('dueTomorrowEnabled=false'));
    if (!settings.templateIdDueTomorrow) {
      return res.status(400).json({ success: false, error: 'templateIdDueTomorrow not set' });
    }

    const users = await listEligibleUsers();
    let sent = 0, skipped = 0, failed = 0;
    const errors = [];

    for (const user of users) {
      const payload = await buildDueTomorrow(user);
      if (!payload) { skipped++; continue; }
      const r = await dispatch({
        payload, type: 'DUE_TOMORROW', templateId: settings.templateIdDueTomorrow, userId: user.id,
      });
      if (r.status === 'SENT') sent++;
      else if (r.status === 'SKIPPED') skipped++;
      else { failed++; errors.push({ userId: user.id, error: r.error }); }
    }

    await prisma.emailSettings.update({
      where: { id: 'default' },
      data: { lastDueTomorrowRunAt: new Date() },
    });
    res.json({ success: true, sent, skipped, failed, errors: errors.slice(0, 20) });
  } catch (err) {
    console.error('[email/cron/due-tomorrow]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/overdue-alerts', async (req, res) => {
  try {
    const settings = await getSettings();
    if (!settings.overdueAlertsEnabled) return res.json(disabledResponse('overdueAlertsEnabled=false'));
    if (!settings.templateIdOverdue) {
      return res.status(400).json({ success: false, error: 'templateIdOverdue not set' });
    }

    const users = await listEligibleUsers();
    let sent = 0, skipped = 0, failed = 0;
    const errors = [];

    for (const user of users) {
      const payloads = await buildOverduePayloads(user);
      for (const payload of payloads) {
        const type = payload.bucket === 3 ? 'OVERDUE_3'
          : payload.bucket === 6 ? 'OVERDUE_6'
          : payload.bucket === 9 ? 'OVERDUE_9' : null;
        if (!type) continue;
        const r = await dispatch({
          payload, type, templateId: settings.templateIdOverdue, userId: user.id,
        });
        if (r.status === 'SENT') sent++;
        else if (r.status === 'SKIPPED') skipped++;
        else { failed++; errors.push({ userId: user.id, bucket: payload.bucket, error: r.error }); }
      }
    }

    await prisma.emailSettings.update({
      where: { id: 'default' },
      data: { lastOverdueRunAt: new Date() },
    });
    res.json({ success: true, sent, skipped, failed, errors: errors.slice(0, 20) });
  } catch (err) {
    console.error('[email/cron/overdue-alerts]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
