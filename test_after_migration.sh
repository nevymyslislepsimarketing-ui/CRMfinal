#!/bin/bash

# ============================================
# Testovací skript po migraci CRM v2.0.0
# ============================================

set -e

# Barvy
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_test() {
    echo -e "${YELLOW}🧪 $1${NC}"
}

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Test migrace CRM v2.0.0               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Konfigurace
read -p "Backend URL [http://localhost:5000]: " BACKEND_URL
BACKEND_URL=${BACKEND_URL:-http://localhost:5000}

read -p "Frontend URL [http://localhost:3000]: " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}

echo ""
print_info "Testování na: $BACKEND_URL"
echo ""

# ============================================
# TEST 1: Backend dostupnost
# ============================================
print_test "TEST 1: Backend dostupnost"

if curl -s -f "$BACKEND_URL/api/health" > /dev/null 2>&1; then
    print_success "Backend běží"
else
    print_error "Backend neodpovídá"
    echo "Zkuste: curl $BACKEND_URL/api/health"
fi

# ============================================
# TEST 2: Databázové struktury
# ============================================
print_test "TEST 2: Databázové struktury"

echo ""
echo "Připojení k databázi pro ověření..."
read -p "PostgreSQL uživatel [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -p "Název databáze [nevymyslis_crm]: " DB_NAME
DB_NAME=${DB_NAME:-nevymyslis_crm}

echo ""
print_info "Kontrola sloupce google_drive_link..."
if psql -U "$DB_USER" "$DB_NAME" -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='clients' AND column_name='google_drive_link';" | grep -q "google_drive_link"; then
    print_success "Sloupec google_drive_link existuje"
else
    print_error "Sloupec google_drive_link NEEXISTUJE"
fi

print_info "Kontrola tabulky client_credentials..."
if psql -U "$DB_USER" "$DB_NAME" -t -c "SELECT tablename FROM pg_tables WHERE tablename='client_credentials';" | grep -q "client_credentials"; then
    print_success "Tabulka client_credentials existuje"
else
    print_error "Tabulka client_credentials NEEXISTUJE"
fi

# ============================================
# TEST 3: API Endpointy
# ============================================
print_test "TEST 3: API Endpointy"

echo ""
print_info "Pro testování API potřebujeme autorizační token"
echo "Přihlaste se do aplikace a zkopírujte token z localStorage"
echo "Nebo zadejte email a heslo pro získání tokenu"
echo ""

read -p "Chcete otestovat API endpointy? (ano/ne): " test_api

if [ "$test_api" == "ano" ]; then
    read -p "Email: " email
    read -sp "Heslo: " password
    echo ""
    
    # Získat token
    print_info "Získávám autorizační token..."
    TOKEN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
        print_success "Token získán"
        
        # Test GET /clients/:id/credentials
        print_info "Test: GET /clients/1/credentials"
        RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BACKEND_URL/api/clients/1/credentials" \
            -H "Authorization: Bearer $TOKEN")
        
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        if [ "$HTTP_CODE" -eq 200 ]; then
            print_success "Endpoint /clients/:id/credentials funguje"
        else
            print_error "Endpoint vrátil HTTP $HTTP_CODE"
        fi
        
    else
        print_error "Nepodařilo se získat token"
    fi
fi

# ============================================
# TEST 4: Frontend dostupnost
# ============================================
print_test "TEST 4: Frontend dostupnost"

echo ""
if curl -s -f "$FRONTEND_URL" > /dev/null 2>&1; then
    print_success "Frontend běží"
else
    print_error "Frontend neodpovídá"
fi

# ============================================
# Manuální test checklist
# ============================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 Manuální testovací checklist${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Otevřete aplikaci na: $FRONTEND_URL"
echo ""
echo "Jako MANAŽER otestujte:"
echo ""
echo "  ☐ Stránka KLIENTI:"
echo "    • Klikněte na ikonu oka u klienta → Otevře se detail"
echo "    • V detailu klikněte 'Přidat údaje' → Přidejte přihlašovací údaje"
echo "    • Upravte klienta → Přidejte Google Drive odkaz"
echo "    • V detailu klikněte na Google Drive tlačítko → Otevře se v novém okně"
echo ""
echo "  ☐ Stránka ÚKOLY:"
echo "    • Nahoře by měl být filtr s dropdownem uživatelů"
echo "    • Vyberte uživatele → Zobrazí se pouze jeho úkoly"
echo "    • Klikněte 'Zrušit filtr' → Zobrazí se všechny úkoly"
echo ""
echo "  ☐ Stránka DASHBOARD:"
echo "    • Klikněte na kartu 'Celkem klientů' → Přesměruje na Klienty"
echo "    • Klikněte na kartu 'Nevyřízené úkoly' → Přesměruje na Úkoly"
echo "    • Klikněte na jakoukoliv fakturační kartu → Přesměruje na Faktury"
echo ""
echo "  ☐ Stránka ADMIN:"
echo "    • U pracovníka klikněte na tužku (Upravit)"
echo "    • Změňte jméno nebo pozici → Uložte"
echo "    • Zkuste změnit roli pracovníka na manažera"
echo ""
echo "  ☐ Stránka KALENDÁŘ:"
echo "    • Klikněte na tlačítko 'Týden' v pravém horním rohu"
echo "    • Měli byste vidět časovou osu 6:00 - 24:00"
echo "    • Klikněte na tlačítko 'Měsíc' → Přepne se na měsíční zobrazení"
echo "    • Klikněte na konkrétní den → Otevře se modal s předvyplněným datem"
echo "    • V týdenním zobrazení klikněte na časový slot → Otevře se modal s časem"
echo ""
echo "  ☐ EMAIL NOTIFIKACE:"
echo "    • Vytvořte nový úkol a přiřaďte ho jinému uživateli"
echo "    • Zkontrolujte Mailtrap že email byl odeslán"
echo "    • Email by měl obsahovat název úkolu, popis, termín, klienta"
echo ""

# ============================================
# Test logů
# ============================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📝 Kontrola logů${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Zkontrolujte logy aplikace na chyby:"
echo ""
echo "PM2:"
echo "  pm2 logs backend --lines 50"
echo ""
echo "systemd:"
echo "  sudo journalctl -u nevymyslis-backend -n 50"
echo ""
echo "Docker:"
echo "  docker logs nevymyslis-backend --tail 50"
echo ""

# ============================================
# Výsledek
# ============================================
echo ""
read -p "Všechny testy proběhly úspěšně? (ano/ne): " all_ok

if [ "$all_ok" == "ano" ]; then
    echo ""
    print_success "Skvělé! Migrace byla úspěšná a všechny funkce fungují."
    echo ""
    print_info "Co dělat dál:"
    echo "  1. Informujte tým o nových funkcích"
    echo "  2. Sledujte logy prvních 24 hodin"
    echo "  3. Shromážděte feedback od uživatelů"
    echo "  4. Uschovejte zálohu databáze"
    echo ""
else
    echo ""
    print_error "Některé testy selhaly"
    echo ""
    print_info "Řešení problémů:"
    echo "  1. Zkontrolujte PRODUCTION_MIGRATION_GUIDE.md"
    echo "  2. Zkontrolujte logy aplikace"
    echo "  3. Ověřte že migrace proběhla správně"
    echo "  4. V nejhorším případě použijte rollback ze zálohy"
    echo ""
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Testování dokončeno              ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""
