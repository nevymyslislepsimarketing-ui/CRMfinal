# ✅ Kontrolní seznam před push do Gitu

## 🔍 Před commitem zkontrolujte:

### 1. Citlivé soubory
- [ ] `.env` soubory NEJSOU ve staging area
- [ ] `.env` je v `.gitignore`
- [ ] Žádné API klíče nebo hesla v kódu
- [ ] `node_modules/` není ve staging area

### 2. Dokumentace
- [ ] `IMPLEMENTED_FEATURES.md` je aktuální
- [ ] `QUICK_START.md` obsahuje všechny instrukce
- [ ] `CHANGELOG.md` popisuje všechny změny
- [ ] `COMMIT_MESSAGE.txt` je připraven

### 3. Kód
- [ ] Všechny nové soubory jsou přidány
- [ ] Žádné console.log() v produkčním kódu
- [ ] Žádné TODO komentáře které by měly být hotové
- [ ] Kód je zformátován

### 4. Databáze
- [ ] Migrační skript `addClientFields.js` je otestován
- [ ] Migrace proběhla úspěšně lokálně
- [ ] Dokumentace migrace je kompletní

### 5. Testování
- [ ] Všechny nové funkce jsou otestované
- [ ] Stávající funkce stále fungují
- [ ] Email notifikace jsou funkční
- [ ] Kalendář se správně zobrazuje

---

## 📋 Seznam změněných souborů k commitu:

### Backend soubory:
```
backend/scripts/addClientFields.js          (NOVÝ)
backend/routes/clients.js                   (UPRAVENO)
backend/routes/users.js                     (UPRAVENO)
backend/routes/tasks.js                     (UPRAVENO)
backend/services/emailService.js            (UPRAVENO)
```

### Frontend soubory:
```
frontend/src/pages/CalendarEnhanced.jsx     (NOVÝ)
frontend/src/pages/Clients.jsx              (UPRAVENO)
frontend/src/pages/Tasks.jsx                (UPRAVENO)
frontend/src/pages/Dashboard.jsx            (UPRAVENO)
frontend/src/pages/Admin.jsx                (UPRAVENO)
frontend/src/App.jsx                        (UPRAVENO)
```

### Dokumentace:
```
IMPLEMENTED_FEATURES.md                     (NOVÝ)
QUICK_START.md                              (NOVÝ)
CHANGELOG.md                                (NOVÝ)
COMMIT_MESSAGE.txt                          (NOVÝ)
GIT_COMMANDS.sh                             (NOVÝ)
PRE_PUSH_CHECKLIST.md                       (TENTO SOUBOR)
```

---

## 🚫 Soubory které NESMÍ být v commitu:

```
backend/.env
backend/node_modules/
frontend/.env
frontend/node_modules/
.DS_Store
*.log
```

---

## 📝 Git příkazy:

### 1. Zkontrolovat status:
```bash
git status
```

### 2. Přidat všechny změny:
```bash
git add .
```

### 3. Zkontrolovat co bude commitnuto:
```bash
git status
git diff --staged
```

### 4. Commit s připravenou zprávou:
```bash
git commit -F COMMIT_MESSAGE.txt
```

Nebo použijte jednodušší verzi:
```bash
git commit -m "feat: Implementace CRM v2.0.0 - všechny nové funkce"
```

### 5. Push do vzdáleného repozitáře:
```bash
# Zjistěte název vaší větve:
git branch

# Push do hlavní větve:
git push origin main
# NEBO
git push origin master
```

---

## ⚠️ DŮLEŽITÉ upozornění:

### Před pushem do produkce:

1. **Zálohujte databázi** na produkčním serveru
2. **Otestujte migraci** na testovacím prostředí
3. **Ověřte email konfiguraci** na produkci
4. **Informujte tým** o nových funkcích
5. **Připravte rollback plán** (pro případ problémů)

### Po pushi:

1. Zkontrolujte že commit je viditelný na GitHubu/GitLabu
2. Na produkci spusťte migraci:
   ```bash
   cd backend
   node scripts/addClientFields.js
   ```
3. Restartujte backend i frontend
4. Otestujte všechny nové funkce na produkci
5. Informujte uživatele o nových funkcích

---

## 🆘 V případě problémů:

### Rollback commitu (před pushem):
```bash
git reset --soft HEAD~1  # Vrátí commit ale zachová změny
git reset --hard HEAD~1  # Vrátí commit a SMAŽE změny
```

### Rollback po pushi:
```bash
git revert HEAD
git push origin main
```

### Obnovení databáze:
Použijte zálohu databáze před migrací

---

## ✅ Vše připraveno!

Pokud je vše zkontrolováno, můžete provést commit a push:

```bash
# Spusťte připravený skript:
bash GIT_COMMANDS.sh

# Nebo manuálně:
git add .
git commit -F COMMIT_MESSAGE.txt
git push origin main  # nebo master
```

---

**Poslední kontrola:** `git status` před pushem!

🎉 Hodně štěstí s nasazením nové verze!
