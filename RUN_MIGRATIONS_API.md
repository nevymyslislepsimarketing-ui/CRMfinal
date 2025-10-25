# ⚡ Spustit Migrace přes API (BEZ Shell)

## 🎯 Pro FREE Render tier (bez Shell přístupu)

---

## 📋 Postup (2 minuty):

### KROK 1: Počkat na deployment

Po push do Gitu počkejte až Render dokončí deployment (~2-3 min).

**Zkontrolujte:** https://dashboard.render.com → Backend Service → **Logs**

Mělo by být:
```
✅ Build successful
✅ Deploying...
✅ Live
Server listening on port 5001
```

---

### KROK 2: Spustit migrace přes API

**Použijte curl nebo Postman:**

```bash
curl -X POST https://VASE-BACKEND.onrender.com/api/setup/run-migrations \
  -H "Content-Type: application/json" \
  -d '{"auth_key": "nevymyslis-setup-2025"}'
```

**NEBO v prohlížeči (jednodušší):**

1. Otevřete Developer Tools (F12)
2. Console
3. Vložte:

```javascript
fetch('https://VASE-BACKEND.onrender.com/api/setup/run-migrations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ auth_key: 'nevymyslis-setup-2025' })
})
.then(r => r.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

**Nahraďte** `VASE-BACKEND.onrender.com` vaší skutečnou Render URL!

---

### KROK 3: Ověření

**Response by měl být:**

```json
{
  "success": true,
  "message": "Migrations completed successfully",
  "output": {
    "migration": "🚀 Migrace na CRM v3.0.0...\n✅ Všechny tabulky vytvořeny\n...",
    "seed": "🌱 Seed cenové data...\n✅ 16 služeb přidáno\n..."
  }
}
```

**Zkontrolujte v aplikaci:**
- Otevřete **Naceňování**
- Měli byste vidět **16 služeb** ✅

---

## 🔐 Bezpečnost

### Auth Key

Endpoint je chráněný klíčem: `nevymyslis-setup-2025`

**Pro produkci můžete změnit:**

1. Render Dashboard → Backend Service → Environment
2. Přidejte proměnnou:
   ```
   SETUP_KEY=vase-tajne-heslo-2025
   ```
3. Použijte toto heslo místo defaultního

---

## 🔍 Status Check

**Zkontrolovat jestli migrace už proběhly:**

```bash
curl https://VASE-BACKEND.onrender.com/api/setup/status
```

**Response:**
```json
{
  "setupCompleted": true,
  "message": "Setup has been completed"
}
```

---

## ✅ Jak to funguje:

1. **Endpoint:** `/api/setup/run-migrations`
2. **Metoda:** POST
3. **Auth:** Heslo v body nebo header
4. **Spustí:**
   - `node scripts/migrateToV3.js` (vytvoří tabulky)
   - `node scripts/seedPricing.js` (přidá 16 služeb)
5. **Jednou:** Po dokončení se označí jako hotové
6. **Bezpečné:** Lze spustit vícekrát (idempotentní)

---

## 🆘 Troubleshooting

### 403 Unauthorized
❌ Špatný auth_key - zkontrolujte heslo

### 500 Internal Server Error
❌ Zkontrolujte Render logs pro detaily

### Timeout
⏳ Migrace běží ~30-60 sekund. Počkejte nebo zkuste znovu.

### "Setup already completed"
✅ Migrace už proběhly! Zkontrolujte aplikaci.

---

## 📝 Příklad s různými metodami:

### cURL:
```bash
curl -X POST https://vase-backend.onrender.com/api/setup/run-migrations \
  -H "Content-Type: application/json" \
  -d '{"auth_key": "nevymyslis-setup-2025"}'
```

### JavaScript (browser):
```javascript
fetch('https://vase-backend.onrender.com/api/setup/run-migrations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ auth_key: 'nevymyslis-setup-2025' })
}).then(r => r.json()).then(console.log);
```

### Python:
```python
import requests

response = requests.post(
    'https://vase-backend.onrender.com/api/setup/run-migrations',
    json={'auth_key': 'nevymyslis-setup-2025'}
)
print(response.json())
```

---

**Po dokončení máte funkční CRM v3.0.0 BEZ Shell přístupu!** 🎉
