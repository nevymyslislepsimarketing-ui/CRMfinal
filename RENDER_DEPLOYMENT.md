# 🚀 Automatický Deployment na Render.com

Tento návod vám ukáže jak nastavit automatický deployment včetně migrací databáze při každém push do Gitu.

---

## 📋 Přehled

Po nastavení bude automaticky při každém `git push`:
1. ✅ Stáhnout nový kód z Gitu
2. ✅ Spustit migrace databáze
3. ✅ Rebuild a restart backendu
4. ✅ Rebuild a restart frontendu
5. ✅ Všechno bude live během pár minut

**Žádné SSH potřeba!** Vše se děje automaticky.

---

## 🎯 Metoda A: Použití render.yaml (Doporučeno)

### Krok 1: Commitněte render.yaml

```bash
git add render.yaml
git add backend/package.json
git add backend/scripts/runMigrations.js
git commit -m "feat: Přidána automatická migrace pro Render.com"
git push origin main
```

### Krok 2: V Render Dashboard

1. Přihlaste se na [https://dashboard.render.com](https://dashboard.render.com)
2. Klikněte **"New +"** → **"Blueprint"**
3. Vyberte váš Git repozitář
4. Render automaticky najde `render.yaml` a nabídne vytvoření všech služeb
5. Klikněte **"Apply"**

### Krok 3: Nastavit Environment Variables

Po vytvoření služeb, nastavte tyto proměnné v Dashboard:

**Backend Service:**
- `MAILTRAP_API_TOKEN` - Váš Mailtrap API token
- `EMAIL_FROM` - Email adresa odesílatele
- `FRONTEND_URL` - URL vašeho frontendu (např. https://nevymyslis-crm.onrender.com)

**Frontend Service:**
- `REACT_APP_API_URL` - URL vašeho backendu (např. https://nevymyslis-crm-backend.onrender.com/api)

### Hotovo! 🎉

Při dalším push do Gitu se vše automaticky nasadí včetně migrací.

---

## 🎯 Metoda B: Manuální nastavení v Dashboard

Pokud nechcete použít render.yaml, můžete služby vytvořit manuálně:

### 1. Vytvoření PostgreSQL databáze

1. V Dashboard klikněte **"New +"** → **"PostgreSQL"**
2. **Name:** `nevymyslis-crm-db`
3. **Database:** `nevymyslis_crm`
4. **Region:** Frankfurt (nebo podle preference)
5. **Plan:** Free
6. Klikněte **"Create Database"**
7. ⚠️ **Zkopírujte Internal Database URL** - budete ho potřebovat

### 2. Vytvoření Backend Service

1. V Dashboard klikněte **"New +"** → **"Web Service"**
2. Připojte váš Git repozitář
3. **Name:** `nevymyslis-crm-backend`
4. **Region:** Frankfurt
5. **Branch:** main (nebo master)
6. **Root Directory:** `backend`
7. **Environment:** Node
8. **Build Command:**
   ```bash
   npm install && npm run build
   ```
9. **Start Command:**
   ```bash
   npm start
   ```
10. **Plan:** Free

#### Environment Variables pro Backend:

Klikněte "Advanced" → "Add Environment Variable":

```
NODE_ENV=production
DATABASE_URL=[vaše Internal Database URL]
JWT_SECRET=[vygenerujte náhodný string]
FRONTEND_URL=https://[vaše-frontend-url].onrender.com
MAILTRAP_API_TOKEN=[váš Mailtrap token]
EMAIL_FROM=info@nevymyslis.cz
EMAIL_FROM_NAME=Nevymyslíš CRM
```

11. **Health Check Path:** `/api/health`
12. **Auto-Deploy:** Zapnuto
13. Klikněte **"Create Web Service"**

### 3. Vytvoření Frontend Service

1. V Dashboard klikněte **"New +"** → **"Static Site"**
2. Připojte váš Git repozitář
3. **Name:** `nevymyslis-crm-frontend`
4. **Branch:** main
5. **Root Directory:** `frontend`
6. **Build Command:**
   ```bash
   npm install && npm run build
   ```
7. **Publish Directory:** `build`

#### Environment Variables pro Frontend:

```
REACT_APP_API_URL=https://[vaše-backend-url].onrender.com/api
```

8. Klikněte **"Create Static Site"**

---

## 🔄 Jak funguje automatická migrace

### Při každém deploymentu:

1. Render spustí **Build Command:**
   ```bash
   npm install && npm run build
   ```

2. `npm run build` spustí:
   ```bash
   npm run migrate
   ```

3. `npm run migrate` spustí:
   ```bash
   node scripts/runMigrations.js
   ```

4. Migrační skript:
   - Připojí se k databázi
   - Zkontroluje existující struktury
   - Přidá pouze chybějící sloupce/tabulky
   - Neudělá nic pokud už existují (bezpečné)
   - Vypíše výsledek do Build Logů

5. Po úspěšné migraci Render spustí aplikaci

---

## 📝 Build Logy

Kontrola že migrace proběhla:

1. V Dashboard klikněte na váš Backend Service
2. Přejděte na záložku **"Logs"**
3. Najděte poslední Build Log
4. Měli byste vidět:
   ```
   🚀 Spouštění migrací...
   ✅ Sloupec google_drive_link přidán
   ✅ Tabulka client_credentials vytvořena
   🎉 Migrace dokončeny!
   ```

Pokud vidíte:
```
⚠️  Struktury již existují - to je v pořádku
```
To znamená že migrace už proběhly dříve - není třeba panikařit.

---

## 🔧 Debugging

### Problém: Build selhal

**Řešení:**
1. Zkontrolujte Build Logy v Render Dashboard
2. Hledejte červené chyby
3. Běžné problémy:
   - `DATABASE_URL` není správně nastavená
   - Chybí nějaká dependency v package.json
   - Chyba v kódu

### Problém: Migrace selhala ale aplikace běží

**Řešení:**
1. Migrace jsou "non-blocking" - pokud selžou, aplikace běží dál
2. Zkontrolujte Build Logy pro chybovou zprávu
3. Můžete spustit migrace manuálně přes Render Shell:
   - V Dashboard → Backend Service → "Shell" tab
   - Spusťte: `npm run migrate`

### Problém: Aplikace nevidí nové funkce

**Řešení:**
1. Vyčistěte browser cache (Ctrl+Shift+R)
2. Zkontrolujte že frontend se rebuildul
3. Ověřte environment variables

---

## 🚀 Workflow: Push nové verze

### Typický workflow vypadá takto:

```bash
# 1. Lokální vývoj a testování
git add .
git commit -m "feat: Nová funkce XYZ"

# 2. Push na Git
git push origin main

# 3. Render automaticky:
#    - Detekuje změnu
#    - Spustí Build Command (včetně migrací)
#    - Spustí novou verzi
#    - Během 2-5 minut je live

# 4. Zkontrolujte deployment
#    - V Dashboard → Logs
#    - Ověřte že migrace proběhly
#    - Otestujte aplikaci
```

**To je vše!** Žádné SSH, žádné manuální příkazy.

---

## ⚠️ Důležité poznámky

### 1. Free Tier Limitace
- Backend může spát po 15 minutách nečinnosti
- První request po probuzení trvá ~1 minutu
- Databáze je limitována na 1GB

### 2. Bezpečnost
- Nikdy nepushujte `.env` soubory do Gitu
- Používejte Environment Variables v Render Dashboard
- JWT_SECRET by měl být dlouhý a náhodný

### 3. Databázové migrace
- Migrace jsou **idempotentní** (lze spustit vícekrát bez problémů)
- Používají `IF NOT EXISTS` - bezpečné
- Nemazou žádná data
- Pouze přidávají nové struktury

### 4. Rollback
Pokud něco selže:
1. V Dashboard → Deployment → "Redeploy Previous Version"
2. Nebo v Gitu: `git revert HEAD` a push

---

## 🎯 Checklist před prvním deploymentem

- [ ] Všechny soubory jsou commitnuty do Gitu
- [ ] `.env` soubory NEJSOU v Gitu (jsou v .gitignore)
- [ ] `render.yaml` je v root složce projektu
- [ ] `runMigrations.js` je v backend/scripts/
- [ ] `package.json` má `migrate` a `build` scripty
- [ ] Máte Render.com účet
- [ ] Máte Git repozitář (GitHub, GitLab, nebo Bitbucket)
- [ ] Připravili jste Environment Variables

---

## 📊 Co se stane při první deployment

### První deployment (0 → 1):
1. Render vytvoří PostgreSQL databázi
2. Vytvoří backend service
3. **SPUSTÍ MIGRACE** - vytvoří VŠECHNY tabulky včetně nových
4. Spustí backend
5. Vytvoří frontend
6. Build a deploy frontendu

**⏱️ Čas: 5-10 minut**

### Další deploymenty (1 → 2, 2 → 3, ...):
1. Pull nového kódu
2. **SPUSTÍ MIGRACE** - přidá pouze nové struktury
3. Rebuild a restart
4. Live během 2-3 minut

---

## 🔍 Monitoring

### Co sledovat po deploymentu:

1. **Build Logs** - zkontrolovat že migrace proběhly
2. **Runtime Logs** - sledovat chyby v běžící aplikaci
3. **Metrics** - CPU, Memory, Response time
4. **Health Check** - /api/health endpoint

Vše najdete v Render Dashboard.

---

## 💡 Tips & Tricks

### 1. Rychlejší build
Render cachuje `node_modules`, takže další buildy jsou rychlejší.

### 2. Preview Deployments
Můžete zapnout preview deployments pro Pull Requesty - každý PR dostane vlastní URL pro testování.

### 3. Custom Domain
Na free tieru můžete přidat vlastní doménu (např. crm.nevymyslis.cz).

### 4. Scheduled Tasks
Pro CRON joby můžete vytvořit Background Worker service.

---

## ✅ Hotovo!

Nyní máte plně automatizovaný deployment:
- ✅ Push do Gitu
- ✅ Automatické migrace
- ✅ Automatický build
- ✅ Automatický deployment
- ✅ Žádné SSH potřeba

**Užijte si bezstarostný deployment!** 🚀

---

## 📞 Podpora

- **Render Dokumentace:** https://render.com/docs
- **Render Status:** https://status.render.com
- **Render Community:** https://community.render.com

---

**Verze:** 1.0  
**Pro CRM:** 2.0.0  
**Datum:** 23. října 2025
