# 🔐 Reset hesla přes email - Implementováno!

## ✅ CO BYLO ZMĚNĚNO

### 1. **Login stránka - Production Ready**

**Odstraněno:**
- ❌ Demo přístupové údaje
- ❌ Link na registraci

**Přidáno:**
- ✅ Link "Zapomněli jste heslo?"
- ✅ Přesměrování na `/forgot-password`

---

### 2. **Admin email změněn**

**Před:** `admin@nevymyslis.cz`  
**Po:** `info@nevymyslis.cz` ✅

---

### 3. **Reset hesla funkcionalita**

#### **Jak to funguje:**

```
1. Uživatel klikne "Zapomněli jste heslo?"
   ↓
2. Zadá svůj email
   ↓
3. Backend vygeneruje unikátní token (platnost 1 hodina)
   ↓
4. Token uložen do tabulky password_resets
   ↓
5. V DEV: Token vrácen v response
   V PROD: Odeslán email s odkazem
   ↓
6. Uživatel klikne na odkaz s tokenem
   ↓
7. Zadá nové heslo
   ↓
8. Heslo resetováno + force_password_change = FALSE
   ↓
9. Přesměrován na login
```

---

## 🗄️ Databáze

### **Nová tabulka: password_resets**

```sql
CREATE TABLE password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Účel:**
- Ukládá reset tokeny
- Token platí 1 hodinu
- Po použití označen jako `used = TRUE`

---

## 📋 API Endpointy

### **POST /api/auth/forgot-password**

**Request:**
```json
{
  "email": "info@nevymyslis.cz"
}
```

**Response (Development):**
```json
{
  "message": "Odkaz pro reset hesla byl vygenerován.",
  "resetUrl": "http://localhost:5173/reset-password?token=abc123...",
  "email": "info@nevymyslis.cz"
}
```

**Response (Production):**
```json
{
  "message": "Pokud email existuje v systému, byl odeslán odkaz pro reset hesla."
}
```

**Bezpečnost:**
- Vždy vrací stejnou zprávu (i když email neexistuje)
- Zabraňuje zjištění, které emaily jsou registrované

---

### **POST /api/auth/reset-password**

**Request:**
```json
{
  "token": "abc123def456...",
  "newPassword": "NovoSilneHeslo123!"
}
```

**Response:**
```json
{
  "message": "Heslo bylo úspěšně změněno. Nyní se můžete přihlásit."
}
```

**Validace:**
- Token musí být platný (not used, not expired)
- Heslo min 8 znaků
- Po resetu: `force_password_change = FALSE`

---

## 🎨 Frontend komponenty

### **1. ForgotPassword.jsx**
- Stránka pro zadání emailu
- `/forgot-password` route
- Zobrazí reset URL v dev mode
- Success message po odeslání

### **2. ResetPassword.jsx**
- Stránka pro zadání nového hesla
- `/reset-password?token=xxx` route
- Validace hesla
- Potvrzení hesla
- Success screen + přesměrování na login

### **3. Login.jsx**
- Odebrán demo přístup
- Odebrán link na registraci
- Přidán link "Zapomněli jste heslo?"

---

## 🧪 JAK TO TESTOVAT

### **Test 1: Forgot Password**

1. Otevřete `/login`
2. Klikněte "Zapomněli jste heslo?"
3. Zadejte: `info@nevymyslis.cz`
4. Klikněte "Odeslat odkaz pro reset"
5. ✅ Zobrazí se success message
6. ✅ **V DEV** zobrazí se reset URL

**Konzole (backend):**
```
🔑 Žádost o reset hesla: info@nevymyslis.cz
✅ Reset token vytvořen: abc123...
📧 Reset URL: http://localhost:5173/reset-password?token=abc123...
⚠️  V produkci odeslat email na: info@nevymyslis.cz
```

---

### **Test 2: Reset Password**

1. Klikněte na reset URL (z dev response)
2. Nebo přejděte na `/reset-password?token=abc123...`
3. Zadejte nové heslo (min 8 znaků)
4. Potvrďte heslo
5. Klikněte "Resetovat heslo"
6. ✅ Success screen
7. ✅ Přesměrování na login za 3 sekundy

**Zkuste se přihlásit:**
- Email: `info@nevymyslis.cz`
- Heslo: (nové heslo)
- ✅ Přihlášení úspěšné!
- ✅ NEBUDETE muset měnit heslo (force_password_change = FALSE)

---

### **Test 3: Bezpečnostní kontroly**

**Token expirace:**
1. Vygenerujte reset token
2. Počkejte 1 hodinu + 1 minutu
3. Zkuste token použít
4. ❌ Chyba: "Neplatný nebo expirovaný token"

**Token reuse:**
1. Použijte token k resetu hesla
2. Zkuste použít stejný token znovu
3. ❌ Chyba: "Neplatný nebo expirovaný token"

**Neexistující email:**
1. Zadejte neexistující email
2. ✅ Stejná success zpráva (bezpečnost)
3. ✅ Žádný token nevytvořen

---

## 🚀 PRODUKČNÍ NASAZENÍ

### **⚠️ DŮLEŽITÉ - Email konfigurace**

V produkci musíte implementovat odesílání emailů!

**Doporučení: Nodemailer + SMTP**

1. **Instalace:**
```bash
npm install nodemailer
```

2. **Konfigurace (.env):**
```env
SMTP_HOST=smtp.zoho.eu
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@nevymyslis.cz
SMTP_PASS=vase_heslo
```

3. **Úprava /backend/routes/auth.js:**

V endpointu `/forgot-password` přidejte:

```javascript
const nodemailer = require('nodemailer');

// Vytvořit transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Odeslat email
const mailOptions = {
  from: '"Nevymyslíš CRM" <info@nevymyslis.cz>',
  to: user.email,
  subject: 'Reset hesla - Nevymyslíš CRM',
  html: `
    <h2>Reset hesla</h2>
    <p>Ahoj ${user.name},</p>
    <p>Obdrželi jsme žádost o reset vašeho hesla.</p>
    <p>Klikněte na odkaz níže pro vytvoření nového hesla:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>Odkaz je platný 1 hodinu.</p>
    <p>Pokud jste o reset hesla nežádali, ignorujte tento email.</p>
    <p>S pozdravem,<br>Tým Nevymyslíš</p>
  `
};

await transporter.sendMail(mailOptions);
console.log('✅ Email odeslán na:', user.email);
```

4. **Odstranit dev response:**
```javascript
// ODSTRANIT V PRODUKCI:
if (process.env.NODE_ENV === 'development') {
  return res.json({
    message: 'Odkaz pro reset hesla byl vygenerován.',
    resetUrl, // <-- ODSTRANIT
    email: user.email
  });
}
```

---

## 📁 Změněné soubory

### **Backend:**
1. `/backend/scripts/initDb.js`
   - Přidána tabulka `password_resets`
   - Admin email změněn na `info@nevymyslis.cz`

2. `/backend/routes/auth.js`
   - Přidán import `crypto`
   - Endpoint POST `/auth/forgot-password`
   - Endpoint POST `/auth/reset-password`

### **Frontend:**
3. `/frontend/src/pages/Login.jsx`
   - Odstraněn demo přístup
   - Odstraněn link na registraci
   - Přidán link "Zapomněli jste heslo?"

4. `/frontend/src/pages/ForgotPassword.jsx` ← **NOVÝ**
   - Formulář pro zadání emailu
   - Success message
   - Dev mode: zobrazení reset URL

5. `/frontend/src/pages/ResetPassword.jsx` ← **NOVÝ**
   - Formulář pro nové heslo
   - Validace + potvrzení
   - Success screen

6. `/frontend/src/App.jsx`
   - Route `/forgot-password`
   - Route `/reset-password`

---

## ✅ Checklist před produkcí

- [x] Tabulka password_resets vytvořena
- [x] Forgot password endpoint funguje
- [x] Reset password endpoint funguje
- [x] Frontend komponenty vytvořeny
- [x] Admin email změněn na info@nevymyslis.cz
- [x] Demo údaje odstraněny z loginu
- [ ] **Email odesílání implementováno** ⚠️
- [ ] **SMTP credentials v .env** ⚠️
- [ ] **Dev response odstraněn** ⚠️
- [ ] **Testováno v produkčním prostředí** ⚠️

---

## 📊 Souhrn

| Funkce | Status |
|--------|--------|
| **Login ready** | ✅ Bez demo údajů |
| **Admin email** | ✅ info@nevymyslis.cz |
| **Forgot password UI** | ✅ Vytvořeno |
| **Reset password UI** | ✅ Vytvořeno |
| **Backend API** | ✅ Funkční |
| **Databáze** | ✅ password_resets tabulka |
| **Email odesílání** | ⚠️ Pro produkci implementovat |
| **Bezpečnost** | ✅ Token expirace, reuse prevence |

---

## 🎉 VÝSLEDEK

### **Development:**
- ✅ Reset hesla funguje kompletně
- ✅ Token zobrazený v response (pro testování)
- ✅ Konzole loguje reset URL

### **Pro produkci zbývá:**
1. Implementovat Nodemailer
2. Nastavit SMTP credentials
3. Odstranit dev response s tokenem
4. Otestovat email doručení

**LOGIN STRÁNKA JE PRODUCTION READY! 🚀**

**Reset hesla je připraven, stačí přidat email! 📧**
