# 🚀 CRM PŘIPRAVEN NA SPUŠTĚNÍ - KOMPLETNÍ!

## ✅ VEŠKERÉ ZMĚNY DOKONČENY

### 1. **🔐 Bezpečné přihlášení**

#### **První admin uživatel:**
```
Email: admin@nevymyslis.cz
Heslo: Nevymyslis2025!
⚠️  Povinná změna hesla při prvním přihlášení
```

#### **Každý nový uživatel:**
- Automaticky `force_password_change = TRUE`
- Musí změnit heslo při prvním přihlášení
- Admin zadá dočasné heslo při vytváření

---

### 2. **📋 Implementované funkce**

#### **Backend:**
- ✅ Sloupec `force_password_change` v tabulce users
- ✅ Login endpoint kontroluje povinnou změnu hesla
- ✅ Endpoint `/auth/change-password` pro změnu hesla
- ✅ Dočasný token (30 minut) vs normální token (24 hodin)
- ✅ Automatické nastavení `force_password_change = TRUE` při vytvoření uživatele
- ✅ Validace hesla (min 8 znaků)

#### **Frontend:**
- ✅ Nová stránka `ChangePassword.jsx`
- ✅ Route `/change-password`
- ✅ Automatické přesměrování z Login na ChangePassword
- ✅ Bezpečná změna hesla s potvrzením
- ✅ Ukládání tempToken pro změnu hesla

---

### 3. **🗄️ Databáze - Produkční stav**

#### **Po inicializaci obsahuje:**
- ✅ 1 admin uživatel (force_password_change = TRUE)
- ✅ 8 typů úkolů (Schůzka, Natáčení, atd.)
- ❌ ŽÁDNÉ demo klienty
- ❌ ŽÁDNÉ demo faktury
- ❌ ŽÁDNÉ demo úkoly
- ✅ Prázdná tabulka client_users

---

## 🎯 JAK TO SPUSTIT

### **Krok 1: Inicializace databáze**

```bash
cd backend
npm run init-db
```

**📝 POZNAMENEJTE SI VÝSTUP:**
```
✅ Admin uživatel vytvořen
📧 Email: admin@nevymyslis.cz
🔑 Heslo: Nevymyslis2025!
⚠️  Heslo bude nutné změnit při prvním přihlášení!
```

---

### **Krok 2: Spuštění aplikace**

```bash
# Backend
cd backend
npm start

# Frontend (nový terminál)
cd frontend
npm run dev
```

---

### **Krok 3: První přihlášení**

1. **Otevřete aplikaci** (http://localhost:5173)
2. **Přihlaste se:**
   - Email: `admin@nevymyslis.cz`
   - Heslo: `Nevymyslis2025!`

3. **Automatické přesměrování:**
   - Systém vás přesměruje na `/change-password`

4. **Změňte heslo:**
   - Zadejte nové silné heslo (min 8 znaků)
   - Potvrďte heslo
   - Klikněte "Změnit heslo"

5. **Přihlášeni:**
   - Systém vás automaticky přihlásí
   - Přesměruje na Dashboard

---

## 👥 Vytvoření nového uživatele

### **Postup pro admina:**

1. **Admin panel** → Správa uživatelů
2. **Vytvořit uživatele:**
   - Jméno: Jan Novák
   - Email: jan@nevymyslis.cz
   - Heslo: `DocasneHeslo123` ← **Poznamenejte si!**
   - Role: Employee
   - Pozice: Marketing Specialist

3. **Systém vytvoří uživatele:**
   - `force_password_change = TRUE`
   - Backend vrátí: `initialPassword: "DocasneHeslo123"`

4. **Sdělte uživateli:**
   - Email: jan@nevymyslis.cz
   - Dočasné heslo: DocasneHeslo123

---

### **Postup pro nového uživatele:**

1. **Otevře CRM**
2. **Přihlásí se:**
   - Email: jan@nevymyslis.cz
   - Heslo: DocasneHeslo123

3. **Automaticky přesměrován** na změnu hesla
4. **Zadá nové heslo**
5. **Má plný přístup**

---

## 🔄 WORKFLOW Diagram

```
┌─────────────────────────────────────────────────────┐
│ 1. npm run init-db                                  │
│    → Vytvoří admin@nevymyslis.cz                    │
│    → force_password_change = TRUE                   │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│ 2. Admin se přihlásí                                │
│    → Login endpoint vrátí requirePasswordChange     │
│    → Frontend přesměruje na /change-password        │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│ 3. Admin změní heslo                                │
│    → POST /auth/change-password                     │
│    → force_password_change = FALSE                  │
│    → Vrátí normální token                           │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│ 4. Admin vytvoří nového uživatele                   │
│    → POST /auth/register                            │
│    → force_password_change = TRUE (automaticky)     │
│    → Vrátí initialPassword                          │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│ 5. Nový uživatel se přihlásí                        │
│    → Login endpoint vrátí requirePasswordChange     │
│    → Frontend přesměruje na /change-password        │
│    → Uživatel změní heslo                           │
│    → force_password_change = FALSE                  │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Změněné soubory

### **Backend:**
1. `/backend/scripts/initDb.js`
   - Přidán sloupec `force_password_change`
   - Odstraněna demo data
   - Vytvořen jen 1 admin s force_password_change = TRUE

2. `/backend/routes/auth.js`
   - Login kontroluje force_password_change
   - Nový endpoint POST `/auth/change-password`
   - Register nastavuje force_password_change = TRUE

### **Frontend:**
3. `/frontend/src/pages/ChangePassword.jsx` ← **NOVÝ**
   - Stránka pro změnu hesla
   - Validace hesla
   - Potvrzení hesla

4. `/frontend/src/pages/Login.jsx`
   - Kontrola requirePasswordChange v response
   - Přesměrování na /change-password

5. `/frontend/src/context/AuthContext.jsx`
   - Login funkce vrací requirePasswordChange

6. `/frontend/src/App.jsx`
   - Přidána route `/change-password`

---

## 🧪 TEST Scenario

### **Test 1: První přihlášení admina**
1. ✅ `npm run init-db`
2. ✅ Přihlásit admin@nevymyslis.cz + Nevymyslis2025!
3. ✅ Přesměruje na /change-password
4. ✅ Změnit heslo
5. ✅ Automaticky přihlášen → Dashboard

### **Test 2: Vytvoření nového uživatele**
1. ✅ Admin vytvoří uživatele (DocasneHeslo123)
2. ✅ Backend vrátí initialPassword
3. ✅ Admin poznamenal heslo

### **Test 3: První přihlášení nového uživatele**
1. ✅ Přihlásit novým účtem + DocasneHeslo123
2. ✅ Přesměruje na /change-password
3. ✅ Změnit heslo
4. ✅ Automaticky přihlášen → Tasks (employee) nebo Dashboard (manager)

### **Test 4: Validace hesla**
1. ✅ Heslo < 8 znaků → Chyba
2. ✅ Hesla se neshodují → Chyba
3. ✅ Vypršelý tempToken (30min) → Chyba "Token vypršel"

---

## 🔒 Bezpečnostní kontrola

### **✅ Implementováno:**
- ✅ Povinná změna hesla při prvním přihlášení
- ✅ Dočasný token (30min) vs normální token (24h)
- ✅ Bcrypt hashování (10 rounds)
- ✅ Validace hesla (min 8 znaků)
- ✅ Žádná testovací data v produkci
- ✅ force_password_change flag v databázi
- ✅ Automatické nastavení pro nové uživatele

### **⚠️ Pro produkci ještě:**
- [ ] Změnit JWT_SECRET (openssl rand -base64 32)
- [ ] Nastavit produkční DATABASE_URL
- [ ] Změnit admin email na firemní
- [ ] Nastavit HTTPS
- [ ] Konfigurovat firewall
- [ ] Nastavit zálohy databáze

---

## 📊 Databázové změny

### **Tabulka users:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'employee',
  position VARCHAR(100),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  force_password_change BOOLEAN DEFAULT FALSE,  ← NOVÉ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎉 VÝSLEDEK

### **Systém je připraven:**
1. ✅ Bezpečné první přihlášení
2. ✅ Automatická vynucená změna hesla
3. ✅ Čistá produkční databáze
4. ✅ Workflow pro nové uživatele
5. ✅ Validace a zabezpečení

### **Můžete spustit:**
```bash
npm run init-db   # Backend
npm start         # Backend

npm run dev       # Frontend
```

**CRM je PŘIPRAVEN NA PRODUKČNÍ NASAZENÍ! 🚀**
