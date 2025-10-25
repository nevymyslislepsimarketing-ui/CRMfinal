# ⚡ SPUSTIT MIGRACE NYNÍ

## 🚨 Rychlý návod - 2 minuty

### Problém:
- ❌ Backend běží, ale tabulky chybí (`ai_post_history`, atd.)
- ❌ Žádné služby v naceňování
- ❌ Některé funkce nefungují

### Řešení: Spustit migrace MANUÁLNĚ

---

## 📋 Postup (3 kroky):

### 1. Otevřete Render Shell

https://dashboard.render.com

1. Klikněte na **Backend Service** (nevymyslis-crm-backend)
2. Záložka **Shell** (vedle Logs)
3. Počkejte až se načte terminál (~5 sec)

---

### 2. Spusťte migrace + seed

**Zkopírujte a spusťte:**

```bash
cd backend && node scripts/migrateToV3.js && node scripts/seedPricing.js
```

**Měli byste vidět:**
```
🚀 Migrace na CRM v3.0.0...
📊 Vytváření tabulky projects...
✅ Tabulka projects vytvořena
📋 Vytváření tabulky project_milestones...
✅ Tabulka project_milestones vytvořena
...
📊 Vytváření tabulky ai_post_history...
✅ Tabulka ai_post_history vytvořena
...
🎉 Migrace na v3.0.0 úspěšně dokončena!
🌱 Seed cenové data...
  ✅ Web Basic
  ✅ Web Advanced
  ✅ E-shop Basic
  ...
🎉 Seed dokončen! Vloženo 16 služeb.
```

---

### 3. Hotovo!

**Ověření:**
- Otevřete aplikaci
- Přejděte do **Naceňování**
- Měli byste vidět 16 služeb ✅

---

## ✅ Co to udělá:

1. **Vytvoří nové tabulky:**
   - projects, project_milestones, project_team, project_checklist
   - ai_post_history
   - service_pricing, client_quotes
   - one_time_invoices, invoice_splits

2. **Aktualizuje existující:**
   - Přidá sloupce do clients (google_drive_link)
   - Aktualizuje statusy úkolů
   - Vytvoří indexy

3. **Naplní data:**
   - 16 služeb do ceníku (Web, E-shop, SEO, atd.)

---

## 🆘 Co když to selže?

### "relation already exists"
✅ **To je OK!** Některé tabulky už existují z předchozích pokusů.
Script pokračuje dál.

### "permission denied"
❌ Zkontrolujte že jste ve správném Shell (backend service)

### Jakýkoliv jiný error
- Zkopírujte error message
- Zkontrolujte DATABASE_URL v Environment variables
- Případně restartujte service a zkuste znovu

---

## 📝 Poznámky:

- **Bezpečné** - Migrace kontrolují co už existuje
- **Idempotentní** - Lze spustit vícekrát
- **Rychlé** - ~30-60 sekund
- **Nutné** - Pro funkční v3.0.0

---

**Po dokončení máte funkční CRM v3.0.0!** 🎉
