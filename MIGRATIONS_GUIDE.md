# 🔄 Průvodce migrací CRM v3.0.0

## 📝 Co migrace dělají:

### 1️⃣ **migrateToV3.js**
Vytváří základní tabulky pro v3:
- `projects` - projekty (název, typ, brief, deadline, status, assigned_to)
- `project_milestones` - milníky projektů
- `project_team` - týmové přiřazení k projektům
- `project_checklist` - checklisty pro projekty
- `ai_post_history` - historie AI generování
- Finanční sloupce u `clients` (monthly_recurring_amount, invoice_day, invoice_due_days)

### 2️⃣ **addMissingColumns.js**
Přidává chybějící sloupce (bezpečně - neselže když už existují):
- `projects.assigned_to` - přiřazený pracovník
- `ai_post_history.prompt` - použitý prompt
- `ai_post_history.platform` - platforma (Instagram, Facebook...)
- `ai_post_history.generated_text` - vygenerovaný text
- `clients.google_drive_link` - odkaz na Google Drive

### 3️⃣ **addRevenueSplits.js**
Vytváří tabulku pro rozdělení příjmů:
- `revenue_splits` - rozdělení měsíčních příjmů mezi pracovníky
  - client_id, user_id, amount, notes

### 4️⃣ **seedPricing.js**
Naplní databázi službami z ceníku:
- Social Media balíčky (S, M, L, XL)
- Rozšíření platforem
- Reklamy (Meta, Google, TikTok)
- Kreativní služby (Video, Foto, Grafika)
- Weby
- Údržba

---

## 🚀 JAK SPUSTIT MIGRACE

### **Varianta A: Přes API (DOPORUČENO pro Render free tier)**

Po dokončení buildu (~2 min) otevřete konzoli prohlížeče na `https://crm-sgb1.onrender.com` a spusťte:

```javascript
fetch('/api/setup/run-migrations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ auth_key: 'nevymyslis-setup-2025' })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Výsledek:', data);
  if (data.success) {
    alert('Migrace dokončeny! ✅');
  } else {
    alert('Chyba: ' + data.error);
  }
});
```

### **Varianta B: Ručně přes SSH (pokud máte přístup)**

```bash
# Přejít do backend složky
cd backend

# Spustit migrace postupně
node scripts/migrateToV3.js
node scripts/addMissingColumns.js
node scripts/addRevenueSplits.js
node scripts/seedPricing.js
```

---

## 🔍 KONTROLA STATUSU

Zkontrolovat zda migrace proběhly:

```javascript
fetch('/api/setup/status')
  .then(r => r.json())
  .then(data => console.log(data));
```

---

## 🔄 RESET (pokud potřebujete spustit znovu)

Pokud migrace selhaly a chcete je spustit znovu:

```javascript
fetch('/api/setup/reset', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ auth_key: 'nevymyslis-setup-2025' })
})
.then(r => r.json())
.then(data => console.log(data));
```

Pak můžete znovu spustit `/api/setup/run-migrations`.

---

## ⚠️ BEZPEČNOST

**Auth klíč:** `nevymyslis-setup-2025`

Tento klíč je nastaven v kódu. Pro produkci doporučujeme:
1. Nastavit environment variable `SETUP_KEY` na Renderu
2. Používat silnější klíč
3. Po dokončení migrací endpoint deaktivovat (nebo vymazat route)

---

## 🐛 ŘEŠENÍ PROBLÉMŮ

### Chyba: "Command failed"
- Zkontrolujte logy na Renderu
- Možná tabulka už existuje (to je OK, script pokračuje)

### Chyba: "Pool ended"
- Normální - pool se uzavře po dokončení scriptu
- Nedělá to problém, migrace proběhla

### Chyba: "Timeout"
- Script běží déle než 60s
- Zkontrolujte DB připojení
- Zvyšte timeout v setup.js

### Služby se neduplikují?
- seedPricing.js kontroluje zda služby už existují
- Pokud ano, přeskočí je

---

## ✅ PO DOKONČENÍ MIGRACÍ

Systém bude mít:
- ✅ Všechny tabulky pro v3.0.0
- ✅ Pravidelné fakturace (částka, den, splatnost)
- ✅ Rozdělení příjmů mezi pracovníky
- ✅ Projekty s přiřazením pracovníků
- ✅ AI historie s detaily
- ✅ 16 služeb v ceníku

**Můžete začít používat:**
- Pravidelné faktury u klientů
- Rozdělení příjmů (modal v detailu klienta)
- Projekty s assigned_to
- Cenové nabídky s historií
- AI popisky s novým modelem

---

**Vytvořeno:** 26.10.2025  
**Verze:** 3.0.0
