#!/bin/bash

# ============================================
# Lokální test migrace před pushem na Render
# ============================================

set -e

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

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Test migrace před Render deploymentem   ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Zkontrolovat že jsme v root složce projektu
if [ ! -f "render.yaml" ]; then
    print_error "Nejste v root složce projektu!"
    print_info "Spusťte: cd /path/to/nevymyslis-crm"
    exit 1
fi

print_info "Root složka projektu nalezena"
echo ""

# ============================================
# TEST 1: Zkontrolovat soubory
# ============================================
print_info "TEST 1: Kontrola potřebných souborů..."
echo ""

files_ok=true

# Zkontrolovat render.yaml
if [ -f "render.yaml" ]; then
    print_success "render.yaml existuje"
else
    print_error "render.yaml NEEXISTUJE"
    files_ok=false
fi

# Zkontrolovat runMigrations.js
if [ -f "backend/scripts/runMigrations.js" ]; then
    print_success "backend/scripts/runMigrations.js existuje"
else
    print_error "backend/scripts/runMigrations.js NEEXISTUJE"
    files_ok=false
fi

# Zkontrolovat package.json má správné scripty
if grep -q '"migrate"' backend/package.json && grep -q '"build"' backend/package.json; then
    print_success "package.json má migrate a build scripty"
else
    print_error "package.json NEMÁ správné scripty"
    print_info "Přidejte do scripts sekce:"
    echo '  "migrate": "node scripts/runMigrations.js",'
    echo '  "build": "npm run migrate"'
    files_ok=false
fi

if [ "$files_ok" = false ]; then
    print_error "Některé soubory chybí - opravte to před pokračováním"
    exit 1
fi

echo ""

# ============================================
# TEST 2: Lokální test migrace
# ============================================
print_info "TEST 2: Spuštění migrace lokálně..."
echo ""

print_warning "Toto spustí migraci na vaší lokální databázi"
read -p "Pokračovat? (ano/ne): " continue_test

if [ "$continue_test" != "ano" ]; then
    print_warning "Test přeskočen"
    exit 0
fi

echo ""
print_info "Spouštím npm run migrate v backend složce..."
echo ""

cd backend

if npm run migrate; then
    echo ""
    print_success "Migrace proběhla úspěšně!"
else
    echo ""
    print_error "Migrace selhala!"
    print_info "Zkontrolujte chybovou hlášku výše"
    print_info "Opravte chyby před pushem na Render"
    exit 1
fi

cd ..

echo ""

# ============================================
# TEST 3: Simulovat Render build command
# ============================================
print_info "TEST 3: Simulace Render build command..."
echo ""

print_info "Render spustí: npm install && npm run build"
echo ""

read -p "Chcete simulovat celý build proces? (ano/ne): " simulate_build

if [ "$simulate_build" = "ano" ]; then
    cd backend
    
    print_info "Running: npm install..."
    if npm install; then
        print_success "npm install OK"
    else
        print_error "npm install SELHAL"
        exit 1
    fi
    
    echo ""
    print_info "Running: npm run build..."
    if npm run build; then
        print_success "npm run build OK"
    else
        print_error "npm run build SELHAL"
        exit 1
    fi
    
    cd ..
    echo ""
    print_success "Simulace build procesu úspěšná!"
fi

echo ""

# ============================================
# TEST 4: Zkontrolovat .gitignore
# ============================================
print_info "TEST 4: Kontrola .gitignore..."
echo ""

gitignore_ok=true

if [ -f "backend/.gitignore" ]; then
    if grep -q "\.env" backend/.gitignore; then
        print_success ".env je v .gitignore"
    else
        print_error ".env NENÍ v .gitignore"
        print_warning "NEBEZPEČÍ: .env soubor by mohl být pushnuto do Gitu!"
        gitignore_ok=false
    fi
    
    if grep -q "node_modules" backend/.gitignore; then
        print_success "node_modules je v .gitignore"
    else
        print_error "node_modules NENÍ v .gitignore"
        gitignore_ok=false
    fi
else
    print_error "backend/.gitignore NEEXISTUJE"
    gitignore_ok=false
fi

if [ "$gitignore_ok" = false ]; then
    print_warning "Opravte .gitignore před pushem!"
fi

echo ""

# ============================================
# TEST 5: Zkontrolovat Git status
# ============================================
print_info "TEST 5: Git status..."
echo ""

if git diff --quiet backend/scripts/runMigrations.js; then
    print_success "runMigrations.js je commitnutý"
else
    print_warning "runMigrations.js má uncommited změny"
fi

if git diff --quiet backend/package.json; then
    print_success "package.json je commitnutý"
else
    print_warning "package.json má uncommited změny"
fi

if git diff --quiet render.yaml; then
    print_success "render.yaml je commitnutý"
else
    print_warning "render.yaml má uncommited změny"
fi

# Zkontrolovat jestli je něco ve staging area
if [ -n "$(git status --porcelain)" ]; then
    echo ""
    print_warning "Máte uncommitted změny:"
    git status --short
    echo ""
    print_info "Před pushem na Render commitněte všechny změny"
fi

echo ""

# ============================================
# Výsledek
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 Shrnutí${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Před pushem na Render zkontrolujte:"
echo ""
echo "  ☐ Všechny soubory jsou commitnuté"
echo "  ☐ .env NENÍ v Gitu"
echo "  ☐ Migrace funguje lokálně"
echo "  ☐ Build proces proběhl OK"
echo ""

print_info "Pokud je vše OK, můžete pushit:"
echo ""
echo "  git add ."
echo "  git commit -m \"feat: Automatická migrace pro Render\""
echo "  git push origin main"
echo ""

print_info "Poté v Render Dashboard:"
echo "  1. New + → Blueprint"
echo "  2. Vyberte repozitář"
echo "  3. Apply"
echo ""

echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Test dokončen!                    ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""

print_info "Pro detailní návod viz: RENDER_QUICK_START.md"
echo ""
