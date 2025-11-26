# 🚀 Rychlý návod na spuštění aktualizace nacenování

## 📋 Co je nové

### ✨ Nové funkce
1. **Aktualizovaný ceník** - služby odpovídají novému webu
2. **Nabídky pro ne-klienty** - možnost vytvořit nabídku i pro nové leady
3. **PDF nabídky** - krásně graficky zpracované cenové nabídky ke stažení

## 🔧 Jak spustit (DŮLEŽITÉ!)

### Krok 1: Instalace závislostí
```bash
cd backend
npm install
```
✅ **HOTOVO** - závislosti už jsou nainstalovány!

### Krok 2: Spuštění migrace databáze
```bash
cd backend
node scripts/addPipelineToQuotes.js
```
Toto přidá sloupec `pipeline_id` do tabulky `client_quotes`.

### Krok 3: Aktualizace ceníku
```bash
cd backend
npm run seed:pricing
```
Toto nahraje nový ceník služeb do databáze.

### Krok 4: Restart aplikace
```bash
# Backend
cd backend
npm run dev

# Frontend (v novém terminálu)
cd frontend
npm run dev
```

## 🎯 Jak to použít

### Vytvoření nabídky pro NOVÉHO zákazníka (lead)
1. Otevřete CRM → **Naceňování**
2. Klikněte na tlačítko **"Nový lead"**
3. Vyplňte údaje o firmě:
   - **Název firmy** (povinné)
   - Kontaktní osoba
   - Email
   - Telefon
   - Poznámky
4. Vyberte služby z ceníku
5. Klikněte **"Vytvořit lead a nabídku"**
6. ✅ Lead se automaticky uloží do Pipeline!

### Vytvoření nabídky pro EXISTUJÍCÍHO klienta
1. Otevřete CRM → **Naceňování**
2. Zůstaňte na **"Existující klient"**
3. Vyberte klienta ze seznamu
4. Vyberte služby z ceníku
5. Zaškrtněte **"Aplikovat jako pravidelnou fakturaci"** pokud chcete
6. Klikněte **"Uložit nabídku"**

### Stažení PDF nabídky
1. V sekci **Naceňování** vyberte klienta
2. V historii nabídek klikněte na tlačítko **"PDF"** 📄
3. PDF se automaticky stáhne!

## 📊 Nový ceník služeb

### Pravidelné služby (měsíčně)
- **Kreativní a vizuální služby Basic**: od 7 000 Kč/měsíc
- **Kreativní a vizuální služby Premium**: od 12 000 Kč/měsíc
- **Copywriting**: od 4 000 Kč/měsíc
- **Správa reklamních kampaní**: od 5 000 Kč/měsíc
- **Marketingové strategie**: od 5 500 Kč/měsíc

### Jednorázové služby
- **Grafické práce**: od 1 000 Kč
- **Vizuální identita**: od 15 000 Kč
- **Natáčení Budget (iPhone)**: od 1 000 Kč
- **Natáčení Premium (kamera)**: od 3 000 Kč
- **Jednostránkový web**: od 10 000 Kč
- **Multipage web**: od 15 000 Kč
- **E-shop**: od 25 000 Kč
- **CRM systémy**: od 50 000 Kč

## ⚠️ Poznámky

1. **Nezapomeňte spustit migraci!** Bez migrace nebude fungovat ukládání leadů.
2. **Nezapomeňte aktualizovat ceník!** Bez toho budete vidět starý ceník.
3. **PDF obsahuje vaše branding** - pastelové barvy z vašeho webu (fialová a oranžová)

## 🐛 V případě problémů

Pokud něco nefunguje, zkontrolujte:
1. ✅ Běží backend server?
2. ✅ Běží frontend server?
3. ✅ Spustili jste migraci databáze?
4. ✅ Spustili jste seed ceníku?
5. ✅ Máte nainstalované závislosti (`npm install`)?

## 📞 Kontakt
V případě problémů kontaktujte vývojáře! 😊
