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
echo "2️⃣ STARTING: Server startup (skipping redundant seeding for existing production DB)"
echo "🎯 Final check - about to start server..."
npm start