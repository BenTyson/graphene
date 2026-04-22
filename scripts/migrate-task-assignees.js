/**
 * Idempotent backfill: copy tasks.assignee_id values into task_assignments
 * before `prisma db push` drops the column.
 *
 * Uses raw SQL so it works regardless of the current Prisma client shape.
 * Safe to run on every deploy — no-ops once the column is gone.
 *
 * Must run BEFORE `prisma db push` on production deploys.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Does tasks.assignee_id still exist? If not, backfill is irrelevant.
  const [{ exists: colExists }] = await prisma.$queryRawUnsafe(
    `SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'assignee_id') AS exists`
  );
  if (!colExists) {
    console.log('tasks.assignee_id already dropped; nothing to backfill.');
    return;
  }

  // Ensure task_assignments exists before we try to insert into it.
  // prisma db push will handle indexes/FKs on the next step; this just makes
  // the table available for the backfill INSERT.
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS task_assignments (
       task_id TEXT NOT NULL,
       user_id TEXT NOT NULL,
       assigned_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
       PRIMARY KEY (task_id, user_id)
     )`
  );

  const result = await prisma.$executeRawUnsafe(
    `INSERT INTO task_assignments (task_id, user_id, assigned_at)
     SELECT id, assignee_id, NOW() FROM tasks
     WHERE assignee_id IS NOT NULL
     ON CONFLICT (task_id, user_id) DO NOTHING`
  );
  console.log(`Backfilled ${result} task assignment row(s) from tasks.assignee_id.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
