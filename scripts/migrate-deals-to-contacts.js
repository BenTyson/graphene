/**
 * Migration: Copy Deal stage/position/closedAt/lostReason to Contact
 *
 * For contacts with multiple deals, picks the most recent non-terminal deal.
 * Migrates DealActivity records to ContactActivity.
 *
 * Run: node scripts/migrate-deals-to-contacts.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TERMINAL_STAGES = ['WON', 'LOST', 'COMMITTED', 'PASSED', 'INACTIVE'];

async function migrate() {
  console.log('Starting deal-to-contact migration...\n');

  const deals = await prisma.deal.findMany({
    include: { contact: true, activities: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Found ${deals.length} deals total.\n`);

  // Group deals by contactId
  const dealsByContact = {};
  for (const deal of deals) {
    if (!dealsByContact[deal.contactId]) {
      dealsByContact[deal.contactId] = [];
    }
    dealsByContact[deal.contactId].push(deal);
  }

  const multiDealContacts = [];
  let migratedCount = 0;
  let activityCount = 0;

  for (const [contactId, contactDeals] of Object.entries(dealsByContact)) {
    if (contactDeals.length > 1) {
      multiDealContacts.push({
        contactId,
        contactName: contactDeals[0].contact?.name,
        dealCount: contactDeals.length,
        deals: contactDeals.map(d => ({ id: d.id, title: d.title, stage: d.stage })),
      });
    }

    // Pick best deal: prefer most recent non-terminal, fallback to most recent overall
    // Deals are already sorted by createdAt desc
    const bestDeal = contactDeals.find(d => !TERMINAL_STAGES.includes(d.stage)) || contactDeals[0];

    // Copy pipeline fields to contact
    await prisma.contact.update({
      where: { id: contactId },
      data: {
        stage: bestDeal.stage,
        position: bestDeal.position,
        closedAt: bestDeal.closedAt,
        lostReason: bestDeal.lostReason,
      },
    });
    migratedCount++;

    // Migrate all deal activities (from ALL deals for this contact) to contact activities
    for (const deal of contactDeals) {
      for (const activity of deal.activities) {
        await prisma.contactActivity.create({
          data: {
            contactId,
            userId: activity.userId,
            action: activity.action,
            content: contactDeals.length > 1
              ? `[${deal.title}] ${activity.content || ''}`
              : activity.content,
            fromValue: activity.fromValue,
            toValue: activity.toValue,
            createdAt: activity.createdAt,
          },
        });
        activityCount++;
      }
    }
  }

  console.log(`Migrated ${migratedCount} contacts with pipeline data.`);
  console.log(`Migrated ${activityCount} deal activities to contact activities.\n`);

  if (multiDealContacts.length > 0) {
    console.log('=== CONTACTS WITH MULTIPLE DEALS (manual review recommended) ===');
    for (const mc of multiDealContacts) {
      console.log(`\n  ${mc.contactName} (${mc.contactId}) - ${mc.dealCount} deals:`);
      for (const d of mc.deals) {
        console.log(`    - "${d.title}" [${d.stage}]`);
      }
    }
  } else {
    console.log('No contacts had multiple deals.');
  }

  console.log('\nMigration complete.');
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
