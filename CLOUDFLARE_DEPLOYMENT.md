# ☁️ Cloudflare Pages + Render Deployment

## 🎯 Vaše setup

- **Frontend:** Cloudflare Pages ⚡ (rychlý, neomezený, globální CDN)
- **Backend + DB:** Render.com 🔧 (free tier s PostgreSQL)

To je **skvělá kombinace!** Cloudflare Pages je rychlejší a stabilnější pro statické soubory.

---

## 🚀 Kompletní deployment (3 části)

### 1️⃣ Backend + Databáze na Render (5-10 min)
### 2️⃣ Frontend na Cloudflare Pages (3-5 min)
### 3️⃣ Propojení a CORS (2 min)

---

## 1️⃣ ČÁST 1: Backend + Databáze (Render)

### Krok 1: Push do Gitu

```bash
git add .
git commit -m "feat: Automatická migrace pro Render + Cloudflare setup"
git push origin main
```

### Krok 2: Render Dashboard

1. Otevřete https://dashboard.render.com
2. **New +** → **Blueprint**
3. Vyberte váš repozitář
4. Render najde `render.yaml` a vytvoří:
   - PostgreSQL databázi
   - Backend service (s automatickými migracemi!)
5. Klikněte **"Apply"**

### Krok 3: Environment Variables v Render

V **Backend Service** nastavte:

```
FRONTEND_URL = https://nevymyslis-crm.pages.dev
CORS_ORIGIN = https://nevymyslis-crm.pages.dev
MAILTRAP_API_TOKEN = váš_token
EMAIL_FROM = info@nevymyslis.cz
```

⚠️ **DŮLEŽITÉ:** Až vytvoříte Cloudflare Pages web, vraťte se sem a aktualizujte URL!

### Krok 4: Poznamenejte si Backend URL

Po dokončení deployu zkopírujte:
```
Backend URL: https://nevymyslis-crm-backend.onrender.com
```

Tuto URL budete potřebovat pro Cloudflare Pages.

---

## 2️⃣ ČÁST 2: Frontend (Cloudflare Pages)

### Krok 1: Cloudflare Dashboard

1. Přihlaste se na https://dash.cloudflare.com
2. **Workers & Pages** → **Create application**
3. **Pages** → **Connect to Git**

### Krok 2: Připojte repozitář

1. Připojte váš **GitHub/GitLab** účet
2. Vyberte repozitář **nevymyslis-crm**
3. Klikněte **Begin setup**

### Krok 3: Build nastavení

**Project name:** `nevymyslis-crm` (nebo vlastní název)

**Production branch:** `main` (nebo `master`)

**Framework preset:** `Create React App`

**Build command:**
```bash
cd frontend && npm install && npm run build
```

**Build output directory:**
```
frontend/build
```

### Krok 4: Environment Variables

Klikněte **"Add variable"** a přidejte:

```
REACT_APP_API_URL = https://nevymyslis-crm-backend.onrender.com/api
```

⚠️ Použijte URL vašeho Render backendu (z Části 1, Krok 4)

### Krok 5: Deploy

1. Klikněte **"Save and Deploy"**
2. ☕ Počkejte 2-5 minut
3. Cloudflare vám dá URL: `https://nevymyslis-crm.pages.dev`

---

## 3️⃣ ČÁST 3: Propojení (CORS)

### Aktualizovat Backend CORS

Vraťte se do **Render Dashboard**:

1. Otevřete **Backend Service**
2. **Environment** → Upravte:
   ```
   FRONTEND_URL = https://nevymyslis-crm.pages.dev
   CORS_ORIGIN = https://nevymyslis-crm.pages.dev
   ```
3. Backend se automaticky restartuje

### Ověřit CORS v kódu

Zkontrolujte že váš `backend/server.js` má CORS správně nastavený:

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

Pokud nemáte, přidejte to a pushněte.

---

## ✅ Hotovo! Testování

### 1. Otevřete frontend

Jděte na: `https://nevymyslis-crm.pages.dev`

### 2. Testujte přihlášení

- Zadejte email a heslo
- Pokud funguje → 🎉 Všechno je správně propojené!

### 3. Testujte nové funkce

- Detail klienta
- Filtr úkolů
- Kalendář s týdenním zobrazením
- Všechny nové funkce z v2.0.0

---

## 🔄 Automatické deploymenty

### Při každém `git push`:

**Render (Backend):**
1. Detekuje změnu v Gitu
2. Spustí migrace databáze
3. Rebuilguje backend
4. Restartuje service
5. Live během 2-3 minut

**Cloudflare Pages (Frontend):**
1. Detekuje změnu v Gitu
2. Rebuilguje React aplikaci
3. Deploy na globální CDN
4. Live během 1-2 minut (rychlejší než Render!)

**Celkem: 3-5 minut od push do live** ⚡

---

## 🌍 Custom Domain (volitelné)

### Pro Frontend (Cloudflare)

1. Cloudflare Dashboard → Váš Pages project
2. **Custom domains** → **Set up a custom domain**
3. Přidejte: `crm.nevymyslis.cz`
4. Cloudflare automaticky nastaví DNS (už máte doménu na Cloudflare)
5. SSL certifikát automatický

### Pro Backend (Render)

1. Render Dashboard → Backend Service
2. **Settings** → **Custom Domains**
3. Přidejte: `api.nevymyslis.cz`
4. V DNS (Cloudflare) přidejte CNAME:
   ```
   api.nevymyslis.cz → nevymyslis-crm-backend.onrender.com
   ```

### Aktualizovat Environment Variables

Po nastavení custom domén:

**Render Backend:**
```
FRONTEND_URL = https://crm.nevymyslis.cz
CORS_ORIGIN = https://crm.nevymyslis.cz
```

**Cloudflare Pages:**
```
REACT_APP_API_URL = https://api.nevymyslis.cz/api
```

---

## 🔧 CORS Troubleshooting

### Chyba: "CORS policy: No 'Access-Control-Allow-Origin'"

**Řešení:**

1. Zkontrolujte `CORS_ORIGIN` v Render Backend
2. Musí být **PŘESNĚ** stejná jako URL frontendu (včetně https://)
3. **BEZ** lomítka na konci:
   - ✅ Správně: `https://nevymyslis-crm.pages.dev`
   - ❌ Špatně: `https://nevymyslis-crm.pages.dev/`

4. Restart Backend po změně

### Ověřit CORS v prohlížeči

Otevřete Console (F12) a zadejte:
```javascript
fetch('https://nevymyslis-crm-backend.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

Pokud funguje → CORS je OK ✅

---

## ⚡ Výhody tohoto setupu

### Cloudflare Pages (Frontend):
- ✅ **Rychlejší** než Render static site
- ✅ **Globální CDN** - rychlé načítání po celém světě
- ✅ **Neomezené** bandwidth
- ✅ **Neomezené** requesty
- ✅ **Nikdy nespí** (na rozdíl od Render free tier)
- ✅ **Automatické SSL**
- ✅ **Preview deployments** pro každý pull request

### Render (Backend):
- ✅ **Automatické migrace** při každém deploy
- ✅ **PostgreSQL** databáze included
- ✅ **Health checks**
- ✅ **Jednoduchý management**

### Nevýhody:
- ⚠️ Backend na Render spí po 15 min nečinnosti (free tier)
- ⚠️ První request po probuzení: ~30-60 sekund

---

## 💰 Ceny

### Cloudflare Pages:
- **Free:** Neomezené bandwidth, 500 builds/měsíc
- **Pro ($20/měsíc):** Více builds, preview branches

### Render:
- **Free:** 750 hodin/měsíc, spí po nečinnosti
- **Hobby ($7/měsíc):** Nikdy nespí, více paměti

---

## 📊 Environment Variables - Kompletní seznam

### Render Backend:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...  # Automaticky z Blueprint
JWT_SECRET=...                  # Automaticky generováno
FRONTEND_URL=https://nevymyslis-crm.pages.dev
CORS_ORIGIN=https://nevymyslis-crm.pages.dev
MAILTRAP_API_TOKEN=your_token
EMAIL_FROM=info@nevymyslis.cz
EMAIL_FROM_NAME=Nevymyslíš CRM
```

### Cloudflare Pages:

```bash
REACT_APP_API_URL=https://nevymyslis-crm-backend.onrender.com/api
```

---

## 🐛 Řešení problémů

### Frontend se nenačte

**Příčiny:**
1. Build selhal → Zkontrolujte Build logs v Cloudflare
2. Špatný build command nebo output directory

**Řešení:**
- Build command: `cd frontend && npm install && npm run build`
- Output directory: `frontend/build`

### Backend nereaguje

**Příčiny:**
1. Backend spí (free tier) → První request trvá dlouho
2. Migrace selhala → Zkontrolujte Build logs

**Řešení:**
- Počkejte 60 sekund na první request
- Upgrade na Hobby plan ($7) aby nikdy nespal

### Login nefunguje

**Příčiny:**
1. CORS není správně nastavený
2. API URL je špatně

**Řešení:**
- Zkontrolujte Console v prohlížeči (F12)
- Ověřte `REACT_APP_API_URL` v Cloudflare
- Ověřte `CORS_ORIGIN` v Render

---

## 📝 Checklist před prvním deploymentem

### Git:
- [ ] Všechny změny commitnuté
- [ ] `.env` soubory NEJSOU v Gitu
- [ ] `render.yaml` je v root složce
- [ ] `runMigrations.js` existuje
- [ ] Push na GitHub/GitLab

### Render:
- [ ] Blueprint vytvořen
- [ ] Backend běží
- [ ] Database vytvořena
- [ ] Environment variables nastavené
- [ ] Backend URL zkopírovaná

### Cloudflare:
- [ ] Pages project vytvořen
- [ ] Build nastavení správné
- [ ] Environment variable (`REACT_APP_API_URL`) nastavená
- [ ] Frontend URL zkopírovaná

### Propojení:
- [ ] `CORS_ORIGIN` v Render aktualizovaný
- [ ] `FRONTEND_URL` v Render aktualizovaný
- [ ] Login funguje
- [ ] Nové funkce fungují

---

## 🎉 Hotovo!

Máte nyní:
- ⚡ **Super rychlý frontend** na Cloudflare CDN
- 🔧 **Spolehlivý backend** s automatickými migracemi na Render
- 🗄️ **PostgreSQL databázi** na Render
- 🚀 **Automatické deploymenty** při každém push
- 🌍 **Globální dostupnost**

**Užijte si CRM v2.0.0!** 🎊

---

## 📚 Související dokumentace

- **Render setup:** `RENDER_DEPLOYMENT.md`
- **Rychlý start:** `RENDER_QUICK_START.md`
- **Všechny funkce:** `IMPLEMENTED_FEATURES.md`
- **Changelog:** `CHANGELOG.md`

---

**Datum:** 23. října 2025  
**Verze:** 2.0.0  
**Setup:** Cloudflare Pages + Render
