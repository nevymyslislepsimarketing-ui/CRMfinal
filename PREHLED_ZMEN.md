# 📝 Přehled všech změn - Aktualizace nacenování

## 🎯 Shrnutí
Sekce nacenování byla kompletně aktualizována podle nového ceníku z webu. Přidána možnost vytvářet nabídky i pro nové potenciální zákazníky (leady) a generovat profesionálně vypadající PDF nabídky.

---

## 📁 Změněné soubory

### Backend

#### 1. `/backend/package.json`
**Změna:** Přidána závislost `pdfkit` pro generování PDF
```json
"pdfkit": "^0.13.0"
```

#### 2. `/backend/scripts/seedPricing.js`
**Změna:** Kompletně aktualizován ceník služeb podle nového webu
- Nové kategorie: `creative_visual`, `copywriting`, `ads_management`, `marketing_strategy`, `graphics`, `filming`, `web`
- Aktualizované ceny a popisy služeb
- Celkem 15 služeb v novém ceníku

**Nové služby:**
- Kreativní a vizuální služby - Basic (7 000 Kč)
- Kreativní a vizuální služby - Premium (12 000 Kč)
- Copywritingové služby (4 000 Kč)
- Správa reklamních kampaní (5 000 Kč)
- Marketingové strategie - Měsíční (5 500 Kč)
- Marketingové strategie - Úvodní balík (15 000 Kč)
- Grafické práce (od 1 000 Kč)
- Vizuální identita (od 15 000 Kč)
- Budget Friendly natáčení (od 1 000 Kč)
- Filmová produkce (od 3 000 Kč)
- Jednostránkový web (10 000 Kč)
- Multipage web (15 000 Kč)
- E-shop (25 000 Kč)
- CRM systémy (50 000 Kč)

#### 3. `/backend/routes/pricing.js`
**Změny:**
- Přidány importy: `PDFDocument`, `fs`, `path`
- Upravena funkce `POST /quotes`:
  - Podpora pro `lead_data` (údaje o novém leadovi)
  - Parametr `create_lead` pro vytvoření leadu v pipeline
  - Vytváření leadu přímo z nabídky
  - Ukládání `pipeline_id` vedle `client_id`
- Přidán endpoint `GET /quotes/:id/pdf`:
  - Generování profesionálního PDF s brandingem
  - Header s logem a kontaktními údaji
  - Tabulka služeb s cenami
  - Celkové náklady (měsíční + jednorázové)
  - Footer s čísly stránek
  - Pastelové barvy z webu (fialová #A794E8, oranžová #FFD6BA)

#### 4. `/backend/scripts/addPipelineToQuotes.js` ✨ NOVÝ SOUBOR
**Účel:** Databázová migrace
- Přidává sloupec `pipeline_id` do tabulky `client_quotes`
- Nastavuje `client_id` jako nullable
- Přidává check constraint (buď `client_id` nebo `pipeline_id` musí být vyplněno)

---

### Frontend

#### 5. `/frontend/src/pages/Pricing.jsx`
**Změny:**
- Přidány importy: `Download`, `UserPlus` z lucide-react
- Nový state:
  - `isNewLead` - toggle mezi existujícím klientem a novým leadem
  - `leadData` - objekt s údaji o novém leadovi (company_name, contact_person, email, phone, notes)
- Aktualizované `categoryLabels` podle nového ceníku:
  - `creative_visual`, `copywriting`, `ads_management`, `marketing_strategy`, `graphics`, `filming`, `web`
- Upravená funkce `handleSaveQuote()`:
  - Validace pro nové leady
  - Podpora pro vytvoření leadu
  - Odlišné zprávy pro leady vs. klienty
  - Reset formuláře po úspěšném uložení
- Nová funkce `handleDownloadPDF()`:
  - Stažení PDF nabídky
  - Blob response type
  - Automatické vytvoření download linku
- UI změny:
  - Toggle tlačítka "Existující klient" / "Nový lead"
  - Formulář pro vytvoření nového leadu (5 polí)
  - Tlačítko "Stáhnout PDF" u každé nabídky v historii
  - Podmíněné zobrazení checkboxu "Aplikovat jako pravidelnou fakturaci"
  - Dynamický text na Save tlačítku

---

## 📄 Nové soubory

### Dokumentace

#### 6. `/AKTUALIZACE_NACENOVANI.md` ✨ NOVÝ
Kompletní dokumentace změn včetně:
- Seznam všech změn
- Instalační instrukce
- Testovací scénáře
- Známé problémy
- Návrhy na další vylepšení

#### 7. `/SPUSTENI_AKTUALIZACE.md` ✨ NOVÝ
Rychlý návod pro spuštění:
- Krok za krokem instrukce
- Příklady použití
- Nový ceník přehledně
- Troubleshooting

#### 8. `/PREHLED_ZMEN.md` ✨ NOVÝ (tento soubor)
Detailní přehled všech změněných souborů.

---

## 🗄️ Databázové změny

### Tabulka: `client_quotes`
**Nové sloupce:**
- `pipeline_id` (INTEGER, nullable, foreign key → pipeline.id)

**Upravené sloupce:**
- `client_id` (nyní nullable místo NOT NULL)

**Nové constraints:**
- `check_client_or_lead` - alespoň jeden z `client_id` nebo `pipeline_id` musí být vyplněno

---

## 🎨 Grafické prvky v PDF

### Použité barvy
- **Header background:** #A794E8 (pastelová fialová)
- **Tabulka header:** #FFD6BA (pastelová oranžová)
- **Měsíční náklady:** #A794E8 (fialová)
- **Jednorázové náklady:** #FFBD98 (oranžová tmavší)

### Struktura PDF
1. Header s logem a kontakty
2. Nadpis nabídky
3. Datum vytvoření
4. Informace o příjemci (klient/lead)
5. Tabulka služeb
6. Celkové náklady (měsíční, jednorázové, celkem)
7. Poznámky (pokud existují)
8. Footer s kontaktními údaji a číslem stránky

---

## 📊 Statistiky změn

- **Změněné soubory:** 5
- **Nové soubory:** 4
- **Přidané řádky kódu:** ~800
- **Nové služby v ceníku:** 15
- **Nové API endpointy:** 1 (GET /pricing/quotes/:id/pdf)
- **Nové databázové sloupce:** 1 (pipeline_id)

---

## ✅ Checklist pro deployment

- [ ] Spustit `npm install` v backendu
- [ ] Spustit migraci: `node scripts/addPipelineToQuotes.js`
- [ ] Spustit seed ceníku: `npm run seed:pricing`
- [ ] Restartovat backend server
- [ ] Testovat vytvoření nabídky pro klienta
- [ ] Testovat vytvoření nabídky pro nového leadu
- [ ] Testovat stažení PDF
- [ ] Ověřit, že lead se objevil v Pipeline
- [ ] Ověřit grafiku PDF (barvy, layout)

---

## 🔄 Zpětná kompatibilita

- ✅ Existující nabídky zůstávají funkční
- ✅ Starý flow pro klienty funguje bez změn
- ✅ Lze stáhnout PDF i pro staré nabídky
- ⚠️ Potřeba spustit migraci databáze před použitím!

---

## 🚀 Hotovo!

Všechny změny jsou implementovány a připraveny k nasazení. Pro spuštění následujte instrukce v souboru `SPUSTENI_AKTUALIZACE.md`.
