#!/bin/bash

# 🔍 Check and Update .env Script
# Zkontroluje a aktualizuje backend/.env pro v3.0.0

echo "🔍 Kontrola backend/.env"
echo "======================="
echo ""

# Zkontrolovat že jsme ve správné složce
if [ ! -f "backend/.env.example" ]; then
    echo "❌ Spusťte z root složky projektu!"
    exit 1
fi

# Zkontrolovat že existuje .env
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env neexistuje!"
    echo "   Vytvářím z .env.example..."
    cp backend/.env.example backend/.env
    echo "✅ Vytvořeno backend/.env"
fi

echo "📋 Kontrola potřebných proměnných..."
echo ""

# Potřebné proměnné pro v3.0.0
REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "FRONTEND_URL"
    "COHERE_API_KEY"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
    "GOOGLE_REDIRECT_URI"
)

MISSING=()
PLACEHOLDER=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" backend/.env; then
        MISSING+=("$var")
        echo "❌ Chybí: $var"
    else
        # Zkontrolovat jestli není placeholder
        value=$(grep "^${var}=" backend/.env | cut -d'=' -f2-)
        if [[ "$value" == "" ]] || [[ "$value" == "your_"* ]] || [[ "$value" == "change_this"* ]]; then
            PLACEHOLDER+=("$var")
            echo "⚠️  Placeholder: $var (hodnota: $value)"
        else
            echo "✅ OK: $var"
        fi
    fi
done

echo ""
echo "======================================"
echo ""

# Pokud něco chybí nebo jsou placeholders
if [ ${#MISSING[@]} -gt 0 ] || [ ${#PLACEHOLDER[@]} -gt 0 ]; then
    echo "🔧 AKCE POTŘEBNÉ:"
    echo ""
    
    if [ ${#MISSING[@]} -gt 0 ]; then
        echo "📝 Přidat chybějící proměnné:"
        for var in "${MISSING[@]}"; do
            echo "   - $var"
        done
        echo ""
    fi
    
    if [ ${#PLACEHOLDER[@]} -gt 0 ]; then
        echo "🔑 Nastavit skutečné hodnoty pro:"
        for var in "${PLACEHOLDER[@]}"; do
            echo "   - $var"
        done
        echo ""
    fi
    
    echo "📖 Hodnoty najdete v:"
    echo "   1. .env.secrets (API klíče)"
    echo "   2. Render Dashboard (DATABASE_URL)"
    echo ""
    
    read -p "Chcete automaticky přidat chybějící proměnné? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "📝 Přidávám chybějící proměnné..."
        
        # Přidat chybějící proměnné
        for var in "${MISSING[@]}"; do
            case $var in
                COHERE_API_KEY)
                    if [ -f ".env.secrets" ]; then
                        value=$(grep "^COHERE_API_KEY=" .env.secrets | cut -d'=' -f2-)
                        echo "${var}=${value}" >> backend/.env
                        echo "✅ Přidáno: $var (z .env.secrets)"
                    else
                        echo "${var}=your_cohere_api_key_here" >> backend/.env
                        echo "⚠️  Přidáno: $var (placeholder)"
                    fi
                    ;;
                GOOGLE_CLIENT_ID)
                    if [ -f ".env.secrets" ]; then
                        value=$(grep "^GOOGLE_CLIENT_ID=" .env.secrets | cut -d'=' -f2-)
                        echo "${var}=${value}" >> backend/.env
                        echo "✅ Přidáno: $var (z .env.secrets)"
                    else
                        echo "${var}=your_google_client_id" >> backend/.env
                        echo "⚠️  Přidáno: $var (placeholder)"
                    fi
                    ;;
                GOOGLE_CLIENT_SECRET)
                    if [ -f ".env.secrets" ]; then
                        value=$(grep "^GOOGLE_CLIENT_SECRET=" .env.secrets | cut -d'=' -f2-)
                        echo "${var}=${value}" >> backend/.env
                        echo "✅ Přidáno: $var (z .env.secrets)"
                    else
                        echo "${var}=your_google_client_secret" >> backend/.env
                        echo "⚠️  Přidáno: $var (placeholder)"
                    fi
                    ;;
                GOOGLE_REDIRECT_URI)
                    echo "${var}=http://localhost:5173/google-callback" >> backend/.env
                    echo "✅ Přidáno: $var"
                    ;;
                FRONTEND_URL)
                    echo "${var}=http://localhost:5173" >> backend/.env
                    echo "✅ Přidáno: $var"
                    ;;
                DATABASE_URL)
                    echo "${var}=postgresql://username:password@localhost:5432/nevymyslis_crm" >> backend/.env
                    echo "⚠️  Přidáno: $var (placeholder - nastavte svou lokální DB)"
                    ;;
                JWT_SECRET)
                    # Vygenerovat náhodný secret
                    secret=$(openssl rand -hex 32 2>/dev/null || echo "change_this_to_secure_secret_32_chars_minimum")
                    echo "${var}=${secret}" >> backend/.env
                    echo "✅ Přidáno: $var (vygenerováno)"
                    ;;
            esac
        done
        
        echo ""
        echo "✅ Aktualizace dokončena!"
    fi
else
    echo "✅ Všechny potřebné proměnné jsou nastaveny!"
fi

echo ""
echo "📋 Pro kontrolu hodnot spusťte:"
echo "   cat backend/.env"
echo ""
echo "📖 Pro API klíče viz:"
echo "   cat .env.secrets"
echo ""
