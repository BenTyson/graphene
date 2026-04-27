import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SPARROW_URL = process.env.SPARROW_URL;
const SPARROW_API_KEY = process.env.SPARROW_API_KEY;

function ensureConfigured() {
  if (!SPARROW_URL || !SPARROW_API_KEY) {
    throw new Error('Sparrow not configured: SPARROW_URL and SPARROW_API_KEY must be set');
  }
}

async function sparrowFetch(path, init = {}) {
  ensureConfigured();
  const url = `${SPARROW_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': SPARROW_API_KEY,
      ...(init.headers || {}),
    },
  });

  const text = await res.text().catch(() => '');
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }

  if (!res.ok) {
    const errMsg = (body && body.error) || res.statusText || `HTTP ${res.status}`;
    const error = new Error(`Sparrow ${path} failed: ${errMsg}`);
    error.status = res.status;
    error.body = body;
    throw error;
  }
  return body;
}

export async function subscribeUser({ email, name, list = 'users' }) {
  return sparrowFetch('/v1/subscribers', {
    method: 'POST',
    body: JSON.stringify({ email, name, list }),
  });
}

export async function sendTransactional({ to, templateId, data }) {
  return sparrowFetch('/v1/send/transactional', {
    method: 'POST',
    body: JSON.stringify({ to, template_id: templateId, data: data || {} }),
  });
}

export async function sendRaw({ to, from, subject, html, replyTo }) {
  return sparrowFetch('/v1/send/raw', {
    method: 'POST',
    body: JSON.stringify({
      to,
      from,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
}

/**
 * Idempotent send: looks up EmailLog for idempotencyKey and skips if found.
 * Logs SENT/FAILED/SKIPPED. Never throws — returns { status, error? }.
 */
export async function sendLogged({
  type,
  recipient,
  userId = null,
  idempotencyKey,
  templateId = null,
  taskIds = [],
  payload, // { kind: 'transactional', templateId, data } | { kind: 'raw', from, subject, html, replyTo }
}) {
  if (!idempotencyKey) {
    throw new Error('sendLogged requires idempotencyKey');
  }

  const existing = await prisma.emailLog.findUnique({ where: { idempotencyKey } });
  if (existing) {
    return { status: 'SKIPPED', existing: true, log: existing };
  }

  try {
    if (payload.kind === 'transactional') {
      await sendTransactional({ to: recipient, templateId: payload.templateId, data: payload.data });
    } else if (payload.kind === 'raw') {
      await sendRaw({
        to: recipient,
        from: payload.from,
        subject: payload.subject,
        html: payload.html,
        replyTo: payload.replyTo,
      });
    } else {
      throw new Error(`Unknown payload.kind: ${payload.kind}`);
    }

    const log = await prisma.emailLog.create({
      data: {
        userId,
        recipient,
        type,
        status: 'SENT',
        idempotencyKey,
        templateId,
        taskIds,
      },
    });
    return { status: 'SENT', log };
  } catch (err) {
    const errorMessage = err && err.message ? err.message.slice(0, 1000) : String(err);
    const log = await prisma.emailLog.create({
      data: {
        userId,
        recipient,
        type,
        status: 'FAILED',
        idempotencyKey,
        templateId,
        taskIds,
        errorMessage,
      },
    }).catch(() => null);
    return { status: 'FAILED', error: errorMessage, log };
  }
}

export function isConfigured() {
  return Boolean(SPARROW_URL && SPARROW_API_KEY);
}
