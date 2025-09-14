#!/bin/bash

echo "🚀 STARTING RAILWAY DEPLOYMENT SETUP"
echo "📅 Timestamp: $(date)"
echo "📍 Working directory: $(pwd)"
echo "📍 Node version: $(node --version)"
echo "📍 NPM version: $(npm --version)"

echo ""
echo "1️⃣ STARTING: Prisma database schema push"
if npx prisma db push; then
    echo "✅ SUCCESS: Prisma db push completed"
else
    echo "❌ FAILED: Prisma db push failed"
    exit 1
fi

echo ""
echo "2️⃣ STARTING: Database migration script"
if node scripts/run-migration.js; then
    echo "✅ SUCCESS: Migration script completed"
else
    echo "⚠️ WARNING: Migration script failed, continuing with deployment..."
fi

echo ""
echo "3️⃣ STARTING: User seeding script" 
if node scripts/seed-users.js; then
    echo "✅ SUCCESS: User seeding completed"
else
    echo "⚠️ WARNING: User seeding failed, continuing with deployment..."
fi

echo ""
echo "4️⃣ STARTING: Server startup"
echo "🎯 Final check - about to start server..."
npm start