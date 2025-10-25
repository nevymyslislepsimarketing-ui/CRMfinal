# 🚀 Deployment Guide - Production Ready

## ✅ Pre-deployment Checklist

### Kód:
- [x] Všechny routes jsou v server.js
- [x] Žádné duplicity
- [x] Package.json aktuální
- [x] .env.example obsahuje všechny proměnné
- [x] .gitignore obsahuje .env

### Databáze:
- [x] Migrace skripty připraveny
- [x] Seed skripty připraveny
- [x] Rollback možnost

### API klíče:
- [x] Cohere API nastaven
- [x] Google Drive credentials nastaveny
- [x] Bezpečně v .env (ne v kódu)

---

## 🌐 Deployment Architektura

```
┌─────────────────┐
│  Cloudflare     │
│  Pages          │  ← Frontend
│  (Frontend)     │
└────────┬────────┘
         │
         │ API calls
         ↓
┌─────────────────┐
│  Render.com     │
│  Web Service    │  ← Backend
│  (Backend)      │
└────────┬────────┘
         │
         │
         ↓
┌─────────────────┐
│  Render.com     │
│  PostgreSQL     │  ← Database
│  (Database)     │
└─────────────────┘
```

---

## 📦 Co je kde

### Backend (Render.com):
- **Repository:** Váš Git repo
- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && npm start`
- **Environment:** Node.js
- **Port:** 5001 (automaticky detekován)

### Frontend (Cloudflare Pages):
- **Repository:** Váš Git repo
- **Build Command:** `cd frontend && npm install && npm run build`
- **Build Output:** `frontend/dist`
- **Framework:** Vite (React)

### Database (Render.com):
- **Type:** PostgreSQL
- **Version:** 15
- **Backup:** Automatické každý den

---

## 🔧 Automatické deployment skripty

Všechny skripty jsou připraveny v root složce:
- `deploy-check.sh` - Pre-deployment kontrola
- `render-migration.sh` - Migrace na Render
- `setup-render.sh` - Render environment setup
- `cloudflare-setup.sh` - Cloudflare setup

---

## 🚀 Deployment postup (10 minut)

### KROK 1: Pre-deployment check (2 min)

```bash
./deploy-check.sh
```

**Co to zkontroluje:**
- ✅ Git status (uncommitted changes)
- ✅ Package.json dependencies
- ✅ Build test
- ✅ Environment variables
- ✅ Migrations

### KROK 2: Push do Gitu (1 min)

```bash
git add .
git commit -m "CRM v3.0.0 - Complete implementation"
git push origin main
```

### KROK 3: Render.com setup (5 min)

**3.1 Database (pokud ještě nemáte):**
1. Dashboard → New → PostgreSQL
2. Name: `nevymyslis-crm-db`
3. Plan: Free (nebo vyšší)
4. Create Database
5. Zkopírujte **Internal Database URL**

**3.2 Backend Web Service:**
1. Dashboard → New → Web Service
2. Connect repository
3. Použijte automatický setup:

```bash
./setup-render.sh
```

Nebo manuálně:
- **Name:** `nevymyslis-crm-backend`
- **Environment:** Node
- **Branch:** main
- **Root Directory:** Leave blank
- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && npm start`
- **Plan:** Free (nebo vyšší)

**3.3 Environment Variables (viz níže)**

**3.4 Migrace databáze:**
```bash
# V Render Shell nebo lokálně s produkční DATABASE_URL
./render-migration.sh
```

### KROK 4: Cloudflare Pages setup (2 min)

```bash
./cloudflare-setup.sh
```

Nebo manuálně:
1. Dashboard → Pages → Create a project
2. Connect Git
3. Build settings:
   - **Framework:** Vite
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Build output:** `frontend/dist`
4. Environment variables:
   - `REACT_APP_API_URL` = URL vašeho backendu na Render

---

## 🔑 Environment Variables pro Render

### Automatický setup:

Spusťte tento příkaz s vaší DATABASE_URL z Render:

```bash
./configure-render-env.sh <YOUR_DATABASE_URL>
```

### Nebo manuálně v Render Dashboard:

**Backend → Environment:**

```
NODE_ENV=production
PORT=5001
DATABASE_URL=<Internal Database URL z Render>
JWT_SECRET=<vygenerujte nový silný klíč pro produkci>
FRONTEND_URL=https://vase-cloudflare-domena.pages.dev
MAILTRAP_API_TOKEN=<váš token>
EMAIL_FROM=info@nevymyslis.cz
EMAIL_FROM_NAME=Nevymyslíš CRM
COHERE_API_KEY=<see_.env.secrets>
GOOGLE_CLIENT_ID=<see_.env.secrets>
GOOGLE_CLIENT_SECRET=<see_.env.secrets>
GOOGLE_REDIRECT_URI=https://vase-cloudflare-domena.pages.dev/google-callback
```

⚠️ **DŮLEŽITÉ změny pro produkci:**
1. `JWT_SECRET` - Vygenerujte NOVÝ silný klíč!
2. `FRONTEND_URL` - Vaše Cloudflare doména
3. `GOOGLE_REDIRECT_URI` - Vaše Cloudflare doména + /google-callback

---

## 🔑 Environment Variables pro Cloudflare

**Cloudflare Pages → Settings → Environment variables:**

```
REACT_APP_API_URL=https://vase-render-backend.onrender.com/api
```

---

## 🗄️ Migrace databáze na produkci

### Automaticky (DOPORUČENO):

```bash
# Z lokálního počítače s produkční DATABASE_URL
export DATABASE_URL="<vaše produkční DATABASE_URL>"
./render-migration.sh
```

### Nebo v Render Shell:

1. Render Dashboard → Backend Service → Shell
2. Spusťte:

```bash
cd backend
npm run migrate:v3
npm run seed:pricing
```

---

## ✅ Post-deployment checklist

### Backend test:
- [ ] Health check: `https://vase-backend.onrender.com/api/health`
- [ ] Mělo by vrátit: `{"status":"ok","version":"3.0.0"}`
- [ ] Logs bez chyb

### Frontend test:
- [ ] Cloudflare URL otevřena
- [ ] Login funguje
- [ ] API calls fungují
- [ ] Všechny stránky se načítají

### Funkční test:
- [ ] Vytvořit projekt
- [ ] Vygenerovat AI text
- [ ] Vytvořit nabídku
- [ ] Připojit Google Drive
- [ ] Test CRON jobů (další den v 8:00/9:00)

---

## 🔄 Automatické deployment

### Render:
- ✅ Auto-deploy při push do `main` branch
- ✅ Build logs dostupné v Dashboard
- ✅ Auto-restart při změně

### Cloudflare:
- ✅ Auto-deploy při push do `main` branch
- ✅ Preview na každý PR
- ✅ Instant rollback možnost

---

## 🐛 Troubleshooting

### Backend ne healthy:
1. Zkontrolujte Render logs
2. Ověřte DATABASE_URL
3. Zkontrolujte že migrace proběhla
4. Test: `curl https://vase-backend.onrender.com/api/health`

### Frontend chyby:
1. Zkontrolujte build logs v Cloudflare
2. Ověřte REACT_APP_API_URL
3. Test CORS (backend má správné origin?)

### Database connection failed:
1. Zkontrolujte DATABASE_URL v Render
2. Použijte **Internal** Database URL (ne External)
3. Test connection v Render Shell: `psql $DATABASE_URL -c "\l"`

### CRON joby neběží:
- NODE_ENV=production automaticky spustí CRON
- Zkontrolujte logs ráno po 8:00 a 9:00
- Měli byste vidět: "✅ CRON joby spuštěny"

---

## 📊 Monitoring

### Render:
- **Logs:** Real-time v Dashboard
- **Metrics:** CPU, Memory, Response time
- **Alerts:** Email při downtime

### Cloudflare:
- **Analytics:** Traffic, Requests, Bandwidth
- **Speed:** Core Web Vitals
- **Errors:** JavaScript errors tracking

---

## 🔄 Rollback

### Render:
1. Dashboard → Service → Events
2. Najděte working deployment
3. "Rollback to this version"

### Cloudflare:
1. Dashboard → Deployments
2. Najděte working deployment
3. "Rollback to this deployment"

---

## 🎯 Production URL

Po deployment budete mít:

**Frontend:**
```
https://nevymyslis-crm.pages.dev
```

**Backend API:**
```
https://nevymyslis-crm-backend.onrender.com/api
```

**Health check:**
```
https://nevymyslis-crm-backend.onrender.com/api/health
```

---

## 📝 Post-deployment úkoly

1. **Aktualizovat Google Cloud Console:**
   - Přidat produkční redirect URI
   - `https://vase-domena.pages.dev/google-callback`

2. **Test všech funkcí:**
   - Login/Registration
   - Všechny CRUD operace
   - AI Caption Generator
   - Google Drive
   - Email notifikace (další den)

3. **Backup:**
   - Nastavit automatic backups v Render
   - Export dat po prvním týdnu

4. **Monitoring:**
   - Nastavit UptimeRobot (zdarma)
   - Email alerts při downtime

---

## 🎉 Ready to deploy!

Všechny skripty jsou připraveny. Spusťte je v tomto pořadí:

```bash
# 1. Pre-deployment check
./deploy-check.sh

# 2. Git push
git add .
git commit -m "CRM v3.0.0 - Production ready"
git push origin main

# 3. Render už automaticky začne deployment
# 4. Cloudflare už automaticky začne deployment

# 5. Po deployi - Migrace na Render
./render-migration.sh

# 6. Test
curl https://vase-backend.onrender.com/api/health
```

**Hotovo!** 🚀
