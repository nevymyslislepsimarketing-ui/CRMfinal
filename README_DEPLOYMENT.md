# 🚀 CRM v3.0.0 - Deployment Instructions

## ⚡ Quick Start (15 minut)

Vaše aplikace už běží na Render + Cloudflare. Pouze potřebujete **update na v3.0.0**.

---

## 📋 Co potřebujete

- ✅ Přístup k Render.com (backend)
- ✅ Přístup k Cloudflare Pages (frontend)
- ✅ Přístup k Git repository
- ✅ 15 minut času

---

## 🎯 Rychlý Deployment (6 kroků)

### KROK 1: Pre-check (30 sekund)

```bash
./deploy-check.sh
```

✅ Zkontroluje že vše je připravené

---

### KROK 2: Git Push (1 minuta)

```bash
git add .
git commit -m "Update to v3.0.0 - Projects, AI, Google Drive, Finance"
git push origin main
```

✅ Render a Cloudflare automaticky začnou deployment

---

### KROK 3: Render Environment (3 minuty)

**Otevřete:** https://dashboard.render.com

**Backend Service → Environment → Add Environment Variable**

**Přidejte 4 proměnné:**

| Key | Value |
|-----|-------|
| `COHERE_API_KEY` | `<see .env.secrets file>` |
| `GOOGLE_CLIENT_ID` | `<see .env.secrets file>` |
| `GOOGLE_CLIENT_SECRET` | `<see .env.secrets file>` |
| `GOOGLE_REDIRECT_URI` | `https://VASE-DOMENA.pages.dev/google-callback` |

⚠️ **Změňte** `VASE-DOMENA` na vaši Cloudflare doménu!

---

### KROK 4: Database Backup + Migrace (5 minut)

**A) Backup (DŮLEŽITÉ!):**
- Render → Database → Backups → **Create Backup**

**B) Získat DATABASE_URL:**
- Render → Database → Connect → **Internal Database URL**

**C) Spustit migraci:**

**Lokálně:**
```bash
export DATABASE_URL="postgresql://..."
./update-render-db.sh
```

**NEBO v Render Shell:**
```bash
cd backend
npm run migrate:v3
npm run seed:pricing
```

---

### KROK 5: Google Cloud Console (2 minuty)

**Otevřete:** https://console.cloud.google.com

**APIs & Services → Credentials → OAuth 2.0 Client ID**

**Authorized redirect URIs → Add URI:**
```
https://vase-domena.pages.dev/google-callback
```

**Save**

---

### KROK 6: Ověření (2 minuty)

**Backend:**
```bash
curl https://vase-backend.onrender.com/api/health
```

Mělo by vrátit: `{"status":"ok","version":"3.0.0"}`

**Frontend:**
- Otevřete aplikaci
- Přihlaste se
- Zkontrolujte nové záložky: Projekty, AI Popisky, Google Drive

---

## ✅ Hotovo!

### Co jste přidali:
- ✅ Řízení projektů
- ✅ AI Caption Generator
- ✅ Google Drive integrace
- ✅ Naceňování služeb
- ✅ Nové statusy úkolů
- ✅ Automatické notifikace
- ✅ Automatické faktury
- ✅ Finance management

### Zero downtime:
- ✅ Stará verze běžela během updatu
- ✅ Nová verze je aktivní
- ✅ Všechna data zachována

---

## 📚 Kompletní dokumentace

**START HERE:**
- 📖 `READY_TO_DEPLOY.md` - Finální checklist
- 📖 `PRODUCTION_UPDATE_GUIDE.md` - Detailní postup
- 📖 `QUICK_COMMANDS.md` - Všechny příkazy

**Reference:**
- 📖 `API_KEYS_REFERENCE.md` - API klíče
- 📖 `DEPLOYMENT_GUIDE.md` - Deployment
- 📖 `FINAL_SUMMARY_V3.md` - Kompletní přehled

**Features:**
- 📖 `AI_CAPTIONS_SETUP.md` - AI generátor
- 📖 `GOOGLE_DRIVE_SETUP.md` - Google Drive
- 📖 `UX_IMPROVEMENTS.md` - UX návrhy

---

## 🔧 Deployment Skripty

Všechny připravené k použití:

```bash
./deploy-check.sh          # Pre-deployment kontrola
./update-render-db.sh      # Database migrace
./update-render-env.sh     # Env vars reference
./setup-google-drive.sh    # Google Drive local setup
```

---

## 🆘 Pokud něco selže

### Rollback:
- **Render:** Dashboard → Service → Events → Rollback
- **Cloudflare:** Dashboard → Deployments → Rollback
- **Database:** Dashboard → Backups → Restore

### Dokumentace:
- Vše je v `.md` souborech v root složce
- Každý soubor má troubleshooting sekci

### Logs:
- Render Dashboard → Logs (real-time)
- Cloudflare Dashboard → Functions
- Browser Console (F12)

---

## 📊 Co očekávat

### Časy:
- Backend build: ~2-3 min
- Frontend build: ~1-2 min
- Database migration: ~1 min
- **Downtime: 0 sekund** ✅

### Po deployi:
- ✅ v3.0.0 aktivní
- ✅ Všechny funkce dostupné
- ✅ CRON joby běží (8:00, 9:00)
- ✅ Monitoring aktivní

---

## 🎉 Gratulujeme!

**CRM v3.0.0 je v produkci!**

Máte nyní:
- 8 nových hlavních funkcí
- 44 nových API endpoints
- 9 nových databázových tabulek
- 4 nové frontend stránky
- Automatizované procesy
- AI generování textů
- Cloud storage integrace

**Ready to use! 🚀**

---

**Verze:** 3.0.0  
**Status:** ✅ PRODUCTION  
**Downtime:** 0 sekund  
**Breaking changes:** None  
**Rollback:** Kdykoliv možné
