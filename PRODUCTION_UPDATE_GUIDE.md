# 🔄 Production Update Guide - v3.0.0

## ✅ Aktualizace existující aplikace na v3.0.0

**Čas: ~15 minut**

---

## 🎯 Přehled změn

### Co se přidává:
- ✨ Řízení projektů
- ✨ Nové statusy úkolů  
- ✨ Naceňování služeb
- ✨ AI Caption Generator (Cohere)
- ✨ Google Drive integrace
- ✨ Automatické notifikace (CRON)
- ✨ Automatické faktury (CRON)
- ✨ Finance management

### Co se mění:
- ➕ 9 nových databázových tabulek
- ➕ 44 nových API endpoints
- ➕ 4 nové frontend stránky
- 🔄 Tasks.jsx - nové statusy
- ➕ 2 CRON joby
- ➕ 3 nové email šablony

### Co zůstává:
- ✅ Všechny stávající funkce
- ✅ Uživatelské účty
- ✅ Existující data
- ✅ API kompatibilita

---

## 🚀 Update Postup (Krok za krokem)

### KROK 1: Pre-deployment check (2 min)

**Spusťte kontrolní script:**

```bash
./deploy-check.sh
```

**Co zkontroluje:**
- ✅ Git status
- ✅ Dependencies
- ✅ Build test
- ✅ Migrační skripty
- ✅ Environment variables

---

### KROK 2: Git Push (1 min)

**Po úspěšné kontrole:**

```bash
git add .
git commit -m "Update to v3.0.0 - Projects, AI, Google Drive"
git push origin main
```

**Co se stane:**
- ✅ Render automaticky detekuje změny
- ✅ Začne nový build (~2-3 min)
- ✅ Cloudflare automaticky buildne frontend (~1-2 min)
- ✅ Zero-downtime deployment

---

### KROK 3: Update Render Environment (5 min)

**Přidat nové API klíče:**

```bash
./update-render-env.sh
```

**Nebo manuálně v Render Dashboard:**

1. Přihlaste se: https://dashboard.render.com
2. Vyberte backend service
3. **Environment** → **Add Environment Variable**

**Přidejte tyto 4 proměnné:**

```
COHERE_API_KEY=<see_.env.secrets>
```

```
GOOGLE_CLIENT_ID=<see_.env.secrets>
```

```
GOOGLE_CLIENT_SECRET=<see_.env.secrets>
```

```
GOOGLE_REDIRECT_URI=https://VASE-CLOUDFLARE-DOMENA.pages.dev/google-callback
```

⚠️ **NAHRAĎTE** `VASE-CLOUDFLARE-DOMENA` vaší skutečnou doménou!

**Po přidání:**
- Render automaticky restartuje (~30s)
- Počkejte až je service "Live"

---

### KROK 4: Database Migration (5 min)

**Důležité: Vytvořte BACKUP nejdřív!**

1. Render Dashboard → Database → **Backups** → **Create Backup**
2. Počkejte ~1 min než se vytvoří

**Pak spusťte migraci:**

**Získejte DATABASE_URL:**
- Render Dashboard → Database → Connect
- Zkopírujte **Internal Database URL**

**Spusťte migraci:**

```bash
export DATABASE_URL="postgresql://..."
./update-render-db.sh
```

**Co to udělá:**
- ✅ Zkontroluje připojení
- ✅ Vytvoří 9 nových tabulek
- ✅ Přidá sloupce do existujících tabulek
- ✅ Naplní ceník (16 služeb)
- ✅ Zachová všechna stávající data

**Alternativa - Render Shell:**

1. Render Dashboard → Backend Service → **Shell**
2. Spusťte:

```bash
cd backend
npm run migrate:v3
npm run seed:pricing
```

---

### KROK 5: Update Google Cloud Console (2 min)

**Přidat produkční redirect URI:**

1. https://console.cloud.google.com
2. **APIs & Services** → **Credentials**
3. Klikněte na OAuth 2.0 Client ID
4. **Authorized redirect URIs** → **Add URI**
5. Přidejte: `https://vase-cloudflare-domena.pages.dev/google-callback`
6. **Save**

---

### KROK 6: Verification (2 min)

**Test Backend:**

```bash
curl https://vase-backend.onrender.com/api/health
```

**Mělo by vrátit:**
```json
{
  "status": "ok",
  "version": "3.0.0",
  "timestamp": "2025-10-25T20:35:00.000Z"
}
```

**Test Frontend:**

1. Otevřete: `https://vase-cloudflare-domena.pages.dev`
2. Přihlaste se
3. Zkontrolujte nové záložky:
   - ✅ Projekty
   - ✅ AI Popisky
   - ✅ Google Drive
   - ✅ Naceňování (manažeři)

**Test funkcí:**

1. **Projekty:** Vytvořte testovací projekt
2. **AI Popisky:** Vygenerujte text
3. **Naceňování:** Vytvořte nabídku
4. **Úkoly:** Zkuste nové statusy
5. **Google Drive:** Připojte se

---

## 🔍 Troubleshooting

### Backend health check selhal:

**Zkontrolujte:**
1. Render logs: Dashboard → Service → Logs
2. DATABASE_URL je správně nastavena
3. Migrace proběhla úspěšně

**Řešení:**
```bash
# Test v Render Shell:
psql $DATABASE_URL -c "\dt"
# Měli byste vidět nové tabulky: projects, service_pricing, atd.
```

### Frontend chyby:

**Zkontrolujte:**
1. Cloudflare build logs
2. Console v prohlížeči (F12)
3. API calls jdou na správnou URL

**Řešení:**
- Verify `REACT_APP_API_URL` v Cloudflare env vars
- Should be: `https://vase-backend.onrender.com/api`

### AI Generator nefunguje:

**Zkontrolujte:**
1. `COHERE_API_KEY` je v Render env vars
2. Backend logs pro Cohere errors
3. Test v prohlížeči console

### Google Drive připojení selže:

**Zkontrolujte:**
1. Všechny 3 Google env vars jsou v Render
2. `GOOGLE_REDIRECT_URI` odpovídá Cloudflare doméně
3. URI je přidána v Google Cloud Console
4. Není tam překlep v doméně

### CRON joby neběží:

**Ověření:**
- Render logs další ráno po 8:00 a 9:00
- Měli byste vidět: "✅ CRON joby spuštěny"
- NODE_ENV=production automaticky spustí CRON

---

## 📊 Co očekávat

### Deployment časy:

- **Backend build:** ~2-3 minuty
- **Frontend build:** ~1-2 minuty
- **Database migration:** ~1 minuta
- **Total downtime:** 0 sekund (zero-downtime deployment)

### Po deployi:

- ✅ Stará verze běží během buildu
- ✅ Nová verze se aktivuje až po úspěšném buildu
- ✅ Automatický health check
- ✅ Rollback možnost kdykoliv

---

## 🔄 Rollback (pokud potřeba)

### Render:

1. Dashboard → Service → Events
2. Najděte předchozí working deployment
3. **"Rollback to this version"**
4. Počkejte ~2 min

### Cloudflare:

1. Dashboard → Deployments
2. Najděte předchozí deployment
3. **"Rollback to this deployment"**
4. Okamžité

### Database Rollback:

1. Dashboard → Database → Backups
2. Vyberte backup před migrací
3. **Restore** (⚠️ smaže nová data!)

---

## ✅ Post-update Checklist

### Okamžitě:
- [ ] Health check OK
- [ ] Login funguje
- [ ] Všechny stránky se načítají
- [ ] API calls fungují
- [ ] Console bez chyb

### Během hodiny:
- [ ] Test všech CRUD operací
- [ ] Vytvořit testovací projekt
- [ ] Vygenerovat AI text
- [ ] Připojit Google Drive
- [ ] Vytvořit nabídku

### Další den:
- [ ] CRON joby běží (8:00, 9:00)
- [ ] Email notifikace fungují
- [ ] Automatické faktury se generují
- [ ] Žádné error logy

---

## 📞 Support

### Render Issues:
- Support: https://render.com/support
- Community: https://community.render.com

### Cloudflare Issues:
- Support: https://dash.cloudflare.com/?to=/:account/support
- Docs: https://developers.cloudflare.com/pages

### CRM Issues:
- Check logs first
- Review documentation
- Test in development

---

## 🎉 Gratuluji!

Po dokončení všech kroků máte:

- ✅ CRM v3.0.0 v produkci
- ✅ Všechny nové funkce aktivní
- ✅ Zero downtime během updatu
- ✅ Backup pro rollback
- ✅ Monitoring funkční

**Vaše aplikace je updated a ready!** 🚀

---

**Verze:** 3.0.0  
**Update type:** Feature release  
**Breaking changes:** None  
**Downtime:** 0 sekund  
**Rollback:** Available
