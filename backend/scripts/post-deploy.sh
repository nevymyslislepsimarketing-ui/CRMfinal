#!/bin/bash

# 🚀 Post-Deploy Script pro Render
# Automaticky spouští migrace po každém deployi

set -e  # Exit při chybě

echo "🔄 Post-Deploy: Spouštím migrace..."

# Kontrola DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL není nastavena!"
    exit 1
fi

echo "✅ DATABASE_URL nalezena"

# Spustit migrace
echo "📊 Migrace databáze na v3.0.0..."
node scripts/migrateToV3.js

# Seed pricing (ignorovat chybu pokud data už existují)
echo "🌱 Seed dat ceníku..."
node scripts/seedPricing.js || echo "⚠️  Seed přeskočen (data už existují)"

echo "✅ Post-Deploy dokončen!"
