# 🔑 API Keys & Credentials - Quick Reference

## ⚠️ BEZPEČNOST NEJDŘÍV!

**Tyto údaje jsou DŮVĚRNÉ! Nikdy je nevkládejte do:**
- ❌ Veřejného Gitu
- ❌ Kódu
- ❌ Dokumentace (která jde do Gitu)
- ✅ POUZE do `.env` souboru

---

## 📋 Všechny potřebné credentials

### 1. Database 🗄️

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/nevymyslis_crm
```

**Pro lokální vývoj:**
- Host: `localhost` nebo `127.0.0.1`
- Port: `5432`
- Database: `nevymyslis_crm`

**Pro Render.com:**
- Automaticky poskytne Render při vytvoření PostgreSQL služby
- Najdete v Dashboard → Database → Internal Database URL

---

### 2. JWT Secret 🔐

```bash
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

**Doporučení:**
- Minimálně 32 znaků
- Kombinace písmen, čísel, symbolů
- Generátor: https://randomkeygen.com/

---

### 3. Cohere AI 🤖

```bash
COHERE_API_KEY=<see_.env.secrets_file>
```

**Status:** ✅ NASTAVEN a FUNKČNÍ

**Použití:**
- AI Caption Generator
- Generování textů pro sociální sítě

**Cena:**
- ~1-2 Kč/měsíc (velmi levné!)
- Free tier: První měsíc zdarma

**Dokumentace:** `AI_CAPTIONS_SETUP.md`

---

### 4. Google Drive 📁

```bash
GOOGLE_CLIENT_ID=<see_.env.secrets_file>
GOOGLE_CLIENT_SECRET=<see_.env.secrets_file>
GOOGLE_REDIRECT_URI=http://localhost:5173/google-callback
```

**Status:** ✅ NASTAVEN a READY

**Použití:**
- Procházení Google Drive
- Upload/download souborů
- Správa složek

**Cena:**
- ZDARMA (Google Drive API free tier)

**Lokální vývoj:**
- Redirect URI: `http://localhost:5173/google-callback`

**Produkce:**
- Redirect URI: `https://vase-domena.com/google-callback`
- ⚠️ Nezapomeňte přidat do Google Cloud Console!

**Dokumentace:** `GOOGLE_DRIVE_SETUP.md`

---

### 5. Email - Mailtrap 📧

```bash
MAILTRAP_API_TOKEN=your_mailtrap_api_token_here
EMAIL_FROM=info@nevymyslis.cz
EMAIL_FROM_NAME=Nevymyslíš CRM
```

**Použití:**
- Email notifikace
- Deadline upozornění
- Automatické faktury

**Jak získat:**
1. Zaregistrujte se na https://mailtrap.io
2. Vytvořte projekt
3. Email Sending → Domain/Sending → API token
4. Zkopírujte token

**Cena:**
- Free tier: 1000 emailů/měsíc
- Postačí pro většinu použití

---

### 6. Frontend URL 🌐

```bash
FRONTEND_URL=http://localhost:5173
```

**Použití:**
- Odkazy v emailech
- Redirect po autentizaci

**Lokální vývoj:**
```bash
FRONTEND_URL=http://localhost:5173
```

**Produkce:**
```bash
FRONTEND_URL=https://vase-domena.com
```

---

### 7. CRON joby ⏰

```bash
ENABLE_CRON=true
```

**Použití:**
- Automatické notifikace (8:00)
- Automatické faktury (9:00)

**Lokální vývoj:**
- Nastavte `true` pokud chcete testovat CRON joby
- Jinak nechte `false`

**Produkce:**
- Automaticky povoleno (NODE_ENV=production)
- Není třeba nastavovat

---

## 🚀 Kompletní .env soubor

**Zkopírujte do `backend/.env`:**

```bash
# Server
PORT=5001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/nevymyslis_crm

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email - Mailtrap API
MAILTRAP_API_TOKEN=your_mailtrap_api_token_here
EMAIL_FROM=info@nevymyslis.cz
EMAIL_FROM_NAME=Nevymyslíš CRM

# AI - Cohere API
COHERE_API_KEY=<see_.env.secrets_file>

# Google Drive API
GOOGLE_CLIENT_ID=<see_.env.secrets_file>
GOOGLE_CLIENT_SECRET=<see_.env.secrets_file>
GOOGLE_REDIRECT_URI=http://localhost:5173/google-callback

# CRON joby (volitelné pro lokální vývoj)
ENABLE_CRON=false
```

---

## ✅ Checklist nastavení

### Povinné (aby aplikace fungovala):
- [x] `DATABASE_URL` - PostgreSQL databáze
- [x] `JWT_SECRET` - Pro autentizaci
- [x] `COHERE_API_KEY` - Pro AI generátor
- [x] `GOOGLE_CLIENT_ID` - Pro Google Drive
- [x] `GOOGLE_CLIENT_SECRET` - Pro Google Drive
- [x] `GOOGLE_REDIRECT_URI` - Pro Google Drive callback

### Doporučené:
- [ ] `MAILTRAP_API_TOKEN` - Pro email notifikace
- [ ] `EMAIL_FROM` - Odesílatel emailů
- [ ] `FRONTEND_URL` - Pro odkazy v emailech

### Volitelné:
- [ ] `ENABLE_CRON` - Pro lokální testování CRON jobů
- [ ] `PORT` - Pokud chcete jiný než 5001

---

## 🔧 Automatický setup

### Rychlé nastavení Google Drive:

```bash
./setup-google-drive.sh
```

Tento script automaticky:
- ✅ Zkontroluje .env
- ✅ Přidá Google Drive credentials
- ✅ Vytvoří backup
- ✅ Zobrazí další kroky

---

## 🧪 Test credentials

### Ověřit že vše funguje:

```bash
cd backend
node -e "
require('dotenv').config();

console.log('🔍 Kontrola credentials...\n');

const checks = {
  'Database URL': process.env.DATABASE_URL,
  'JWT Secret': process.env.JWT_SECRET,
  'Cohere API': process.env.COHERE_API_KEY,
  'Google Client ID': process.env.GOOGLE_CLIENT_ID,
  'Google Client Secret': process.env.GOOGLE_CLIENT_SECRET,
  'Google Redirect URI': process.env.GOOGLE_REDIRECT_URI,
  'Mailtrap Token': process.env.MAILTRAP_API_TOKEN,
  'Frontend URL': process.env.FRONTEND_URL,
};

Object.entries(checks).forEach(([name, value]) => {
  const status = value ? '✅' : '❌';
  console.log(\`\${status} \${name}\`);
});
"
```

---

## 🌐 Produkční nastavení

### Render.com:

1. **Backend service** → **Environment**
2. **Add Environment Variable** (pro každou proměnnou)
3. Zkopírujte z lokálního .env
4. ⚠️ Změňte tyto hodnoty pro produkci:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://vase-domena.com`
   - `GOOGLE_REDIRECT_URI=https://vase-domena.com/google-callback`
   - `DATABASE_URL` - použijte Internal Database URL z Render

---

## 📞 Potřebujete pomoc?

### Dokumentace:
- 📖 `AI_CAPTIONS_SETUP.md` - Cohere AI
- 📖 `GOOGLE_DRIVE_SETUP.md` - Google Drive
- 📖 `GOOGLE_DRIVE_CREDENTIALS.md` - Google credentials
- 📖 `QUICK_START_V3.md` - Celkový setup

### Troubleshooting:
- `QUICK_DEPLOY_V3.md` - Časté problémy
- `FINAL_SUMMARY_V3.md` - Kompletní přehled

---

**Datum vytvoření:** 25. října 2025, 22:30 UTC+2  
**Status:** ✅ VŠECHNY CREDENTIALS NASTAVENY  
**Ready to use:** ✅ ANO

---

## 🎉 Gratuluji!

Máte všechny potřebné API klíče a credentials nastaveny!

**Můžete začít používat:**
- 🤖 AI Caption Generator
- 📁 Google Drive
- 📧 Email notifikace
- ⏰ Automatické CRON joby

**Vše je připraveno!** 🚀
