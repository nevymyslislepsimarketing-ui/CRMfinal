# 🚀 START HERE - Deployment CRM v2.0.0

## ⚡ Super rychlý návod

### Máte už databázi na Render?

#### ✅ ANO - Mám databázi
→ Čtěte: **RENDER_EXISTING_DB.md**

Rychlý postup:
1. `git push`
2. Render Dashboard → Backend Service → Settings
3. Build Command: `npm install && npm run build`
4. Environment: přidat DATABASE_URL (Internal), CORS_ORIGIN
5. Manual Deploy
6. Hotovo!

#### ❌ NE - Nemám nic na Render
→ Čtěte: **CLOUDFLARE_QUICK_SETUP.md** nebo **RENDER_QUICK_START.md**

---

## 📁 Jaký soubor číst kdy?

### Už máte existující infrastrukturu:
- **RENDER_EXISTING_DB.md** 📖 ← **ZAČNĚTE TADY**
  - Už máte databázi na Render
  - Už možná máte i backend
  - Potřebujete přidat automatické migrace

### Začínáte od nuly:
- **CLOUDFLARE_QUICK_SETUP.md** ⚡
  - Frontend chcete na Cloudflare Pages
  - Backend + DB na Render
  - Rychlý setup (3 kroky, 15 minut)

- **RENDER_QUICK_START.md** ⚡
  - Všechno na Render (frontend i backend)
  - Blueprint setup
  - Nejjednodušší varianta

### Detailní návody:
- **CLOUDFLARE_DEPLOYMENT.md** 📚
  - Detailní postup pro Cloudflare + Render
  - Troubleshooting
  - Custom domains

- **RENDER_DEPLOYMENT.md** 📚
  - Detailní postup pro Render
  - Všechny možnosti
  - Advanced setup

### Dokumentace funkcí:
- **IMPLEMENTED_FEATURES.md** 📋
  - Co všechno je nové ve v2.0.0
  - Jak používat nové funkce
  - API dokumentace

- **QUICK_START.md** 📖
  - Návod jak používat nové funkce
  - Po úspěšném deploymentu

- **CHANGELOG.md** 📝
  - Historie změn
  - Verze

### Pro Git:
- **COMMIT_MESSAGE.txt** 💬
  - Připravená commit message
  - Můžete použít: `git commit -F COMMIT_MESSAGE.txt`

- **PRE_PUSH_CHECKLIST.md** ✅
  - Checklist před pushem
  - Co zkontrolovat

---

## 🎯 Váš případ (vyberte jeden)

### 1️⃣ Mám databázi na Render, chci přidat migrace
```bash
# 1. Push kódu
git push

# 2. Přečíst
→ RENDER_EXISTING_DB.md

# 3. Čas: 10 minut
```

### 2️⃣ Mám vše na Render, chci přesunout frontend na Cloudflare
```bash
# 1. Push kódu
git push

# 2. Přečíst
→ CLOUDFLARE_DEPLOYMENT.md (sekce "Migrace z Render")

# 3. Čas: 15 minut
```

### 3️⃣ Začínám od nuly, chci Cloudflare + Render
```bash
# 1. Push kódu
git push

# 2. Přečíst
→ CLOUDFLARE_QUICK_SETUP.md

# 3. Čas: 15-20 minut
```

### 4️⃣ Začínám od nuly, chci vše na Render
```bash
# 1. Push kódu
git push

# 2. Přečíst
→ RENDER_QUICK_START.md

# 3. Čas: 10-15 minut
```

---

## ✨ Co je nové ve v2.0.0

1. ✅ Filtrování úkolů podle uživatele (manažeři)
2. ✅ Detail klienta s Google Drive a credentials
3. ✅ Klikací Dashboard karty
4. ✅ Editace uživatelů v Admin panelu
5. ✅ Email notifikace při přiřazení úkolu
6. ✅ Vylepšený Kalendář (týden/měsíc zobrazení)
7. ✅ **Automatické migrace databáze při deploymentu**

---

## 🔧 Co bylo přidáno do projektu

### Automatické migrace:
- `backend/scripts/runMigrations.js` - Migrační skript
- `backend/package.json` - Přidány scripty `migrate` a `build`

### Deployment konfigurace:
- `render.yaml` - Blueprint pro Render
- `backend/server.js` - CORS config + health check

### Dokumentace:
- 10+ nových dokumentačních souborů
- Návody pro různé scénáře
- Troubleshooting guides

---

## 🚀 Nejrychlejší cesta k deploymentu

**Pokud už máte databázi na Render:**

```bash
# 1. Push
git add .
git commit -m "feat: v2.0.0 + auto migrations"
git push

# 2. Render Dashboard
# - Backend Service → Settings
# - Build Command: npm install && npm run build
# - Environment: DATABASE_URL (Internal), CORS_ORIGIN
# - Save + Manual Deploy

# 3. Hotovo! (10 min)
```

Detaily: **RENDER_EXISTING_DB.md**

---

## ❓ FAQ

**Q: Potřebuji Blueprint?**  
A: Ne, pokud už máte databázi. Blueprint vytváří novou DB.

**Q: Budou migrace automatické i příště?**  
A: Ano! Po nastavení Build Command se migrace spustí při každém push.

**Q: Smažou se mi data?**  
A: Ne. Migrace jen přidávají nové sloupce/tabulky, nic nemaží.

**Q: Co když migrace selže?**  
A: Aplikace běží dál. Můžete spustit migrace manuálně přes Shell.

**Q: Musím zaplatit?**  
A: Ne. Render free tier stačí. Cloudflare Pages je taky free.

---

## 📞 Potřebujete pomoc?

1. Zkontrolujte **RENDER_EXISTING_DB.md** sekci Troubleshooting
2. Zkontrolujte Build Logs v Render Dashboard
3. Zkontrolujte Runtime Logs v Render Dashboard
4. Všechny chybové zprávy jsou v logách

---

## ✅ Poslední kontrola před pushem

```bash
# Zkontrolovat Git status
git status

# .env soubory NESMÍ být v seznamu!
# Pokud jsou, přidejte je do .gitignore

# Commitnout vše
git add .
git commit -m "feat: CRM v2.0.0"
git push
```

---

**Přejeme úspěšný deployment! 🎉**

**Pro váš případ konkrétně čtěte: RENDER_EXISTING_DB.md** 📖
