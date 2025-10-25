# 🚀 Rychlý Deployment Guide - CRM v3.0.0

## ✅ Co je hotovo

### Backend (100%):
- ✅ Databázové migrace
- ✅ API routes pro projekty, pricing, finance
- ✅ CRON joby pro notifikace a faktury
- ✅ Email služby
- ✅ Seed data pro ceník

### Frontend (100%):
- ✅ Projects stránka
- ✅ Pricing/Naceňování stránka
- ✅ Tasks - nové statusy (new, in_progress, waiting_for_client, done)
- ✅ Routes v App.jsx
- ✅ Navigace v Layout.jsx

---

## 📋 Nasazení (5 kroků)

### KROK 1: Instalace dependencies (2 min)

```bash
cd backend
npm install
```

### KROK 2: Migrace databáze (2 min)

```bash
# Lokálně:
npm run migrate:v3

# Nebo na Render přes Shell:
npm run migrate:v3
```

**Co to udělá:**
- Vytvoří 9 nových tabulek
- Přidá finance sloupce do `clients`
- Aktualizuje `tasks.status`

### KROK 3: Naplnění ceníku (1 min)

```bash
npm run seed:pricing
```

**Vloží 16 služeb:**
- Balíčky sociálních sítí (BASIC, STANDARD, PREMIUM)
- Rozšíření platforem
- Reklamy, grafika, focení
- Weby, e-shop, údržba

### KROK 4: Restartovat backend

```bash
# Lokálně:
npm run dev

# Na Render:
# Manual Deploy v Dashboard
```

### KROK 5: Test

Otevřete aplikaci a zkontrolujte:

✅ Projekty - nová záložka funguje  
✅ Naceňování - vytvořte testovací nabídku  
✅ Úkoly - zkuste nové statusy  
✅ CRON joby běží (pokud NODE_ENV=production)

---

## 🧪 Testování nových funkcí

### 1. Projekty

1. Klikněte na "Projekty" v menu
2. Vytvořte nový projekt (např. "Nový web pro klienta")
3. Vyberte typ, klienta, deadline
4. Projekt se zobrazí v přehledu

### 2. Naceňování

1. Klikněte na "Naceňování" v menu
2. Vyberte služby z ceníku (zaškrtávání)
3. Upravte ceny pokud potřeba
4. Vyberte klienta
5. Klikněte "Uložit nabídku"
6. Nabídka se aplikuje na klienta jako pravidelná faktura

### 3. Úkoly - nové statusy

1. Vytvořte nebo upravte úkol
2. V dropdown "Status" vidíte:
   - Nový
   - V řešení
   - Čeká na klienta
   - Hotovo

### 4. CRON joby

**Lokálně zapnout:**
V `.env` přidejte:
```
ENABLE_CRON=true
```

**Na produkci:**
Automaticky běží (NODE_ENV=production)

**Co dělají:**
- Každý den 8:00 - kontrola deadlinů úkolů (email v den deadlinu)
- Každý den 8:00 - kontrola deadlinů projektů (email den před)
- Každý den 9:00 - generování pravidelných faktur

---

## 🔍 Ověření že vše funguje

### Backend:

```bash
# Health check:
curl http://localhost:5001/api/health

# Mělo by vrátit:
{
  "status": "ok",
  "version": "3.0.0",
  "cron": "running"
}
```

### Databáze:

```sql
-- Zkontrolovat nové tabulky:
\dt

-- Měly by existovat:
projects
project_milestones
project_team
project_checklist
service_pricing
client_quotes
one_time_invoices
invoice_splits
ai_post_history
```

### Frontend:

1. Všechny stránky se načítají bez chyb
2. Projekty - můžete vytvářet/editovat
3. Naceňování - můžete vybírat služby
4. Úkoly - nové statusy fungují

---

## ⚠️ Běžné problémy

### Migrace selže:

```bash
# Spusťte znovu:
npm run migrate:v3

# Pokud stále selže, zkontrolujte DATABASE_URL v .env
```

### CRON joby neběží:

```bash
# Zkontrolujte logy serveru:
# Měli byste vidět:
⏰ Spouštím CRON joby...
✅ CRON joby spuštěny

# Pokud ne:
# 1. Nastavte ENABLE_CRON=true v .env (lokálně)
# 2. Nebo NODE_ENV=production (na serveru)
```

### Frontend chyby "Cannot read properties of undefined":

```bash
# Zkontrolujte že backend běží
# Zkontrolujte REACT_APP_API_URL v .env
```

---

## 📊 Co bylo změněno

### Nové soubory:

**Backend:**
- `scripts/migrateToV3.js` - Migrace
- `scripts/seedPricing.js` - Seed ceníku
- `routes/projects.js` - API projekty
- `routes/pricing.js` - API pricing
- `routes/finance.js` - API finance
- `services/cronService.js` - CRON joby

**Frontend:**
- `pages/Projects.jsx` - Stránka projektů
- `pages/Pricing.jsx` - Naceňování

**Aktualizované:**
- `backend/server.js` - Nové routes + CRON
- `backend/package.json` - node-cron
- `backend/services/emailService.js` - Nové emaily
- `frontend/src/pages/Tasks.jsx` - Nové statusy
- `frontend/src/App.jsx` - Nové routes
- `frontend/src/components/Layout.jsx` - Navigace

---

## 🎯 Následující kroky (volitelné)

### Finance tab v Clients (pro manažery):

Přidání finance tabu do detail klienta:
- Pravidelné faktury
- Jednorázové faktury
- Invoice splits (přerozdělení)

### AI Caption Generator:

Vyžaduje:
- OpenAI API klíč
- Environment variable: `OPENAI_API_KEY`

### Google Drive integrace:

Vyžaduje:
- Google Cloud Project
- OAuth 2.0 credentials
- Složitější setup

---

## 💾 Backup před deploymentem

**DŮLEŽITÉ:** Vždy zálohujte databázi před migrací!

```bash
# Lokálně (PostgreSQL):
pg_dump -U postgres nevymyslis_crm > backup_$(date +%Y%m%d).sql

# Render:
# Dashboard → Database → Backups → Create Backup
```

---

## 📞 Potřebujete pomoc?

1. Zkontrolujte logy backendu
2. Zkontrolujte browser console pro frontend chyby
3. Zkontrolujte DATABASE_URL v .env
4. Zkontrolujte že všechny npm packages jsou nainstalovány

---

**Verze:** 3.0.0  
**Backend:** ✅ Hotovo  
**Frontend:** ✅ Hotovo  
**Testování:** ⏳ Připraveno
