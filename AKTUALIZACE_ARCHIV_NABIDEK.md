# Aktualizace - Archiv nabídek a opravy

## 🎯 Co bylo opraveno a přidáno

### 1. ✅ Nová stránka: Archiv cenových nabídek
Vytvořena kompletní stránka pro správu všech cenových nabídek.

**Funkce:**
- 📄 **Zobrazení všech nabídek** - přehledný grid se všemi vytvořenými nabídkami
- 🔍 **Vyhledávání** - filtrování podle názvu nabídky, klienta, autora
- 📥 **Stažení PDF** - tlačítko pro stažení PDF nabídky
- ✏️ **Úprava nabídek** - možnost upravit název a poznámky
- 🗑️ **Mazání nabídek** - smazání nabídky s potvrzením
- 🏷️ **Badge pro leady** - vizuální označení, zda je nabídka pro lead nebo klienta

**Cesta:** `/quotes-archive`

### 2. ✅ Viditelný odkaz na archiv v Pricing
- Přidán výrazný banner v sekci Naceňování
- Přímý link na archiv nabídek
- Jasný popis funkcionality

### 3. ✅ Opravené zobrazení leadů
- Backend endpointy nyní správně vrací informace o leadech
- LEFT JOIN na tabulku `pipeline` pro zobrazení údajů o leadech
- Nabídky pro leady se nyní správně zobrazují s označením

### 4. ✅ Leady jsou editovatelné v Pipeline
- Leady vytvořené z nacenování jsou plně editovatelné
- Tlačítka Edit a Delete fungují pro všechny leady
- Žádné omezení pro úpravu leadů z nabídek

## 📁 Nové/změněné soubory

### Frontend
1. **`/frontend/src/pages/QuotesArchive.jsx`** ✨ NOVÝ
   - Kompletní stránka archivu nabídek
   - Grid view s kartami nabídek
   - Vyhledávání a filtrace
   - Modální okno pro úpravy
   - PDF download funkce

2. **`/frontend/src/App.jsx`**
   - Import QuotesArchive komponenty
   - Přidána route `/quotes-archive`

3. **`/frontend/src/components/Layout.jsx`**
   - Přidán odkaz "Archiv nabídek" do sekce Finance v navigaci

4. **`/frontend/src/pages/Pricing.jsx`**
   - Přidán import Link a nové ikony (FileText, ArrowRight)
   - Přidán banner s odkazem na archiv nabídek
   - Banner umístěn hned pod header

### Backend
5. **`/backend/routes/pricing.js`**
   - Rozšířen endpoint `GET /quotes` o LEFT JOIN na pipeline
   - Přidány sloupce pro lead data (company_name, contact_person, email, phone)
   - Rozšířen endpoint `GET /quotes/:id` o stejná data
   - Nyní správně vrací informace jak o klientech, tak o leadech

## 🎨 UI komponenty

### Banner v Pricing
```jsx
- Gradient pozadí (purple to orange)
- Ikona FileText v fialovém boxu
- Hover efekt s animací šipky
- Responsive design
```

### Karty v archivu
```jsx
- Grid layout (1-3 sloupce dle velikosti obrazovky)
- Informace o příjemci s badge "Lead"
- Zobrazení cen (měsíčně/jednorázově)
- Seznam služeb (max 3 + "další...")
- 3 akce: PDF, Edit, Delete
```

### Modální okno pro úpravy
```jsx
- Úprava názvu nabídky
- Úprava poznámek
- Zobrazení základních info (pro koho, cena)
- Tlačítka Uložit/Zrušit
```

## 🔧 Technické detaily

### Backend změny v SQL queries

**Původní query:**
```sql
SELECT q.*, c.name as client_name, u.name as created_by_name
FROM client_quotes q
LEFT JOIN clients c ON q.client_id = c.id
LEFT JOIN users u ON q.created_by = u.id
```

**Nový query:**
```sql
SELECT q.*, 
  c.name as client_name,
  c.email as client_email,
  c.phone as client_phone,
  p.company_name as lead_company_name,
  p.contact_person as lead_contact_person,
  p.email as lead_email,
  p.phone as lead_phone,
  u.name as created_by_name
FROM client_quotes q
LEFT JOIN clients c ON q.client_id = c.id
LEFT JOIN pipeline p ON q.pipeline_id = p.id
LEFT JOIN users u ON q.created_by = u.id
```

### Navigace
- Archiv nabídek přidán do dropdown "Finance"
- Umístění: Finance → Archiv nabídek
- Ikona: FileText
- Viditelnost: pouze pro manažery

## 📊 Funkce archivu

### Vyhledávání
- Real-time filtrace při psaní
- Vyhledává v:
  - Názvu nabídky
  - Jménu klienta/firmy
  - Jménu autora nabídky

### Zobrazení nabídek
- Grid layout s kartami
- Každá karta obsahuje:
  - Název nabídky
  - Jméno příjemce (klient/lead)
  - Badge "Lead" pokud jde o lead
  - Datum vytvoření
  - Autor nabídky
  - Měsíční a jednorázové ceny
  - První 3 služby (+ počet dalších)
  - 3 akční tlačítka

### Akce
1. **📥 Stáhnout PDF** - stáhne PDF nabídky (zelené tlačítko)
2. **✏️ Upravit** - otevře modal pro úpravu (šedé tlačítko)
3. **🗑️ Smazat** - smaže nabídku po potvrzení (červené tlačítko)

### Statistika
- Banner nahoře zobrazuje celkový počet nabídek
- Badge s číslem zvýrazněný

## 🐛 Opravené problémy

### 1. PDF tlačítko nebylo vidět
**Problém:** PDF tlačítko bylo pouze v historii nabídek u vybraného klienta
**Řešení:** 
- Přidán archiv se všemi nabídkami
- Výrazný banner s odkazemna archiv
- PDF tlačítko u každé nabídky v archivu

### 2. Leady nebyly vidět v nabídkách
**Problém:** Backend nevrací informace o leadech
**Řešení:** 
- Přidán LEFT JOIN na tabulku pipeline
- Vrací se všechna data o leadech (company_name, contact_person, email, phone)
- Frontend zobrazuje lead data místo client data pokud není client

### 3. Nejasné, kde jsou nabídky
**Problém:** Uživatel nevěděl, kde najít všechny nabídky
**Řešení:**
- Nová stránka Archiv nabídek
- Odkaz v navigaci (Finance → Archiv nabídek)
- Banner v sekci Naceňování s odkazem

## ✅ Testování

### Kontrolní seznam
- [ ] Archiv nabídek se zobrazuje správně
- [ ] Vyhledávání funguje
- [ ] PDF se stahuje pro všechny nabídky
- [ ] Úprava nabídky funguje
- [ ] Mazání nabídky funguje
- [ ] Leady se zobrazují s badge "Lead"
- [ ] Info o leadech se zobrazuje správně
- [ ] Banner v Pricing vede na archiv
- [ ] Navigace obsahuje odkaz na archiv

### Testovací scénáře

**Scénář 1: Zobrazení archivu**
1. Přihlaste se do CRM
2. Finance → Archiv nabídek
3. Měly by se zobrazit všechny nabídky

**Scénář 2: Vyhledávání**
1. V archivu zadejte do vyhledávacího pole název
2. Seznam by se měl filtrovat v reálném čase

**Scénář 3: Stažení PDF**
1. U některé nabídky klikněte na "PDF"
2. PDF by se mělo stáhnout

**Scénář 4: Úprava nabídky**
1. Klikněte na ikonu tužky u nabídky
2. Změňte název nebo poznámky
3. Klikněte Uložit
4. Změny by se měly projevit

**Scénář 5: Nabídka pro lead**
1. Vytvořte nabídku pro nový lead v Pricing
2. Přejděte do archivu
3. Nabídka by měla mít badge "Lead"
4. Měly by se zobrazit údaje o firmě

## 🚀 Jak použít

### Vytvoření nabídky pro lead
1. Naceňování → "Nový lead"
2. Vyplňte údaje o firmě
3. Vyberte služby
4. Uložit → Lead se vytvoří v Pipeline

### Zobrazení všech nabídek
1. Finance → Archiv nabídek
   NEBO
2. Naceňování → klikněte na banner "Archiv všech cenových nabídek"

### Stažení PDF nabídky
1. Archiv nabídek
2. Najděte nabídku
3. Klikněte "PDF"
4. PDF se stáhne automaticky

### Úprava nabídky
1. Archiv nabídek
2. Klikněte na ikonu tužky
3. Upravte název nebo poznámky
4. Uložit změny

### Smazání nabídky
1. Archiv nabídek
2. Klikněte na ikonu koše
3. Potvrďte smazání

## 📝 Poznámky

- Pipeline komponenta už obsahuje Edit a Delete tlačítka - leady jsou editovatelné
- Všechny nabídky (pro klienty i leady) lze upravovat a mazat
- PDF generování funguje pro všechny typy nabídek
- Vyhledávání je case-insensitive
- Archiv je přístupný pouze pro manažery

## 🎉 Hotovo!

Všechny požadované funkce byly implementovány:
✅ Archiv nabídek s možností úprav a mazání
✅ Viditelné PDF tlačítko
✅ Leady jsou editovatelné v Pipeline
✅ Leady se správně zobrazují v nabídkách
