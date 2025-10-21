# 🚀 Produkční Nasazení - Nevymyslíš CRM

## ✅ PRE-DEPLOYMENT CHECKLIST

### **Před nahráním na Git:**
- [x] `.gitignore` správně nastavený
- [x] `.env` není v Gitu (je v .gitignore)
- [x] `.env.example` BEZ skutečných hesel
- [x] Všechny security credentials odstraněny z kódu
- [ ] README.md vytvořen
- [ ] Dokumentace aktuální

### **Backend připravenost:**
- [x] Nodemailer nainstalován
- [x] Email service implementován
- [x] SMTP konfigurace v .env.example
- [x] Automatic invoice numbering
- [x] Password reset funkční
- [x] Force password change implementováno

### **Frontend připravenost:**
- [x] Login bez demo údajů
- [x] Registrace odstraněna
- [x] Forgot password implementováno
- [x] Change password implementováno
- [x] Reset password implementováno

---

## 🔐 BEZPEČNOSTNÍ NASTAVENÍ PRO PRODUKCI

### **1. Environment Variables (.env)**

**NIKDY nesdílejte tyto hodnoty veřejně!**

```env
# Backend
PORT=5001
DATABASE_URL=postgresql://PROD_USER:PROD_PASSWORD@PROD_HOST:5432/nevymyslis_crm
JWT_SECRET=VYGENERUJTE_SILNY_SECRET_64_ZNAKU
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://crm.nevymyslis.cz

# SMTP
SMTP_HOST=smtp.zoho.eu
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@nevymyslis.cz
SMTP_PASS=VAS_APP_PASSWORD
EMAIL_FROM_NAME=Nevymyslíš CRM
```

### **2. Generování JWT_SECRET**

```bash
# Vygenerujte silný secret:
openssl rand -base64 64

# Nebo v Node.js:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

---

## 🗄️ DATABÁZE - PRODUKČNÍ SETUP

### **Krok 1: Vytvoření databáze**

```bash
# Na produkčním serveru:
psql -U postgres

CREATE DATABASE nevymyslis_crm;
CREATE USER crm_user WITH PASSWORD 'silne_heslo_zde';
GRANT ALL PRIVILEGES ON DATABASE nevymyslis_crm TO crm_user;
\q
```

### **Krok 2: Inicializace schématu**

```bash
cd backend
npm run init-db
```

**⚠️ Poznamenejte si admin heslo z výstupu!**

```
✅ Admin uživatel vytvořen
📧 Email: info@nevymyslis.cz
🔑 Heslo: Nevymyslis2025!
```

---

## 📧 EMAIL - PRODUKČNÍ KONFIGURACE

### **Zoho Mail - App Password**

1. https://mail.zoho.eu → Settings
2. Security → Application-Specific Passwords
3. Generate New Password: `CRM Production`
4. Zkopírujte heslo do .env

### **DNS záznamy (důležité pro inbox, ne spam!)**

#### **SPF záznam:**
```
Type: TXT
Name: @
Value: v=spf1 include:zoho.eu ~all
```

#### **DKIM záznam:**
```
Zoho Mail → Settings → Email Authentication → DKIM
Zkopírujte TXT záznam do DNS
```

#### **DMARC záznam:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:info@nevymyslis.cz
```

---

## 🌐 DEPLOYMENT STRATEGIE

### **Doporučené platformy:**

#### **Backend:**
- **Railway.app** (nejjednodušší)
- **Render.com** (free tier)
- **DigitalOcean App Platform**
- **Heroku**
- **VPS (DigitalOcean Droplet)**

#### **Frontend:**
- **Vercel** (doporučeno)
- **Netlify**
- **Cloudflare Pages**

#### **Databáze:**
- **Railway PostgreSQL**
- **Render PostgreSQL**
- **Supabase**
- **DigitalOcean Managed Database**

---

## 🚀 DEPLOYMENT - RAILWAY (Doporučeno)

### **Backend + Database:**

1. **Vytvořte účet:** https://railway.app
2. **New Project** → Deploy from GitHub
3. **Connect Repository**
4. **Add PostgreSQL Database:**
   - New → Database → PostgreSQL
   - Zkopírujte DATABASE_URL
5. **Add Environment Variables:**
   - Settings → Variables
   - Přidejte všechny z .env (včetně DATABASE_URL)
6. **Deploy:**
   - Railway automaticky detekuje Node.js
   - Nastaví start command: `npm start`
7. **Získejte URL:**
   - Settings → Generate Domain
   - Např: `nevymyslis-crm.up.railway.app`

### **Frontend - Vercel:**

1. **Vytvořte účet:** https://vercel.com
2. **Import Git Repository**
3. **Framework:** Vite
4. **Environment Variables:**
   ```
   VITE_API_URL=https://nevymyslis-crm.up.railway.app
   ```
5. **Deploy**
6. **Custom Domain:**
   - Settings → Domains
   - Přidejte: `crm.nevymyslis.cz`

---

## 🔧 POST-DEPLOYMENT

### **1. První přihlášení:**
```
URL: https://crm.nevymyslis.cz/login
Email: info@nevymyslis.cz
Heslo: Nevymyslis2025!
→ Změňte heslo!
```

### **2. Nastavení:**
- Nastavení → Fakturační údaje
- Vyplňte IČO, DIČ, adresu, atd.

### **3. Vytvoření uživatelů:**
- Admin panel → Správa uživatelů
- Vytvořte zaměstnance
- Přihlašovací údaje odešlou emailem

### **4. Test emailů:**
- Zkuste "Zapomněli jste heslo?"
- Vytvořte testovacího uživatele
- Zkontrolujte, že emaily chodí do INBOXu (ne SPAMu)

---

## 📊 MONITORING

### **Backend health check:**
```
GET https://nevymyslis-crm.up.railway.app/
→ Should return API info
```

### **Database backups:**
```
# Railway: Automatické denní backups
# Render: Backups v dashboardu
# Manual: pg_dump
```

### **Logy:**
```
# Railway: Dashboard → Logs
# Render: Dashboard → Logs
```

---

## 🔒 BEZPEČNOST

### **1. HTTPS:**
- ✅ Railway/Vercel automaticky poskytují SSL
- ✅ Vynuťte HTTPS v produkci

### **2. CORS:**
Backend má CORS nastavený, ale ověřte v `server.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://crm.nevymyslis.cz',
  credentials: true
}));
```

### **3. Rate limiting:**
Doporučeno přidat:
```bash
npm install express-rate-limit
```

### **4. JWT_SECRET:**
- Minimálně 32 znaků
- Náhodný string
- NIKDY nesdílet

---

## 📋 PRODUCTION CHECKLIST

### **Před spuštěním:**
- [ ] DATABASE_URL nastavena (produkční)
- [ ] JWT_SECRET vygenerován (silný)
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL nastavena (https://)
- [ ] SMTP credentials nastaveny
- [ ] DNS záznamy nakonfigurovány (SPF, DKIM, DMARC)
- [ ] SSL certifikát aktivní
- [ ] Admin heslo změněno
- [ ] Fakturační údaje vyplněny
- [ ] Test emailů proveden
- [ ] Backups nakonfigurovány

### **Monitoring:**
- [ ] Error tracking (Sentry?)
- [ ] Uptime monitoring
- [ ] Database backups enabled
- [ ] Log retention nastaveno

---

## 🆘 TROUBLESHOOTING

### **Emaily jdou do spamu:**
→ Zkontrolujte DNS záznamy (SPF, DKIM, DMARC)

### **Database connection error:**
→ Ověřte DATABASE_URL v .env

### **JWT Invalid:**
→ Ujistěte se, že JWT_SECRET je stejný na všech instancích

### **CORS Error:**
→ Nastavte správný FRONTEND_URL v backendu

---

## 📞 KONTAKT

**Pro support:**
- Email: info@nevymyslis.cz
- Dokumentace: GitHub repository

---

## 🎉 HOTOVO!

Váš CRM systém je připraven k produkčnímu nasazení!

**Poslední kroky:**
1. Commitněte změny
2. Pushněte na GitHub
3. Nasaďte na Railway/Vercel
4. Nastavte environment variables
5. Spusťte init-db
6. Přihlaste se a změňte admin heslo

**Good luck! 🚀**
