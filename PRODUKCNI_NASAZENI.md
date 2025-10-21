# 🚀 Příprava CRM na produkční nasazení - Dokončeno!

## ✅ CO BYLO IMPLEMENTOVÁNO

### 1. **Bezpečné počáteční heslo pro Admin**

**První admin uživatel:**
- 📧 Email: `admin@nevymyslis.cz`
- 🔑 Heslo: `Nevymyslis2025!`
- ⚠️ **Povinná změna hesla při prvním přihlášení!**

**Heslo se zobrazí v konzoli při inicializaci databáze**

---

### 2. **Automatická vynucená změna hesla**

#### **Pro všechny nové uživatele:**
- Každý nově vytvořený uživatel má `force_password_change = TRUE`
- První přihlášení vyžaduje změnu hesla
- Admin uvidí dočasné heslo při vytváření uživatele

#### **Jak to funguje:**
1. Admin vytvoří uživatele s dočasným heslem
2. Uživatel se přihlásí s dočasným heslem
3. Systém detekuje `force_password_change = TRUE`
4. Uživatel je přesměrován na změnu hesla
5. Po změně hesla má normální přístup

---

### 3. **Čistá databáze bez testovacích dat**

**Odstraněno:**
- ❌ Testovací klienti (ACME Corp, TechStart, atd.)
- ❌ Demo uživatelé (Lucie, Roman)
- ❌ Demo fakturační údaje

**Zachováno:**
- ✅ Typy úkolů (Obchodní schůzka, Natáčení, atd.)
- ✅ Struktura tabulek
- ✅ Jeden admin uživatel

---

## 🔐 Bezpečnostní Features

### **Backend kontroly:**
```javascript
// Login endpoint
if (user.force_password_change) {
  // Vrátí tempToken (platnost 30 minut)
  return res.json({
    requirePasswordChange: true,
    tempToken: '...',
    user: {...}
  });
}
```

### **Validace hesla:**
- Minimální délka: 8 znaků
- Kontrola při změně hesla
- Hashování bcrypt (10 rounds)

### **Tokeny:**
- **Dočasný token** (tempToken): 30 minut - pouze pro změnu hesla
- **Normální token**: 24 hodin - plný přístup

---

## 📋 Databázové změny

### **Nový sloupec v tabulce users:**
```sql
force_password_change BOOLEAN DEFAULT FALSE
```

**Kdy je TRUE:**
- Při vytvoření prvního admin účtu
- Při vytvoření jakéhokoli nového uživatele
- Po resetu hesla (pokud implementujete)

**Kdy se nastaví na FALSE:**
- Po úspěšné změně hesla

---

## 🎯 API Endpointy

### **POST /api/auth/login**
**Odpověď pokud je nutná změna hesla:**
```json
{
  "requirePasswordChange": true,
  "tempToken": "jwt_token_30min",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@nevymyslis.cz"
  }
}
```

### **POST /api/auth/change-password**
**Request:**
```json
{
  "newPassword": "NovoSilneHeslo123!"
}
```

**Headers:**
```
Authorization: Bearer <tempToken nebo token>
```

**Odpověď:**
```json
{
  "message": "Heslo úspěšně změněno",
  "token": "novy_jwt_token_24h",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@nevymyslis.cz",
    "role": "manager"
  }
}
```

### **POST /api/auth/register** (pro vytváření uživatelů)
**Odpověď:**
```json
{
  "message": "Uživatel úspěšně vytvořen. První přihlášení vyžaduje změnu hesla.",
  "user": {
    "id": 2,
    "name": "Jan Novák",
    "email": "jan@nevymyslis.cz",
    "role": "employee",
    "initialPassword": "DocasneHeslo123"
  }
}
```

---

## 🚀 JAK NASADIT

### **Krok 1: Inicializace databáze**
```bash
cd backend
npm run init-db
```

**Výstup v konzoli:**
```
✅ Admin uživatel vytvořen
📧 Email: admin@nevymyslis.cz
🔑 Heslo: Nevymyslis2025!
⚠️  Heslo bude nutné změnit při prvním přihlášení!
```

**⚠️ POZNAMENEJTE SI HESLO! Zobrazí se jen jednou.**

---

### **Krok 2: První přihlášení**
1. Spusťte aplikaci
2. Přihlaste se jako admin@nevymyslis.cz
3. Použijte heslo: `Nevymyslis2025!`
4. Systém vás přesměruje na změnu hesla
5. Zadejte nové silné heslo (min 8 znaků)

---

### **Krok 3: Vytvoření dalších uživatelů**
1. Přihlášeni jako admin
2. Admin panel → Vytvořit uživatele
3. Zadejte dočasné heslo (např. `Docasne123`)
4. **POZNAMENEJTE SI HESLO** - sdělte ho uživateli
5. Uživatel se přihlásí a změní heslo

---

## 📝 WORKFLOW Vytvoření uživatele

### **Admin:**
1. Admin panel → Nový uživatel
2. Vyplní: Jméno, Email, Role, Pozice
3. Zadá **dočasné heslo** (např. `TempPass123`)
4. System vrátí zprávu: "Uživatel vytvořen, heslo: TempPass123"
5. Admin sdělí uživateli email + dočasné heslo

### **Nový uživatel:**
1. Otevře CRM
2. Přihlásí se: email + dočasné heslo
3. Systém detekuje `force_password_change = TRUE`
4. **Automatické přesměrování** na změnu hesla
5. Zadá nové heslo (min 8 znaků)
6. Systém změní heslo a nastaví `force_password_change = FALSE`
7. Uživatel má plný přístup

---

## 🔒 Bezpečnostní doporučení

### **Pro produkci:**

1. **JWT_SECRET:**
   ```bash
   # Vygenerujte silný secret
   openssl rand -base64 32
   
   # Nastavte v .env
   JWT_SECRET=zde_vygenerovaný_secret
   ```

2. **Database URL:**
   ```bash
   # Použijte produkční databázi, ne localhost
   DATABASE_URL=postgresql://user:pass@prod-server:5432/dbname
   ```

3. **HTTPS:**
   - Použijte SSL certifikát
   - Vynuťte HTTPS pro všechny requesty

4. **Změňte admin email:**
   - V `initDb.js` změňte `admin@nevymyslis.cz` na vaši firmu

5. **Změňte počáteční heslo:**
   - V `initDb.js` změňte `Nevymyslis2025!` na silnější

---

## ✅ Checklist před spuštěním

- [ ] Vygenerován silný JWT_SECRET
- [ ] Nastavena produkční DATABASE_URL
- [ ] Spuštěn `npm run init-db`
- [ ] Poznamenáno admin heslo z konzole
- [ ] Admin se přihlásil a změnil heslo
- [ ] Nastaveny fakturační údaje v Nastavení
- [ ] Vytvořen alespoň jeden testovací klient
- [ ] Vytvořen alespoň jeden testovací uživatel
- [ ] Otestován celý workflow (login, změna hesla)
- [ ] SSL certifikát nakonfigurován (pokud online)
- [ ] Firewall pravidla nastavena
- [ ] Zálohování databáze nakonfigurováno

---

## 📊 Struktura databáze - Produkce

### **Tabulky:**
- `users` - 1 admin (na začátku)
- `clients` - prázdné
- `tasks` - prázdné
- `recurring_tasks` - prázdné
- `task_types` - 8 základních typů
- `pipeline` - prázdné
- `company_settings` - prázdné
- `invoices` - prázdné
- `client_users` - prázdné

---

## 🛠️ Troubleshooting

### **Zapomněl jsem admin heslo:**
1. Spusťte znovu `npm run init-db` (vymaže všechna data!)
2. Nebo manuálně resetujte v databázi:
```sql
UPDATE users 
SET password_hash = '$2a$10$...',  -- hash nového hesla
    force_password_change = TRUE
WHERE email = 'admin@nevymyslis.cz';
```

### **Změna hesla nefunguje:**
1. Zkontrolujte JWT_SECRET v .env
2. Zkontrolujte že tempToken je v Authorization header
3. Zkontrolujte že heslo má min 8 znaků

### **Uživatel vidí chybu "Token vypršel":**
- Dočasný token platí jen 30 minut
- Uživatel se musí přihlásit znovu a rychle změnit heslo

---

## 🎉 HOTOVO!

Váš CRM systém je připravený na produkční nasazení s:

1. ✅ **Bezpečným admin účtem** s vynucenou změnou hesla
2. ✅ **Automatickým vynucením změny hesla** pro nové uživatele
3. ✅ **Čistou databází** bez testovacích dat
4. ✅ **Robustní autentizací** s JWT tokeny
5. ✅ **Kompletní dokumentací**

**Připraveno k nasazení! 🚀**
