import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.task.findMany({
    where: { assigneeId: { not: null } },
    select: { id: true, assigneeId: true }
  });

  console.log(`Found ${tasks.length} tasks with an existing assignee.`);

  let created = 0;
  for (const t of tasks) {
    try {
      await prisma.taskAssignment.create({
        data: { taskId: t.id, userId: t.assigneeId }
      });
      created++;
    } catch (err) {
      if (err.code === 'P2002') continue;
      console.error(`Failed for task ${t.id}:`, err.message);
    }
  }

  console.log(`Created ${created} TaskAssignment rows.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
