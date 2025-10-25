#!/bin/bash

# Git příkazy pro commit a push nových funkcí
# Spusťte tento soubor nebo zkopírujte příkazy jeden po druhém

echo "🔍 Kontrola změn v projektu..."
git status

echo ""
echo "📝 Přidání všech změněných souborů..."

# Přidat všechny nové a změněné soubory
git add .

# Nebo přidat soubory individuálně:
# Backend
# git add backend/scripts/addClientFields.js
# git add backend/routes/clients.js
# git add backend/routes/users.js
# git add backend/routes/tasks.js
# git add backend/services/emailService.js

# Frontend
# git add frontend/src/pages/Clients.jsx
# git add frontend/src/pages/Tasks.jsx
# git add frontend/src/pages/Dashboard.jsx
# git add frontend/src/pages/Admin.jsx
# git add frontend/src/pages/CalendarEnhanced.jsx
# git add frontend/src/App.jsx

# Dokumentace
# git add IMPLEMENTED_FEATURES.md
# git add QUICK_START.md
# git add COMMIT_MESSAGE.txt
# git add GIT_COMMANDS.sh

echo ""
echo "✅ Soubory přidány do staging area"
echo ""
echo "📊 Přehled změn:"
git status

echo ""
echo "💬 Vytvoření commitu..."

# Commit s detailní zprávou
git commit -m "feat: Implementace kompletní sady nových funkcí CRM v2.0.0

Všechny požadované funkce byly úspěšně implementovány:

✅ Filtrování úkolů podle uživatele (manažeři)
✅ Detail klienta s Google Drive a přihlašovacími údaji
✅ Klikací dashboard karty s navigací
✅ Editace rolí uživatelů v Admin panelu
✅ Email notifikace při přiřazení úkolu
✅ Vylepšený kalendář s týdenním/měsíčním zobrazením

BREAKING CHANGE: Vyžaduje databázovou migraci
Spusťte: node backend/scripts/addClientFields.js

Nové API endpointy:
- GET/POST/PUT/DELETE /clients/:id/credentials
- PATCH /users/:id

Nové komponenty:
- CalendarEnhanced.jsx

Verze: 2.0.0
Testováno: Ano
Dokumentace: IMPLEMENTED_FEATURES.md, QUICK_START.md"

echo ""
echo "✅ Commit vytvořen"
echo ""
echo "📤 Nahrání do vzdáleného repozitáře..."

# Push do hlavní větve (upravte podle vašeho workflow)
# git push origin main
# nebo
# git push origin master

echo ""
echo "⚠️  DŮLEŽITÉ: Před pushem zkontrolujte:"
echo "1. Že všechny soubory jsou v commitu"
echo "2. Že .env soubory NEJSOU v commitu (měly by být v .gitignore)"
echo "3. Že migrace databáze je připravena"
echo ""
echo "Pro push spusťte:"
echo "git push origin main    # nebo master, podle vaší větve"
echo ""
echo "🎉 Připraveno k push!"
