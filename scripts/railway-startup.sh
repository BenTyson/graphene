#!/bin/bash
set -e  # Exit on any error

echo "🚀 STARTING RAILWAY DEPLOYMENT SETUP"
echo "📅 Timestamp: $(date)"
echo "📍 Working directory: $(pwd)"
echo "📍 Node version: $(node --version)"
echo "📍 NPM version: $(npm --version)"

echo ""
echo "1️⃣ STARTING: Prisma database schema push"
npx prisma db push
echo "✅ SUCCESS: Prisma db push completed"

echo ""
echo "2️⃣ STARTING: Database migration script"
node scripts/run-migration.js
echo "✅ SUCCESS: Migration script completed"

echo ""
echo "3️⃣ STARTING: User seeding script" 
node scripts/seed-users.js
echo "✅ SUCCESS: User seeding completed"

echo ""
echo "4️⃣ STARTING: Server startup"
echo "🎯 Final check - about to start server..."
npm start