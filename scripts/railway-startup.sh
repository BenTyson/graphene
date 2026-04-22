#!/bin/bash

echo "🚀 STARTING RAILWAY DEPLOYMENT SETUP"
echo "📅 Timestamp: $(date)"
echo "📍 Working directory: $(pwd)"
echo "📍 Node version: $(node --version)"
echo "📍 NPM version: $(npm --version)"

echo ""
echo "1️⃣a STARTING: Backfill task assignees into join table (pre-push, idempotent)"
if node scripts/migrate-task-assignees.js; then
    echo "✅ SUCCESS: Task assignee backfill completed"
else
    echo "❌ FAILED: Task assignee backfill failed"
    exit 1
fi

echo ""
echo "1️⃣b STARTING: Prisma database schema push"
if npx prisma db push --accept-data-loss; then
    echo "✅ SUCCESS: Prisma db push completed"
else
    echo "❌ FAILED: Prisma db push failed"
    exit 1
fi

echo ""
echo "2️⃣ STARTING: Admin user migration"
if node scripts/migrate-admin-user.js; then
    echo "✅ SUCCESS: Admin user migration completed"
else
    echo "❌ FAILED: Admin user migration failed"
    exit 1
fi

echo ""
echo "3️⃣ STARTING: Server startup (skipping redundant seeding for existing production DB)"
echo "🎯 Final check - about to start server..."
npm start