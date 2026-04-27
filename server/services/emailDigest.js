import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * YYYY-MM-DD in a given IANA timezone. Used for date-bucket idempotency keys
 * so "due tomorrow" runs are unique per local-day, not per UTC-day.
 */
export function ymdInTz(date, timezone) {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return fmt.format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function isoWeekKey(date, timezone) {
  // ISO week (Mon-start). Cheap approximation: bucket by local YMD floored to Sunday.
  const ymd = ymdInTz(date, timezone);
  const d = new Date(`${ymd}T00:00:00Z`);
  const day = d.getUTCDay(); // 0=Sun
  const sunday = new Date(d);
  sunday.setUTCDate(d.getUTCDate() - day);
  return sunday.toISOString().slice(0, 10);
}

/**
 * Days a task is overdue, computed in user's timezone. Returns 0 if not yet
 * overdue (due today or future). Negative dates -> positive day count.
 */
export function daysOverdue(dueDate, now, timezone) {
  if (!dueDate) return 0;
  const dueYmd = ymdInTz(dueDate, timezone);
  const nowYmd = ymdInTz(now, timezone);
  const dueMs = new Date(`${dueYmd}T00:00:00Z`).getTime();
  const nowMs = new Date(`${nowYmd}T00:00:00Z`).getTime();
  const diff = Math.round((nowMs - dueMs) / 86400000);
  return diff > 0 ? diff : 0;
}

/**
 * Targets active users with email + prefs. Lazy-creates default prefs row.
 */
export async function listEligibleUsers() {
  const users = await prisma.user.findMany({
    where: { isActive: true, email: { not: '' } },
    select: {
      id: true, email: true, firstName: true, lastName: true, role: true,
      emailPreferences: true,
    },
  });
  return users.map((u) => ({
    ...u,
    emailPreferences: u.emailPreferences || {
      userId: u.id,
      weeklyDigest: true,
      dueTomorrow: true,
      overdue3Day: true,
      overdue6Day: true,
      overdue9Day: true,
      onlyMyTasks: true,
      includeUnassigned: false,
      timezone: 'America/Los_Angeles',
      unsubscribedAt: null,
    },
  }));
}

/**
 * Tasks visible to a user under their prefs. Excludes ARCHIVED.
 *  - onlyMyTasks=true  -> assigned to user OR (includeUnassigned && no assignees)
 *  - onlyMyTasks=false -> all tasks (manager view) minus archived
 */
async function tasksVisibleToUser(user, extraWhere = {}) {
  const prefs = user.emailPreferences;
  const baseWhere = { status: { not: 'ARCHIVED' }, ...extraWhere };

  if (!prefs.onlyMyTasks) {
    return prisma.task.findMany({
      where: baseWhere,
      include: { assignees: { include: { user: true } }, goal: true },
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
    });
  }

  const orClauses = [{ assignees: { some: { userId: user.id } } }];
  if (prefs.includeUnassigned) {
    orClauses.push({ assignees: { none: {} } });
  }
  return prisma.task.findMany({
    where: { ...baseWhere, OR: orClauses },
    include: { assignees: { include: { user: true } }, goal: true },
    orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
  });
}

function shapeTaskForTemplate(t) {
  return {
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    due_date: t.dueDate ? t.dueDate.toISOString() : null,
    goal: t.goal ? { id: t.goal.id, title: t.goal.title } : null,
  };
}

/**
 * Weekly digest payload for one user. Returns null if user opted out or empty.
 */
export async function buildWeeklyDigest(user, now = new Date()) {
  const prefs = user.emailPreferences;
  if (prefs.unsubscribedAt || !prefs.weeklyDigest) return null;

  const tz = prefs.timezone;
  const todayYmd = ymdInTz(now, tz);
  const weekStart = new Date(`${todayYmd}T00:00:00Z`);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 7);

  const tasks = await tasksVisibleToUser(user);
  const overdue = [];
  const dueThisWeek = [];
  for (const t of tasks) {
    if (t.status === 'DONE') continue;
    if (!t.dueDate) continue;
    const od = daysOverdue(t.dueDate, now, tz);
    if (od > 0) {
      overdue.push({ ...shapeTaskForTemplate(t), days_overdue: od });
    } else if (t.dueDate < weekEnd) {
      dueThisWeek.push(shapeTaskForTemplate(t));
    }
  }

  if (!overdue.length && !dueThisWeek.length) return null;

  return {
    to: user.email,
    data: {
      user_name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
      week_label: `Week of ${todayYmd}`,
      overdue,
      due_this_week: dueThisWeek,
      total_count: overdue.length + dueThisWeek.length,
    },
    idempotencyKey: `weekly-digest-${user.id}-${isoWeekKey(now, tz)}`,
    taskIds: [...overdue, ...dueThisWeek].map((t) => t.id),
  };
}

/**
 * Day-before-due for one user. Tomorrow (in user's TZ).
 */
export async function buildDueTomorrow(user, now = new Date()) {
  const prefs = user.emailPreferences;
  if (prefs.unsubscribedAt || !prefs.dueTomorrow) return null;

  const tz = prefs.timezone;
  const todayYmd = ymdInTz(now, tz);
  const tomorrow = new Date(`${todayYmd}T00:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setUTCDate(tomorrow.getUTCDate() + 1);

  const tasks = await tasksVisibleToUser(user, {
    dueDate: { gte: tomorrow, lt: dayAfter },
    status: { notIn: ['DONE', 'ARCHIVED'] },
  });
  if (!tasks.length) return null;

  const tomorrowYmd = ymdInTz(tomorrow, tz);
  return {
    to: user.email,
    data: {
      user_name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
      tasks: tasks.map(shapeTaskForTemplate),
      count: tasks.length,
      due_date_label: tomorrowYmd,
    },
    idempotencyKey: `due-tomorrow-${user.id}-${tomorrowYmd}`,
    taskIds: tasks.map((t) => t.id),
  };
}

/**
 * Overdue alerts: returns one payload per (user, dayBucket) where any task
 * crossed the 3/6/9 threshold. Idempotency keyed on (taskId, bucket) so a task
 * triggers at most one email per bucket.
 */
export async function buildOverduePayloads(user, now = new Date()) {
  const prefs = user.emailPreferences;
  if (prefs.unsubscribedAt) return [];

  const buckets = [];
  if (prefs.overdue3Day) buckets.push(3);
  if (prefs.overdue6Day) buckets.push(6);
  if (prefs.overdue9Day) buckets.push(9);
  if (!buckets.length) return [];

  const tz = prefs.timezone;
  const tasks = await tasksVisibleToUser(user, {
    dueDate: { lt: now },
    status: { notIn: ['DONE', 'ARCHIVED'] },
  });
  if (!tasks.length) return [];

  // Group tasks by exact overdue-day bucket they currently match.
  const byBucket = new Map();
  for (const t of tasks) {
    const days = daysOverdue(t.dueDate, now, tz);
    if (!buckets.includes(days)) continue;
    if (!byBucket.has(days)) byBucket.set(days, []);
    byBucket.get(days).push(t);
  }

  const payloads = [];
  for (const [days, list] of byBucket) {
    const todayYmd = ymdInTz(now, tz);
    payloads.push({
      to: user.email,
      data: {
        user_name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
        days,
        tasks: list.map(shapeTaskForTemplate),
        count: list.length,
      },
      // Single key per (user, bucket, day) — all tasks in that bucket share the email.
      idempotencyKey: `overdue-${days}-${user.id}-${todayYmd}`,
      taskIds: list.map((t) => t.id),
      bucket: days,
    });
  }
  return payloads;
}
