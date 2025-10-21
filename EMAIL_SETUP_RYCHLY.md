# 📧 Rychlý setup - Email odesílání

## 🚀 3 KROKY K FUNKČNÍM EMAILŮM

### **Krok 1: Instalace (30 sekund)**

```bash
cd backend
npm install
```

✅ Nodemailer se nainstaluje automaticky (již v package.json)

---

### **Krok 2: Zoho Mail - App Password (2 minuty)**

1. **Přihlaste se:** https://mail.zoho.eu
2. **Klikněte na:** ⚙️ Settings (pravý horní roh)
3. **Security** → **Application-Specific Passwords**
4. **Generate New Password**
   - Název: `CRM Backend`
   - Klikněte **Generate**
5. **Zkopírujte heslo** (zobrazí se pouze jednou!)

---

### **Krok 3: Konfigurace .env (1 minuta)**

Otevřete `/backend/.env` a přidejte:

```env
# Frontend URL
FRONTEND_URL=http://localhost:5173

# SMTP - Zoho Mail
SMTP_HOST=smtp.zoho.eu
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@nevymyslis.cz
SMTP_PASS=zde_vložte_app_password_z_kroku_2

# Odesílatel
EMAIL_FROM_NAME=Nevymyslíš CRM
```

**⚠️ DŮLEŽITÉ:**
- Použijte **App-Specific Password** z kroku 2
- NE běžné heslo k emailu!

---

## ✅ OVĚŘENÍ

Spusťte backend:

```bash
npm start
```

**Měli byste vidět:**
```
✅ SMTP server je připraven k odesílání emailů
```

**Pokud vidíte chybu:**
```
❌ SMTP připojení selhalo: Invalid login
```
→ Zkontrolujte `SMTP_PASS` v .env

---

## 🧪 TEST

### **1. Test reset hesla:**

```
http://localhost:5173/login
→ "Zapomněli jste heslo?"
→ Zadejte: info@nevymyslis.cz
→ Odeslat
```

**Zkontrolujte email** `info@nevymyslis.cz` - měl by dorazit za pár sekund!

---

### **2. Test nového uživatele:**

```
Admin panel → Vytvořit uživatele
→ Email: test@example.com
→ Heslo: Test123
→ Vytvořit
```

**Zkontrolujte email** `test@example.com` - uvítací email!

---

## 🎉 HOTOVO!

Pokud oba testy prošly → **Emaily fungují!** 📧✨

---

## 📋 Pro produkci

Změňte v .env:

```env
FRONTEND_URL=https://vase-domena.cz
NODE_ENV=production
```

**To je vše!** 🚀
