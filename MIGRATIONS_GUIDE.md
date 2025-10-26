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

### **Varianta A: Všechny najednou (rychlejší, ale může timeoutovat)**

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

### **Varianta B: Po krocích (DOPORUČENO pokud A selhává s timeoutem)**

Spusťte migrace postupně v konzoli prohlížeče:

```javascript
const authKey = 'nevymyslis-setup-2025';

// Krok 1: Základní tabulky
fetch('/api/setup/step1-migrate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ auth_key: authKey })
})
.then(r => r.json())
.then(data => {
  console.log('1️⃣ Migrate:', data);
  if (!data.success && data.hint) console.log('ℹ️', data.hint);
});

// Počkejte 5s a pak:

// Krok 2: Sloupce
fetch('/api/setup/step2-columns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ auth_key: authKey })
})
.then(r => r.json())
.then(data => console.log('2️⃣ Columns:', data));

// Počkejte 5s a pak:

// Krok 3: Revenue splits
fetch('/api/setup/step3-revenue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ auth_key: authKey })
})
.then(r => r.json())
.then(data => console.log('3️⃣ Revenue:', data));

// Počkejte 5s a pak:

// Krok 4: Seed služeb
fetch('/api/setup/step4-seed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ auth_key: authKey })
})
.then(r => r.json())
.then(data => {
  console.log('4️⃣ Seed:', data);
  if (data.success) alert('🎉 Všechny migrace dokončeny!');
});
```

### **Varianta C: Automatický sekvence (kopírujte celé)**

```javascript
const runMigrations = async () => {
  const authKey = 'nevymyslis-setup-2025';
  const steps = ['step1-migrate', 'step2-columns', 'step3-revenue', 'step4-seed'];
  const labels = ['Základní tabulky', 'Sloupce', 'Revenue splits', 'Seed služeb'];
  
  for (let i = 0; i < steps.length; i++) {
    console.log(`\n🔄 ${i+1}/4: ${labels[i]}...`);
    
    try {
      const response = await fetch(`/api/setup/${steps[i]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_key: authKey })
      });
      
      const data = await response.json();
      console.log(data.success ? '✅' : '⚠️', data);
      
      // Počkat 2s mezi kroky
      if (i < steps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error('❌ Chyba:', error);
    }
  }
  
  console.log('\n🎉 Hotovo! Zkontrolujte výsledky výše.');
};

runMigrations();
```

### **Varianta D: Ručně přes SSH (pokud máte přístup)**

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
