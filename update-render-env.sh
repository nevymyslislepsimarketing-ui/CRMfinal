#!/bin/bash

# 🔑 Update Render Environment Variables
# Generuje příkazy pro update env vars na Render

echo "🔑 Update Render Environment Variables"
echo "======================================="
echo ""

echo "📋 NOVÉ environment variables pro v3.0.0:"
echo ""

cat << 'EOF'
# AI - Cohere API (NOVÁ)
COHERE_API_KEY=<see_.env.secrets_file>

# Google Drive API (NOVÉ)
GOOGLE_CLIENT_ID=<see_.env.secrets_file>
GOOGLE_CLIENT_SECRET=<see_.env.secrets_file>
GOOGLE_REDIRECT_URI=https://VASE-CLOUDFLARE-DOMENA.pages.dev/google-callback
EOF

echo ""
echo "======================================"
echo ""
echo "📝 Jak přidat do Render:"
echo ""
echo "Způsob 1: Render Dashboard (DOPORUČENO)"
echo "   1. Přihlaste se na https://dashboard.render.com"
echo "   2. Vyberte backend service"
echo "   3. Environment → Add Environment Variable"
echo "   4. Přidejte každou proměnnou výše"
echo "   5. ⚠️  DŮLEŽITÉ: U GOOGLE_REDIRECT_URI nahraďte"
echo "      'VASE-CLOUDFLARE-DOMENA' vaší skutečnou doménou!"
echo ""

echo "Způsob 2: Render CLI (pokud máte nainstalované)"
echo "   render env set COHERE_API_KEY=<your_value_from_.env.secrets>"
echo "   render env set GOOGLE_CLIENT_ID=<your_value_from_.env.secrets>"
echo "   render env set GOOGLE_CLIENT_SECRET=<your_value_from_.env.secrets>"
echo "   render env set GOOGLE_REDIRECT_URI=https://VASE-DOMENA.pages.dev/google-callback"
echo ""

echo "======================================"
echo ""
echo " Po přidání proměnných:"
echo "   - Render automaticky restartuje service"
echo "   - Počkejte ~30 sekund"
echo "   - Zkontrolujte logs"
echo ""

echo "🔍 Ověření:"
echo "   curl https://vase-backend.onrender.com/api/health"
echo "   Mělo by vrátit: {\"status\":\"ok\",\"version\":\"3.0.0\"}"
echo ""
