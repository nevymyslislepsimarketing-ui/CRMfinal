#!/bin/bash

# 🗄️ Update Render Database Script
# Bezpečná migrace databáze na Render po deployi

echo "🗄️  Update Render Database"
echo "=========================="
echo ""

# Zkontrolovat DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL není nastavena"
    echo ""
    echo "📋 Získejte DATABASE_URL:"
    echo "   1. Přihlaste se na https://render.com"
    echo "   2. Database → nevymyslis-crm-db → Connect"
    echo "   3. Zkopírujte Internal Database URL"
    echo ""
    echo "📋 Pak spusťte:"
    echo "   export DATABASE_URL='postgresql://...'"
    echo "   ./update-render-db.sh"
    exit 1
fi

echo "✅ DATABASE_URL nalezena"
echo ""

# Backup check
echo "⚠️  DŮLEŽITÉ: Před migrací doporučujeme backup!"
echo ""
echo "📋 Vytvoření backupu v Render:"
echo "   1. Dashboard → Database → Backups"
echo "   2. Create Backup"
echo ""
read -p "Máte aktuální backup? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Vytvořte nejdřív backup!"
    exit 1
fi

echo ""
echo "🚀 Spouštím migraci..."
echo ""

# Přejít do backend složky
cd backend

# Instalace dependencies (pokud chybí)
echo "📦 Kontrola dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
fi

# Test database connection
echo "🔌 Test připojení k databázi..."
if node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('❌ Připojení selhalo:', err.message);
    process.exit(1);
  }
  console.log('✅ Připojení OK');
  pool.end();
});
" 2>/dev/null; then
    echo "✅ Database connection OK"
else
    echo "❌ Nelze se připojit k databázi"
    echo "   Zkontrolujte DATABASE_URL"
    exit 1
fi

echo ""

# Spustit migraci
echo "📊 Spouštím migraci na v3.0.0..."
echo ""
node scripts/migrateToV3.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrace úspěšná!"
else
    echo ""
    echo "❌ Migrace selhala"
    exit 1
fi

echo ""

# Seed pricing data
echo "🌱 Spouštím seed dat ceníku..."
echo ""
node scripts/seedPricing.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Seed dat úspěšný!"
else
    echo ""
    echo "❌ Seed dat selhal"
    echo "   (To je OK pokud data už existují)"
fi

cd ..

echo ""
echo "======================================"
echo "🎉 Database update dokončen!"
echo ""
echo "📋 Další kroky:"
echo "   1. Zkontrolujte Render logs"
echo "   2. Test health check:"
echo "      curl https://vase-backend.onrender.com/api/health"
echo "   3. Test aplikace v prohlížeči"
echo ""
