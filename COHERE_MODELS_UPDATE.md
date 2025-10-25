# ⚠️ Cohere API - Update Modelů (2025)

## 🚨 Důležité změny (15.9.2025)

### Odstraněné modely:
- ❌ `command` (starý model)
- ❌ `command-r` (první verze R)
- ❌ **Generate API** (celý endpoint `/v1/generate`)

### Aktuální modely (říjen 2025):

| Model | Použití | Rychlost | Kvalita | Cena |
|-------|---------|----------|---------|------|
| **command-r-plus** | ✅ **Doporučený** | Střední | Nejvyšší | Střední |
| `command-r7b-12-2024` | Efektivní | Rychlá | Vysoká | Nízká |
| `command-light` | Základní úkoly | Nejrychlejší | Střední | Nejnižší |

---

## ✅ Naše implementace

### Aktuální nastavení:
```javascript
model: 'command-r-plus'  // ✅ Funkční od října 2025
```

### API endpoint:
```javascript
https://api.cohere.ai/v1/chat  // ✅ Nové Chat API (2025)
```

---

## 📊 Výhody command-r-plus:

1. ✅ **Nejlepší kvalita** výstupu
2. ✅ **Výborná podpora češtiny**
3. ✅ **Kontextové porozumění**
4. ✅ **Dlouhodobá podpora** (aktuální model)
5. ✅ **Lepší než starý command**

---

## 🔄 Migrace proběhla:

- ✅ `/v1/generate` → `/v1/chat`
- ✅ `command` → `command-r-plus`
- ✅ Request struktura aktualizována
- ✅ Response parsing aktualizován
- ✅ Dokumentace aktualizována

---

## 📝 Kde jsme to změnili:

1. ✅ `backend/routes/ai-captions.js` - Hlavní implementace
2. ✅ `AI_CAPTIONS_SETUP.md` - Dokumentace
3. ✅ `IMPLEMENTATION_SUMMARY_V3.md` - Přehled

---

## 💡 Pokud chcete změnit model:

V souboru `backend/routes/ai-captions.js`:

```javascript
body: JSON.stringify({
  model: 'command-r-plus',  // Změnit zde
  message: prompt,
  ...
})
```

**Dostupné alternativy:**
- `command-r7b-12-2024` - Rychlejší, levnější
- `command-light` - Nejrychlejší, základní funkce

---

## 🔗 Odkazy:

- [Cohere Models dokumentace](https://docs.cohere.com/docs/models)
- [Chat API dokumentace](https://docs.cohere.com/docs/chat-api)
- [Migrace z Generate na Chat](https://docs.cohere.com/docs/migrating-from-cogenerate-to-cochat)

---

**Poslední update:** 26.10.2025  
**Status:** ✅ Plně funkční s command-r-plus
