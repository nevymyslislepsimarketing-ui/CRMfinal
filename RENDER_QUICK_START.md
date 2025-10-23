# ⚡ Rychlý Start - Render.com Deployment

## 🎯 TL;DR - Velmi rychlý návod

```bash
# 1. Commitněte všechno
git add .
git commit -m "feat: Automatická migrace pro Render"
git push origin main

# 2. Jděte na Render.com Dashboard
# 3. New + → Blueprint
# 4. Vyberte váš repozitář
# 5. Apply
# 6. Hotovo! ✅
```

---

## 📦 Co bylo přidáno

### Nové soubory:
- ✅ `backend/scripts/runMigrations.js` - Automatická migrace
- ✅ `render.yaml` - Konfigurace pro Render
- ✅ `RENDER_DEPLOYMENT.md` - Detailní návod

### Upravené soubory:
- ✅ `backend/package.json` - Přidány migration skripty

---

## 🚀 Postup deploymenta

### Krok 1: Push do Gitu (✓ UDĚLALI JSTE)

```bash
git add .
git commit -F COMMIT_MESSAGE.txt
git push origin main
```

### Krok 2: Render Dashboard (~ 5 minut)

1. Otevřete: https://dashboard.render.com
2. **New +** → **Blueprint**
3. Vyberte váš **GitHub/GitLab repozitář**
4. Render najde `render.yaml`
5. Klikněte **"Apply"**
6. Počkejte 5-10 minut na první build

### Krok 3: Nastavit Environment Variables (~ 2 minuty)

Po vytvoření služeb, v každé službě nastavte:

**Backend (nevymyslis-crm-backend):**
```
MAILTRAP_API_TOKEN = [váš token]
EMAIL_FROM = info@nevymyslis.cz
FRONTEND_URL = https://[vaše-frontend-url].onrender.com
```

**Frontend (nevymyslis-crm-frontend):**
```
REACT_APP_API_URL = https://[vaše-backend-url].onrender.com/api
```

### Krok 4: Hotovo! ✅

Aplikace je live na:
- Backend: `https://nevymyslis-crm-backend.onrender.com`
- Frontend: `https://nevymyslis-crm-frontend.onrender.com`

---

## 🔍 Jak ověřit že migrace proběhly

### V Render Dashboard:

1. Klikněte na **Backend Service**
2. Záložka **"Logs"**
3. Hledejte:
   ```
   🚀 Spouštění migrací...
   ✅ Sloupec google_drive_link přidán
   ✅ Tabulka client_credentials vytvořena
   🎉 Migrace dokončeny!
   ```

### Testování aplikace:

1. Otevřete frontend URL
2. Přihlaste se
3. Otestujte nové funkce:
   - Detail klienta (ikona oka)
   - Filtr úkolů podle uživatele
   - Kalendář s týdenním zobrazením

---

## 🔄 Další deploymenty (automatické)

Od teď při každém `git push`:
1. ✅ Render automaticky detekuje změnu
2. ✅ Spustí migrace (pokud jsou nové)
3. ✅ Rebuilgduje aplikaci
4. ✅ Deploy během 2-3 minut
5. ✅ **Žádná akce z vaší strany!**

---

## 💰 Free Tier Info

**Co máte zdarma:**
- ✅ 750 hodin běhu měsíčně (stačí pro 1 backend)
- ✅ PostgreSQL 1GB storage
- ✅ Neomezené static sites (frontend)
- ✅ SSL certifikáty
- ✅ Automatické deployy

**Limitace:**
- ⏰ Backend spí po 15 minutách nečinnosti
- ⚡ První request po probuzení: ~30-60s
- 💾 Databáze max 1GB

---

## 🐛 Řešení problémů

### Build selhal?

```bash
# 1. Zkontrolujte Logs v Render Dashboard
# 2. Najděte červenou chybovou hlášku
# 3. Běžné problémy:

# DATABASE_URL chybí nebo je špatně
→ Zkontrolujte Environment Variables

# node_modules chyba
→ V Dashboard: Manual Deploy → Clear build cache & deploy

# Migrace selhala
→ Není problém, aplikace běží dál
→ Zkontrolujte co říká error message
```

### Frontend nevidí backend?

```bash
# Zkontrolujte REACT_APP_API_URL
# MUSÍ končit na /api (bez lomítka na konci)
Správně: https://backend.onrender.com/api
Špatně:  https://backend.onrender.com/api/
```

### Aplikace nefunguje po deploymentu?

```bash
# 1. Počkejte 2-3 minuty (první start trvá déle)
# 2. Zkontrolujte Runtime Logs
# 3. Zkontrolujte že migrace proběhly v Build Logs
# 4. Vyčistěte browser cache (Ctrl+Shift+R)
```

---

## 📱 Custom Domain (volitelné)

### Přidat vlastní doménu:

1. V Render Dashboard → Frontend Service
2. **Settings** → **Custom Domains**
3. Přidat: `crm.nevymyslis.cz`
4. V DNS nastavit CNAME záznam:
   ```
   crm.nevymyslis.cz → nevymyslis-crm-frontend.onrender.com
   ```
5. Počkat na propagaci DNS (až 24h)

**Backend také:**
1. Backend Service → Custom Domains
2. Přidat: `api.nevymyslis.cz`
3. CNAME: `api.nevymyslis.cz → nevymyslis-crm-backend.onrender.com`

---

## ✅ Checklist

Před tím než pushněte, zkontrolujte:

- [ ] Všechny nové soubory jsou v Gitu
- [ ] `.env` soubory NEJSOU v Gitu
- [ ] `render.yaml` je v root složce
- [ ] Máte Render.com účet
- [ ] Váš repozitář je na GitHubu/GitLabu
- [ ] Máte připravené environment variables (Mailtrap token atd.)

---

## 🎉 První deployment

### Co se stane:

1. **Render vytvoří PostgreSQL databázi** (2 min)
   - Nová prázdná databáze
   - Internal connection string

2. **Backend Service** (3-5 min)
   - `npm install` - instalace dependencies
   - `npm run build` - **SPUSTÍ MIGRACE**
   - Vytvoří VŠECHNY tabulky (users, clients, tasks, invoices...)
   - Přidá nové sloupce a tabulky (google_drive_link, client_credentials)
   - `npm start` - spuštění serveru

3. **Frontend Service** (2-3 min)
   - `npm install`
   - `npm run build` - React build
   - Deploy static files

4. **Hotovo!** (celkem 7-13 min)

### Po prvním deploymentu:

✅ Databáze má všechny tabulky  
✅ Backend běží s migrovanou DB  
✅ Frontend je nasazen  
✅ Všechno je propojené  
✅ SSL certifikáty jsou aktivní  

**Můžete začít používat!**

---

## 🔐 Důležité bezpečnostní tipy

1. **JWT_SECRET** - použijte dlouhý náhodný string:
   ```bash
   # Generovat:
   openssl rand -base64 32
   ```

2. **Mailtrap API Token** - přidat jako Environment Variable, ne do kódu

3. **Database URL** - nikdy ne v Gitu, pouze v Render Dashboard

4. **CORS** - frontend URL musí být v allowed origins

---

## 💡 Pro tip

### Nastavte Slack/Email notifikace

V Render Dashboard:
1. **Account Settings** → **Notifications**
2. Přidejte email nebo Slack webhook
3. Dostávejte notifikace o každém deploymentu

---

## 📚 Další čtení

- **Detailní návod:** `RENDER_DEPLOYMENT.md`
- **Migrace na produkci:** `PRODUCTION_MIGRATION_GUIDE.md`
- **Všechny funkce:** `IMPLEMENTED_FEATURES.md`
- **Rychlý start:** `QUICK_START.md`

---

## 🆘 Pomoc

Pokud něco nejde:

1. **Render Docs:** https://render.com/docs
2. **Render Status:** https://status.render.com (výpadky?)
3. **Community:** https://community.render.com

---

**Hodně štěstí s deploymentem! 🚀**

Během 10 minut budete mít CRM v2.0.0 live na produkci!
