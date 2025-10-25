#!/bin/bash

# 🔍 Pre-deployment Check Script
# Kontrola před deploymentem do produkce

echo "🔍 Pre-deployment Check"
echo "======================="
echo ""

ERRORS=0

# Kontrola Git statusu
echo "📋 1/7 Kontrola Git statusu..."
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Máte uncommitted změny:"
    git status -s
    read -p "Pokračovat? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Git je čistý"
fi
echo ""

# Kontrola že jsme na main branch
echo "📋 2/7 Kontrola Git branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
    echo "⚠️  Nejste na main branch (aktuálně: $CURRENT_BRANCH)"
    read -p "Pokračovat? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Na main branch"
fi
echo ""

# Kontrola backend dependencies
echo "📋 3/7 Kontrola backend dependencies..."
cd backend
if npm list > /dev/null 2>&1; then
    echo "✅ Backend dependencies OK"
else
    echo "❌ Backend dependencies chybí nebo jsou zastaralé"
    echo "   Spusťte: cd backend && npm install"
    ERRORS=$((ERRORS + 1))
fi
cd ..
echo ""

# Kontrola frontend dependencies
echo "📋 4/7 Kontrola frontend dependencies..."
cd frontend
if npm list > /dev/null 2>&1; then
    echo "✅ Frontend dependencies OK"
else
    echo "❌ Frontend dependencies chybí nebo jsou zastaralé"
    echo "   Spusťte: cd frontend && npm install"
    ERRORS=$((ERRORS + 1))
fi
cd ..
echo ""

# Kontrola .env.example
echo "📋 5/7 Kontrola .env.example..."
if grep -q "COHERE_API_KEY" backend/.env.example && \
   grep -q "GOOGLE_CLIENT_ID" backend/.env.example; then
    echo "✅ .env.example obsahuje nové proměnné"
else
    echo "❌ .env.example neobsahuje všechny potřebné proměnné"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Kontrola migračních skriptů
echo "📋 6/7 Kontrola migračních skriptů..."
if [ -f "backend/scripts/migrateToV3.js" ] && \
   [ -f "backend/scripts/seedPricing.js" ]; then
    echo "✅ Migrační skripty existují"
else
    echo "❌ Migrační skripty chybí"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Build test
echo "📋 7/7 Test buildu..."
echo "  Frontend build test..."
cd frontend
if npm run build > /dev/null 2>&1; then
    echo "✅ Frontend build OK"
    rm -rf dist
else
    echo "❌ Frontend build selhal"
    ERRORS=$((ERRORS + 1))
fi
cd ..
echo ""

# Výsledek
echo "======================================"
if [ $ERRORS -eq 0 ]; then
    echo "✅ Všechny kontroly prošly!"
    echo ""
    echo "🚀 Můžete deployovat:"
    echo "   1. git add ."
    echo "   2. git commit -m 'CRM v3.0.0 update'"
    echo "   3. git push origin main"
    echo "   4. ./update-render-db.sh (po deployi)"
    echo ""
else
    echo "❌ Nalezeno $ERRORS chyb"
    echo "   Opravte chyby před deploymentem"
    exit 1
fi
