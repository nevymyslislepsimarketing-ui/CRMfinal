# 🔢 Automatické číslování faktur - Dokončeno!

## ✅ CO BYLO ZMĚNĚNO

### **Nový formát čísel faktur: RRRRMMXXXXX**

**Příklady:**
- `202510001` - První faktura v říjnu 2025
- `202510002` - Druhá faktura v říjnu 2025
- `202511001` - První faktura v listopadu 2025
- `202601234` - 234. faktura v lednu 2026

**Struktura:**
- `RRRR` - rok (4 číslice)
- `MM` - měsíc (2 číslice, 01-12)
- `XXXXX` - pořadové číslo v rámci měsíce (5 číslic)

---

## 🎯 JAK TO FUNGUJE

### **Vytvoření faktury:**

1. **Manažer vyplní formulář:**
   - Vybere klienta
   - Zadá částku
   - Napíše popis služeb
   - **Vybere datum vystavení** ← KLÍČOVÉ pro číslo
   - Datum splatnosti

2. **Backend automaticky:**
   - Přečte datum vystavení
   - Zjistí rok a měsíc (např. 2025-10)
   - Najde poslední fakturu s prefixem `202510`
   - Přičte +1 k pořadovému číslu
   - Vygeneruje: `202510001`, `202510002`, atd.

3. **Číslo se zobrazí:**
   - V seznamu faktur
   - Na PDF faktuře
   - Nelze ho už změnit

---

## 🔒 CO NELZE ZMĚNIT PO VYTVOŘENÍ

**Při editaci faktury jsou uzamčená:**
1. ❌ **Číslo faktury** - zobrazeno jako read-only
2. ❌ **Datum vystavení** - read-only (určuje číslo)

**Lze změnit:**
3. ✅ Klient
4. ✅ Částka
5. ✅ Popis služeb
6. ✅ Datum splatnosti
7. ✅ Status (zaplaceno/nezaplaceno)

---

## 📋 Technické detaily

### Backend logika:

```javascript
// 1. Přečíst datum vystavení
const issuedDate = new Date(issued_at);
const year = issuedDate.getFullYear();      // 2025
const month = String(issuedDate.getMonth() + 1).padStart(2, '0');  // "10"
const prefix = `${year}${month}`;            // "202510"

// 2. Najít poslední fakturu s tímto prefixem
SELECT invoice_number FROM invoices 
WHERE invoice_number LIKE '202510%' 
ORDER BY invoice_number DESC LIMIT 1

// 3. Přičíst +1
// Pokud poslední bylo 202510005, nové bude 202510006
// Pokud žádná neexistuje, začne 202510001

// 4. Vygenerovat s 5místným pořadovým číslem
const invoice_number = `${prefix}${String(sequenceNumber).padStart(5, '0')}`;
```

---

## 🎨 UI změny

### **Formulář nové faktury:**

```
┌────────────────────────────────────────────┐
│ ℹ️ Číslo faktury se vygeneruje automaticky │
│ Formát: RRRRMMXXXXX (např. 202510001)      │
└────────────────────────────────────────────┘

Klient: [Dropdown] *
Částka: [____] Kč *
Popis služeb: [Textarea] *
Datum vystavení: [2025-10-21] *  ← Určuje číslo
Datum splatnosti: [2025-11-21] *
```

### **Formulář editace faktury:**

```
Číslo faktury: [202510001] 🔒 (nelze měnit)

Klient: [Dropdown] *
Částka: [____] Kč *
Popis služeb: [Textarea] *
Datum vystavení: [2025-10-21] 🔒 (nelze měnit)
⚠️ Datum vystavení nelze měnit
Datum splatnosti: [2025-11-21] *
```

---

## 🧪 JAK TO OTESTOVAT

### Test 1: První faktura v měsíci
1. Faktury → Přidat fakturu
2. Vyberte datum: **21. 10. 2025**
3. Vyplňte ostatní pole
4. Uložte
5. ✅ **Číslo: 202510001**

### Test 2: Další faktura ve stejném měsíci
1. Přidat další fakturu
2. Datum: **25. 10. 2025**
3. Uložte
4. ✅ **Číslo: 202510002**

### Test 3: Faktura v novém měsíci
1. Přidat fakturu
2. Datum: **5. 11. 2025**
3. Uložte
4. ✅ **Číslo: 202511001** (začíná znovu od 1)

### Test 4: Editace
1. Upravte existující fakturu 202510001
2. Zkuste změnit číslo faktury
3. ✅ **Pole je zamčené** (read-only)
4. Zkuste změnit datum vystavení
5. ✅ **Pole je zamčené** (read-only)
6. Změňte částku nebo popis
7. ✅ **Lze uložit** (ostatní pole fungují)

---

## 📊 Příklady číslování

**Říjen 2025:**
- 202510001
- 202510002
- 202510003
- ...
- 202510099
- 202510100

**Listopad 2025:**
- 202511001 ← Začíná znovu od 1
- 202511002
- ...

**Leden 2026:**
- 202601001 ← Nový rok
- 202601002
- ...

---

## 🎯 Výhody nového systému

1. ✅ **Automatické** - Žádné manuální zadávání
2. ✅ **Unikátní** - Nemůžou vzniknout duplicity
3. ✅ **Chronologické** - Řazení podle data
4. ✅ **Přehledné** - Vidíte rok a měsíc hned z čísla
5. ✅ **Standardní** - Běžný formát pro české firmy
6. ✅ **Neměnné** - Po vytvoření nelze změnit
7. ✅ **Sekvenční** - V každém měsíci od 1

---

## ⚠️ DŮLEŽITÉ POZNÁMKY

### **Datum vystavení určuje číslo:**
- Pokud vytvoříte fakturu s datem 15.10.2025, dostane číslo 202510XXX
- I když to vytvoříte 20.10.2025, číslo bude podle datumu vystavení
- Proto **nelze měnit datum vystavení** po vytvoření

### **Čísla nejsou globálně unikátní:**
- 202510001 existuje jen jedno
- 202511001 je jiná faktura (jiný měsíc)
- To je v pořádku a standardní

### **Maximální kapacita:**
- 99,999 faktur za měsíc (5 číslic)
- To je více než dostatečné

---

## �� HOTOVO!

Automatické číslování faktur je implementováno:

1. ✅ **Formát RRRRMMXXXXX**
2. ✅ **Automatické generování**
3. ✅ **Sekvenční v rámci měsíce**
4. ✅ **Neměnné po vytvoření**
5. ✅ **UI informuje uživatele**

**Faktury jsou připraveny k profesionálnímu použití! 🔢✨**
