# 🔧 Render Setup s existující databází

## 🎯 Váš případ

Už máte:
- ✅ PostgreSQL databázi na Render
- ✅ Backend service na Render (možná)
- ✅ Frontend na Cloudflare Pages

Potřebujete:
- 🔄 Aktualizovat backend pro automatické migrace
- 🔄 Spustit migrace na existující databázi

---

## 🚀 Řešení (3 kroky)

### **Krok 1: Push nového kódu** (1 minuta)

```bash
git add .
git commit -m "feat: Automatické migrace + nové funkce v2.0.0"
git push origin main
```

---

### **Krok 2: Aktualizovat Backend Service** (5 minut)

#### A) Pokud už máte Backend Service:

1. Jděte na https://dashboard.render.com
2. Klikněte na váš **Backend Service**
3. **Settings** → najděte:

**Build Command:** Změňte na:
```bash
npm install && npm run build
```

**Start Command:** (nechte):
```bash
npm start
```

4. Scroll dolů → **Save Changes**
5. **Manual Deploy** → **Deploy latest commit**

#### B) Pokud NEMÁTE Backend Service (jen DB):

1. V Dashboard klikněte **New +** → **Web Service**
2. Připojte váš Git repozitář
3. **Nastavení:**
   - Name: `nevymyslis-crm-backend`
   - Region: Frankfurt (nebo kde máte DB)
   - Branch: `main`
   - Root Directory: `backend`
   - Environment: **Node**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free

4. Pokračujte na Krok 3 pro Environment Variables

---

### **Krok 3: Environment Variables** (3 minuty)

V **Backend Service** → **Environment** → přidejte/aktualizujte:

```bash
NODE_ENV=production

# Database - použijte INTERNAL URL vaší existující databáze
DATABASE_URL=postgresql://user:password@...  # INTERNAL URL z vaší DB

# Frontend
FRONTEND_URL=https://nevymyslis-crm.pages.dev  # Vaše Cloudflare URL
CORS_ORIGIN=https://nevymyslis-crm.pages.dev  # Vaše Cloudflare URL

# JWT
JWT_SECRET=dlouhý_náhodný_string  # Pokud už nemáte, vygenerujte nový

# Email
MAILTRAP_API_TOKEN=váš_token
EMAIL_FROM=info@nevymyslis.cz
EMAIL_FROM_NAME=Nevymyslíš CRM
```

**Kde najdu DATABASE_URL?**
1. Dashboard → Vaše PostgreSQL databáze
2. **Info** tab
3. Zkopírujte **Internal Database URL** (ne External!)
4. Měla by začínat: `postgresql://nevymyslis_crm_...`

**Uložte změny** → Backend se automaticky restartuje.

---

### **Krok 4: Ověřit že migrace proběhly** (2 minuty)

#### Zkontrolujte Build Logs:

1. Backend Service → **Logs** tab
2. Přepněte na **Build Logs**
3. Hledejte:
   ```
   🚀 Spouštění migrací...
   ✅ Sloupec google_drive_link přidán
   ✅ Tabulka client_credentials vytvořena
   🎉 Migrace dokončeny!
   ```

#### Pokud vidíte:
- ✅ `🎉 Migrace dokončeny!` → **Perfektní!**
- ⚠️ `Struktury již existují` → **Také OK** (migrace už proběhly)
- ❌ Chyba → Pokračujte na **Ruční migrace** níže

---

## ✅ Hotovo!

Otevřete vaši Cloudflare frontend URL a otestujte:
- Login
- Detail klienta (ikona oka)
- Filtr úkolů podle uživatele
- Kalendář s týdenním zobrazením

---

## 🔧 Ruční migrace (pokud automatická selhala)

### Metoda A: Přes Render Shell (doporučeno)

1. Backend Service → **Shell** tab
2. Spusťte:
   ```bash
   npm run migrate
   ```
3. Měli byste vidět:
   ```
   🚀 Spouštění migrací...
   ✅ Migrace dokončeny!
   ```

### Metoda B: Přes psql (pokud Shell nefunguje)

1. Vaše PostgreSQL databáze → **Shell** tab
2. Spusťte tyto SQL příkazy:

```sql
-- Přidat google_drive_link
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS google_drive_link TEXT;

-- Vytvořit tabulku client_credentials
CREATE TABLE IF NOT EXISTS client_credentials (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  platform VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  password TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vytvořit index
CREATE INDEX IF NOT EXISTS idx_client_credentials_client_id 
ON client_credentials(client_id);

-- Ověřit
\d clients
\d client_credentials
```

Pokud vidíte tabulky a sloupce → **Hotovo!**

---

## 🔄 Další deploymenty

Od teď při každém `git push`:
1. ✅ Render automaticky spustí migrace (pokud jsou nové)
2. ✅ Rebuilgduje backend
3. ✅ Restartuje service
4. ✅ Live během 2-3 minut

**Žádná další akce!**

---

## 📊 Kontrola package.json

Ujistěte se že `backend/package.json` má tyto scripty:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "migrate": "node scripts/runMigrations.js",
    "build": "npm run migrate"
  }
}
```

Pokud nemáte, přidejte a pushněte znovu.

---

## 🐛 Troubleshooting

### Chyba: "Cannot connect to database"

**Řešení:**
1. Zkontrolujte že DATABASE_URL je **Internal** (ne External)
2. Zkontrolujte že Backend a Database jsou ve **stejném regionu**
3. Restartujte Backend Service

### Chyba: "column already exists"

**Není chyba!** Migrace jsou idempotentní - bezpečně přeskočí to co už existuje.

### Build selhal

**Řešení:**
1. Zkontrolujte že máte všechny nové soubory v Gitu:
   - `backend/scripts/runMigrations.js`
   - Aktualizovaný `backend/package.json`
2. V Render: **Manual Deploy** → **Clear build cache & deploy**

### CORS error na frontendu

**Řešení:**
1. Zkontrolujte `CORS_ORIGIN` v Backend Environment Variables
2. Musí být PŘESNĚ stejná jako Cloudflare URL
3. **BEZ** lomítka na konci:
   - ✅ `https://nevymyslis-crm.pages.dev`
   - ❌ `https://nevymyslis-crm.pages.dev/`

---

## 💡 Pro tip

### Nastavte Build Webhook

Pokud chcete spouštět migrace i bez nového commitu:

1. Backend Service → **Settings**
2. **Build & Deploy** → **Build Hooks**
3. Vytvořte hook
4. Můžete ho zavolat pomocí curl kdykoliv potřebujete

---

## 📚 Související dokumentace

- **Cloudflare setup:** `CLOUDFLARE_DEPLOYMENT.md`
- **Rychlý návod:** `CLOUDFLARE_QUICK_SETUP.md`
- **Všechny funkce:** `IMPLEMENTED_FEATURES.md`

---

## ✅ Checklist

- [ ] Git push proběhl
- [ ] Backend má správný Build Command (`npm install && npm run build`)
- [ ] Environment Variables jsou nastavené
- [ ] DATABASE_URL je Internal (ne External)
- [ ] CORS_ORIGIN odpovídá Cloudflare URL
- [ ] Build Logs ukazují úspěšné migrace
- [ ] Frontend funguje a komunikuje s backendem
- [ ] Všechny nové funkce fungují

---

**Verze:** 2.0.0  
**Setup:** Existující Render DB + Cloudflare Pages  
**Datum:** 23. října 2025
