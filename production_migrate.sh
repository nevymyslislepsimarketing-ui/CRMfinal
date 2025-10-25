#!/bin/bash

# ============================================
# Produkční migrační skript pro CRM v2.0.0
# ============================================

set -e  # Ukončit při první chybě

# Barvy pro výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funkce pro barevný výstup
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🔹 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Banner
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CRM Nevymyslíš - Produkční migrace     ║${NC}"
echo -e "${BLUE}║            Verze 2.0.0                    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# KROK 1: Kontrola prostředí
# ============================================
print_step "KROK 1: Kontrola prostředí"

# Zkontrolovat že jsme v backend složce
if [ ! -f "scripts/addClientFields.js" ]; then
    print_error "Nejste v backend složce projektu!"
    print_info "Spusťte: cd /path/to/nevymyslis-crm/backend"
    exit 1
fi
print_success "Backend složka nalezena"

# Zkontrolovat .env soubor
if [ ! -f ".env" ]; then
    print_error ".env soubor neexistuje!"
    exit 1
fi
print_success ".env soubor nalezen"

# Zkontrolovat DATABASE_URL
if ! grep -q "DATABASE_URL" .env; then
    print_error "DATABASE_URL není v .env souboru!"
    exit 1
fi
print_success "DATABASE_URL konfigurace nalezena"

# ============================================
# KROK 2: Záloha databáze
# ============================================
print_step "KROK 2: Záloha databáze"

print_warning "Záloha databáze je POVINNÁ!"
echo ""
echo "Vyberte metodu zálohy:"
echo "1) Automatická záloha pomocí pg_dump (doporučeno)"
echo "2) Manuální záloha (provedete sami)"
echo "3) Přeskočit zálohu (NEBEZPEČNÉ!)"
echo ""
read -p "Vaše volba (1-3): " backup_choice

BACKUP_FILE="backup_before_migration_$(date +%Y%m%d_%H%M%S).sql.gz"

if [ "$backup_choice" == "1" ]; then
    print_info "Spouštím automatickou zálohu..."
    
    # Získat DB credentials z .env
    DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2-)
    
    # Pokusit se extrahovat údaje z connection stringu
    # Formát: postgresql://user:password@host:port/database
    
    echo ""
    echo "Zadejte přihlašovací údaje k databázi:"
    read -p "PostgreSQL uživatel [postgres]: " DB_USER
    DB_USER=${DB_USER:-postgres}
    
    read -p "Název databáze [nevymyslis_crm]: " DB_NAME
    DB_NAME=${DB_NAME:-nevymyslis_crm}
    
    read -p "Host [localhost]: " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    
    read -sp "Heslo (prázdné pokud není): " DB_PASS
    echo ""
    
    print_info "Vytvářím zálohu: $BACKUP_FILE"
    
    if [ -z "$DB_PASS" ]; then
        pg_dump -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" | gzip > "$BACKUP_FILE"
    else
        PGPASSWORD="$DB_PASS" pg_dump -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" | gzip > "$BACKUP_FILE"
    fi
    
    if [ $? -eq 0 ] && [ -s "$BACKUP_FILE" ]; then
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        print_success "Záloha vytvořena: $BACKUP_FILE (velikost: $BACKUP_SIZE)"
    else
        print_error "Záloha selhala!"
        exit 1
    fi

elif [ "$backup_choice" == "2" ]; then
    print_warning "Proveďte zálohu databáze NYNÍ pomocí:"
    echo "pg_dump -U postgres nevymyslis_crm | gzip > $BACKUP_FILE"
    echo ""
    read -p "Potvrzuji že jsem provedl zálohu (ano/ne): " backup_confirm
    
    if [ "$backup_confirm" != "ano" ]; then
        print_error "Migrace zrušena - záloha není potvrzena"
        exit 1
    fi
    print_success "Záloha potvrzena uživatelem"

elif [ "$backup_choice" == "3" ]; then
    print_error "VAROVÁNÍ: Pokračujete BEZ zálohy!"
    echo ""
    read -p "OPRAVDU chcete pokračovat bez zálohy? (zadejte 'SOUHLASIM'): " confirm
    
    if [ "$confirm" != "SOUHLASIM" ]; then
        print_error "Migrace zrušena"
        exit 1
    fi
    print_warning "Pokračuji bez zálohy (na vlastní riziko)"
else
    print_error "Neplatná volba"
    exit 1
fi

# ============================================
# KROK 3: Spuštění migrace
# ============================================
print_step "KROK 3: Spuštění migrace"

print_info "Spouštím migrační skript..."
echo ""

if node scripts/addClientFields.js; then
    print_success "Migrace úspěšně dokončena!"
else
    print_error "Migrace selhala!"
    echo ""
    print_info "Zkuste manuální SQL příkazy z PRODUCTION_MIGRATION_GUIDE.md"
    exit 1
fi

# ============================================
# KROK 4: Ověření
# ============================================
print_step "KROK 4: Ověření migrace"

print_info "Kontroluji databázové struktury..."

# Tady bychom mohli přidat SQL dotazy pro ověření
# Např. pomocí psql

echo ""
print_warning "Manuálně ověřte migrace pomocí:"
echo "psql -U postgres nevymyslis_crm"
echo "  \\d clients"
echo "  \\d client_credentials"
echo "  \\q"

# ============================================
# KROK 5: Další kroky
# ============================================
print_step "KROK 5: Další kroky"

echo ""
print_success "Migrace databáze dokončena!"
echo ""
print_warning "Nyní musíte:"
echo "1. Restartovat backend aplikaci"
echo "2. Restartovat frontend aplikaci (pokud je třeba)"
echo "3. Otestovat nové funkce"
echo ""

echo "Příkazy pro restart (vyberte podle vašeho setup):"
echo ""
echo "PM2:"
echo "  pm2 restart backend"
echo "  pm2 restart frontend"
echo ""
echo "systemd:"
echo "  sudo systemctl restart nevymyslis-backend"
echo "  sudo systemctl restart nevymyslis-frontend"
echo ""
echo "Docker:"
echo "  docker-compose restart"
echo ""

read -p "Přejete si zobrazit checklist pro testování? (ano/ne): " show_test

if [ "$show_test" == "ano" ]; then
    echo ""
    print_step "Testovací checklist"
    echo ""
    echo "Otevřete aplikaci a otestujte:"
    echo "  ☐ Detail klienta (ikona oka u klienta)"
    echo "  ☐ Přidání Google Drive odkazu u klienta"
    echo "  ☐ Přidání přihlašovacích údajů v detailu klienta"
    echo "  ☐ Filtr úkolů podle uživatele (jako manažer)"
    echo "  ☐ Kliknutí na Dashboard karty"
    echo "  ☐ Editace uživatele v Admin panelu"
    echo "  ☐ Nový kalendář s týdenním zobrazením"
    echo "  ☐ Email notifikace (vytvořte testovací úkol)"
    echo ""
fi

# ============================================
# Informace o záloze
# ============================================
if [ "$backup_choice" == "1" ] && [ -f "$BACKUP_FILE" ]; then
    echo ""
    print_step "Informace o záloze"
    echo ""
    print_info "Záloha databáze: $BACKUP_FILE"
    print_info "Umístění: $(pwd)/$BACKUP_FILE"
    print_info "Velikost: $(du -h "$BACKUP_FILE" | cut -f1)"
    echo ""
    print_warning "Uschovejte tuto zálohu po dobu minimálně 30 dní!"
    echo ""
    echo "Pro obnovení ze zálohy použijte:"
    echo "gunzip -c $BACKUP_FILE | psql -U postgres nevymyslis_crm"
fi

# ============================================
# Konec
# ============================================
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Migrace úspěšně dokončena!        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""

print_info "Pro detailní dokumentaci viz: PRODUCTION_MIGRATION_GUIDE.md"
echo ""
