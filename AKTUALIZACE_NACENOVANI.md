# Aktualizace sekce nacenování

## Co bylo provedeno

### 1. ✅ Aktualizován ceník služeb
- Aktualizován soubor `/backend/scripts/seedPricing.js` s novými cenami podle HTML z webu
- Nové kategorie služeb:
  - **Kreativní a vizuální služby** (Basic od 7 000 Kč, Premium od 12 000 Kč)
  - **Copywritingové služby** (od 4 000 Kč)
  - **Správa reklamních kampaní** (od 5 000 Kč)
  - **Marketingové strategie** (měsíční od 5 500 Kč + úvodní balík od 15 000 Kč)
  - **Grafické práce** (od 1 000 Kč)
  - **Vizuální identita** (od 15 000 Kč)
  - **Natáčení Budget Friendly** (iPhone, od 1 000 Kč)
  - **Natáčení Filmová produkce** (od 3 000 Kč)
  - **Weby** (jednostránkový 10 000 Kč, multipage 15 000 Kč, e-shop 25 000 Kč, CRM 50 000 Kč)

### 2. ✅ Podpora pro leady (ne-klienty)
- Backend upraven pro možnost vytvořit nabídku pro nové potenciální zákazníky
- Nové leady se automaticky ukládají do pipeline s stage "lead"
- Databázová migrace pro přidání `pipeline_id` do `client_quotes`

### 3. ✅ PDF generování nabídek
- Přidán endpoint `/pricing/quotes/:id/pdf` pro generování PDF
- Hezká grafická šablona v barvách Nevymyslíš (pastelové fialová a oranžová)
- PDF obsahuje:
  - Logo a branding
  - Informace o klientovi/leadovi
  - Tabulka služeb s cenami
  - Celkové měsíční a jednorázové náklady
  - Poznámky a úpravy
  - Footer s kontaktními informacemi

### 4. ✅ Upravené frontend rozhraní
- Toggle mezi "Existující klient" a "Nový lead"
- Formulář pro zadání údajů nového leadu
- Tlačítko "Stáhnout PDF" u každé nabídky
- Aktualizované kategorie služeb v souladu s novým ceníkem

## Instalace a spuštění

### 1. Instalace nových závislostí
```bash
cd backend
npm install
```

### 2. Spuštění databázové migrace
```bash
# Přidat sloupec pipeline_id do client_quotes
node scripts/addPipelineToQuotes.js
```

### 3. Aktualizace ceníku v databázi
```bash
# Nahrát nový ceník služeb
npm run seed:pricing
```

### 4. Restart serveru
```bash
# Development
npm run dev

# Production
npm start
```

## Testování

### Test 1: Vytvoření nabídky pro existujícího klienta
1. Přejděte do sekce "Naceňování"
2. Vyberte "Existující klient" a vyberte klienta ze seznamu
3. Vyberte některé služby z ceníku
4. Vyplňte název nabídky (volitelné)
5. Přidejte poznámky (volitelné)
6. Zaškrtněte "Aplikovat jako pravidelnou fakturaci" pokud chcete
7. Klikněte na "Uložit nabídku"
8. Ověřte, že nabídka byla vytvořena a zobrazuje se v historii

### Test 2: Vytvoření nabídky pro nového leadu
1. Přejděte do sekce "Naceňování"
2. Klikněte na "Nový lead"
3. Vyplňte údaje o firmě (název firmy je povinný)
4. Vyberte služby z ceníku
5. Klikněte na "Vytvořit lead a nabídku"
6. Ověřte, že byl vytvořen nový lead v Pipeline
7. Přejděte do sekce "Pipeline" a ověřte, že tam je nový lead

### Test 3: Stažení PDF nabídky
1. V sekci "Naceňování" vyberte existujícího klienta s nabídkami
2. U některé nabídky klikněte na tlačítko "PDF"
3. Ověřte, že se stáhne PDF soubor
4. Otevřete PDF a zkontrolujte:
   - Správné logo a branding
   - Informace o klientovi/leadovi
   - Seznam služeb s cenami
   - Celkové ceny (měsíční a jednorázové)
   - Footer s kontaktními údaji

### Test 4: Upravené ceny služeb
1. V sekci "Naceňování" zkontrolujte, že služby odpovídají novému ceníku
2. Ověřte kategorie:
   - Kreativní a vizuální služby (Basic a Premium)
   - Copywriting
   - Správa reklam
   - Marketingové strategie
   - Grafika a vizuální identita
   - Natáčení (Budget a Premium)
   - Weby a systémy

## Známé problémy a poznámky

1. **Constraint na databázi**: Přidán check constraint - buď `client_id` nebo `pipeline_id` musí být vyplněno
2. **PDF knihovna**: Používá se `pdfkit` - nemusí podporovat custom fonty bez dodatečné konfigurace
3. **Logo v PDF**: Momentálně je použit text místo obrázku loga - můžete přidat logo jako obrázek pokud chcete

## Další vylepšení (volitelné)

- [ ] Přidat možnost upravit ceny služeb přímo v CRM
- [ ] Přidat šablony nabídek
- [ ] Přidat možnost poslat PDF emailem přímo z CRM
- [ ] Přidat logo jako obrázek do PDF (místo textu)
- [ ] Přidat custom fonty do PDF
- [ ] Přidat možnost duplikovat nabídku
- [ ] Přidat možnost konvertovat nabídku na fakturu
