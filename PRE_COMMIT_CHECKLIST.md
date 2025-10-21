# ✅ Pre-Commit Checklist

## 🔒 BEZPEČNOST - KRITICKÉ!

- [x] `.env` soubory NEJSOU v Gitu (zkontroluj .gitignore)
- [x] `.env.example` NEOBSAHUJE skutečná hesla
- [x] Žádné API klíče v kódu
- [x] Žádné databázové credentials v kódu
- [x] SMTP heslo není v .env.example

## 📝 KÓD

- [x] Backend dependencies aktuální (package.json)
- [x] Frontend dependencies aktuální (package.json)
- [x] Nodemailer přidán do dependencies
- [x] Email service implementován
- [x] Všechny nové funkce otestovány

## 📚 DOKUMENTACE

- [x] README.md aktualizován
- [x] DEPLOYMENT_PROD.md vytvořen
- [x] API dokumentace kompletní
- [x] Nové funkce zdokumentovány

## 🧪 TESTOVÁNÍ

- [x] Backend se spouští bez chyb
- [x] Frontend se spouští bez chyb
- [x] Login funguje
- [x] Vytvoření uživatele funguje
- [x] Reset hesla funguje
- [x] Emaily se odesílají

## 🗑️ CLEANUP

- [x] Demo přihlašovací údaje odstraněny
- [x] Registrace odstraněna z UI
- [x] Testovací kódy odstraněny
- [x] Console.logs vyčištěny (ponechány pouze důležité)
- [x] Komentáře aktualizovány

## 📦 BUILD

- [ ] `npm install` funguje v backend/
- [ ] `npm install` funguje v frontend/
- [ ] Backend build prochází
- [ ] Frontend build prochází

---

## 🚀 READY TO PUSH?

### Kontrola před commitem:

```bash
# Backend
cd backend
git status  # Zkontroluj, že .env není v seznamu

# Frontend
cd ../frontend
git status

# Root
cd ..
git status
```

### Pokud vše OK:

```bash
git add .
git commit -m "feat: Production ready - email, password reset, invoice numbering"
git push origin main
```

---

## ⚠️ POKUD NAJDEŠ .env V GIT STATUS:

**NESTĚŽEJ!**

```bash
# Odstraň .env ze staging:
git restore --staged backend/.env

# Ověř .gitignore:
cat backend/.gitignore | grep .env
```

---

## 📋 CO BYLO IMPLEMENTOVÁNO V TOMTO RELEASE:

### ✅ Bezpečnost:
- Force password change při prvním přihlášení
- Reset hesla přes email
- JWT token management
- Admin email změněn na info@nevymyslis.cz

### ✅ Email systém:
- Nodemailer integrace
- SMTP Zoho Mail
- Reset hesla email (HTML)
- Uvítací email pro nové uživatele (HTML)
- Email service s fallbackem

### ✅ Faktury:
- Automatické číslování (RRRRMMXXXXX)
- PDF generování
- Popis služeb povinný
- Datum vystavení nelze měnit

### ✅ UI:
- Login bez demo údajů
- Registrace odstraněna
- Forgot password stránka
- Reset password stránka
- Change password stránka

### ✅ Role & přístupy:
- Manager / Employee role
- Client visibility control
- Dashboard visibility based on role
- Task assignment

---

## 🎊 DALŠÍ KROKY PO PUSHI:

1. **Nasadit na produkci** (viz DEPLOYMENT_PROD.md)
2. **Nastavit SMTP v produkčním .env**
3. **Nastavit DNS záznamy** (SPF, DKIM, DMARC)
4. **První přihlášení a změna admin hesla**
5. **Vyplnit fakturační údaje**
6. **Vytvořit první reálné uživatele**
7. **Testovat email doručitelnost**

---

**Připraveno k nasazení! 🚀**
