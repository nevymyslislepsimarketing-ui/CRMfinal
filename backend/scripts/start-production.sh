#!/bin/bash

# 🚀 Production Start Script
# Zajistí migrace před startem serveru

set -e

echo "🚀 Starting production server..."
echo ""

# Kontrola DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL není nastavena!"
    exit 1
fi

# Spustit migrace (safe - neopakuje co už je)
echo "📊 Checking/running migrations..."
node scripts/migrateToV3.js || {
    echo "⚠️  Migration check completed (may already be migrated)"
}

# Seed pricing (safe - ignoruje duplicity)
echo "🌱 Checking/seeding pricing data..."
node scripts/seedPricing.js || {
    echo "⚠️  Pricing already seeded"
}

echo ""
echo "✅ Pre-start checks completed"
echo "🚀 Starting Node.js server..."
echo ""

# Spustit server
npm start
