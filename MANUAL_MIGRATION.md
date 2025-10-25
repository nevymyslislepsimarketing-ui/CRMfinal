# 🔧 Manuální Migrace na Render

## Kdy použít:
- Pokud automatická migrace selže
- Pro první nasazení po velkých změnách
- Pro debug migračních problémů

---

## 📋 Postup:

### 1. Otevřete Render Shell

1. Přihlaste se na: https://dashboard.render.com
2. Vyberte **Backend Service**
3. Klikněte na záložku **Shell**
4. Počkejte na načtení terminálu

---

### 2. Spusťte migrace

```bash
cd backend
node scripts/migrateToV3.js
```

**Měli byste vidět:**
```
🚀 Migrace na CRM v3.0.0...
📊 Vytváření tabulky projects...
✅ Tabulka projects vytvořena
...
🎉 Migrace na v3.0.0 úspěšně dokončena!
```

---

### 3. Seed pricing data

```bash
node scripts/seedPricing.js
```

**Měli byste vidět:**
```
🌱 Seed cenové data...
  ✅ Web Basic
  ✅ Web Advanced
  ...
🎉 Seed dokončen! Vloženo 16 služeb.
```

---

### 4. Restart služby

Po úspěšné migraci:
- Render Dashboard → Backend Service
- Klikněte **Manual Deploy** → **Deploy latest commit**
- Nebo počkejte na automatický restart

---

## ✅ Ověření

Test že migrace proběhla:

```bash
cd backend
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query('SELECT * FROM projects LIMIT 1')
  .then(() => console.log('✅ Table projects exists'))
  .catch(err => console.log('❌ Table missing:', err.message))
  .finally(() => pool.end());
"
```

---

## 🆘 Troubleshooting

### Chyba: "relation already exists"
✅ **To je OK!** Znamená že tabulka už existuje. Migrace jsou idempotentní.

### Chyba: "permission denied"
❌ Zkontrolujte DATABASE_URL v Environment variables

### Timeout
- Migrace trvá ~30-60 sekund
- Pokud trvá déle, zkontrolujte databázové logy
- Možná je databáze přetížená

---

## 📝 Poznámky

- **Migrace jsou bezpečné** - kontrolují jestli tabulky už existují
- **Seed je idempotentní** - ignoruje duplicity
- **Lze spustit vícekrát** bez problémů
- **Doporučeno spustit při velkých update**

---

**Pokud máte problém, kontaktujte vývojáře nebo checkujte Render logs!**
