#!/bin/bash

# 🚀 Google Drive Setup Script
# Automatické nastavení Google Drive credentials

echo "🔐 Google Drive Setup"
echo "====================="
echo ""

# Zkontrolovat že jsme v root složce
if [ ! -d "backend" ]; then
    echo "❌ Chyba: Spusťte tento script z root složky projektu"
    exit 1
fi

# Zkontrolovat že existuje backend/.env
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env neexistuje, vytvářím z .env.example..."
    cp backend/.env.example backend/.env
    echo "✅ Vytvořeno backend/.env"
fi

echo "📝 Přidávám Google Drive credentials do backend/.env..."

# Zkontrolovat jestli credentials už existují
if grep -q "GOOGLE_CLIENT_ID=" backend/.env; then
    echo "⚠️  Google credentials už existují v .env"
    read -p "Přepsat? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Zrušeno"
        exit 1
    fi
    # Odstranit staré credentials
    sed -i '' '/GOOGLE_CLIENT_ID=/d' backend/.env
    sed -i '' '/GOOGLE_CLIENT_SECRET=/d' backend/.env
    sed -i '' '/GOOGLE_REDIRECT_URI=/d' backend/.env
fi

# POZNÁMKA: Credentials najdete v API_KEYS_REFERENCE.md (lokální secure storage)
# Nebo je zadejte manuálně
echo ""
echo "⚠️  Credentials jsou v secure storage (API_KEYS_REFERENCE.md)"
echo "   Pro automatické přidání upravte tento script s vašimi hodnotami"
echo ""
echo "Pro nyní přidejte manuálně do backend/.env:"
echo ""
echo "GOOGLE_CLIENT_ID=<your_value>"
echo "GOOGLE_CLIENT_SECRET=<your_value>"
echo "GOOGLE_REDIRECT_URI=http://localhost:5173/google-callback"
echo ""
exit 0

echo "✅ Google Drive credentials přidány!"
echo ""
echo "🎉 Setup dokončen!"
echo ""
echo "📋 Další kroky:"
echo "1. Restartujte backend: cd backend && npm run dev"
echo "2. Otevřete aplikaci: http://localhost:5173"
echo "3. Klikněte na 'Google Drive' v menu"
echo "4. Připojte se k Google Drive"
echo ""
echo "📖 Dokumentace: GOOGLE_DRIVE_SETUP.md"
