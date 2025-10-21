# 🧾 Fakturační systém - Kompletně implementováno!

## ✅ CO BYLO PŘIDÁNO

### 1. **📄 PDF generování faktur**
- Tlačítko "PDF" u každé faktury v seznamu
- Automaticky vygenerovaná profesionální faktura v HTML
- Možnost tisku jako PDF (Ctrl+P / Cmd+P)
- Obsahuje:
  - Fakturační údaje dodavatele
  - Fakturační údaje odběratele
  - Číslo faktury, datum vystavení, splatnost
  - Popis služeb
  - Částka k úhradě
  - Číslo účtu
  - Status (Zaplaceno/Nezaplaceno)

### 2. **🏢 Fakturační údaje klientů**
Přidáno do formuláře klienta:
- Název firmy (pro fakturu)
- IČO
- DIČ  
- Fakturační adresa

### 3. **⚙️ Nastavení fakturačních údajů pro manažery**
Nová stránka **"Nastavení"** (pouze pro manažery):
- Název firmy
- IČO
- DIČ
- Adresa
- Číslo účtu
- Email
- Telefon

Tyto údaje se automaticky použijí při generování PDF faktur.

### 4. **📝 Popis služeb na faktuře**
- Nové pole "Popis služeb" ve formuláři faktury
- Zobrazuje se v PDF exportu

## ��️ Databázové změny

### Nové tabulky:
- **company_settings** - fakturační údaje manažerů
  - company_name, ico, dic, address
  - bank_account, email, phone
  - Jeden záznam na uživatele (UNIQUE user_id)

### Rozšířené tabulky:
- **clients** - přidány fakturační údaje:
  - billing_company_name
  - ico
  - dic
  - billing_address

- **invoices** - rozšířeno:
  - description (popis služeb)
  - created_by (kdo vytvořil fakturu)
  - payment_date

## 🚀 JAK TO SPUSTIT

### ⚠️ DŮLEŽITÉ - Restartujte databázi!

```bash
cd backend
npm run init-db
```

Tím se:
- Vytvoří nové tabulky a sloupce
- Naplní demo data včetně fakturačních údajů
- Nastaví fakturační údaje pro admin účet

### Spuštění aplikace:

```bash
# Backend
cd backend
npm start

# Frontend (nový terminál)
cd frontend  
npm run dev
```

## 📖 JAK TO POUŽÍVAT

### 1. **Nastavení fakturačních údajů**
1. Přihlaste se jako **manager** (admin@nevymyslis.cz)
2. Klikněte na **"Nastavení"** v menu
3. Vyplňte své fakturační údaje
4. Klikněte **"Uložit nastavení"**

### 2. **Přidání fakturačních údajů klientovi**
1. Otevřete **"Klienti"**
2. Upravte existujícího klienta nebo vytvořte nového
3. Vyplňte sekci **"Fakturační údaje"**:
   - Název firmy
   - IČO
   - DIČ
   - Fakturační adresa
4. Uložte

### 3. **Vytvoření faktury s popisem**
1. Otevřete **"Faktury"**
2. Klikněte **"Přidat fakturu"**
3. Vyberte klienta
4. Vyplňte částku
5. **Vyplňte popis služeb** (co jste pro klienta udělali)
6. Nastavte datum vystavení a splatnosti
7. Uložte

### 4. **Stažení faktury jako PDF**
1. V seznamu faktur najděte fakturu
2. Klikněte na modré tlačítko **📄 (PDF)**
3. Otevře se nové okno s fakturou
4. Klikněte **"Stáhnout jako PDF"** nebo použijte Ctrl+P / Cmd+P
5. V dialogu tisku vyberte "Uložit jako PDF"
6. Hotovo! 🎉

## 🎨 Vzhled PDF faktury

PDF faktura obsahuje:
- **Hlavička** s číslem faktury a statusem
- **Dodavatel** (vaše údaje z Nastavení)
- **Odběratel** (fakturační údaje klienta)
- **Detaily**: datum vystavení, splatnost, číslo účtu
- **Položky**: popis služeb a částka
- **Celková částka** k úhradě
- **Nevymyslíš brand barvy** (fialová & oranžová)
- **Status zaplaceno** (pokud je faktura zaplacená)

## 🆕 Nové API endpointy

### Company Settings
```
GET    /api/company-settings/my     // Získat své fakturační údaje
POST   /api/company-settings/my     // Uložit fakturační údaje (pouze manager)
```

### PDF Faktury
```
GET    /api/invoices/:id/html       // Získat fakturu jako HTML pro PDF export
```

## 📋 Demo data

Po `npm run init-db` máte:
- **Admin účet** s předvyplněnými fakturačními údaji:
  - Firma: Nevymyslíš s.r.o.
  - IČO: 99887766
  - DIČ: CZ99887766
  - Adresa: Marketingová 321, 150 00 Praha 5
  - Účet: 123456789/0100

- **3 demo klienti** s fakturačními údaji:
  - ACME Corp - IČO: 12345678
  - TechStart s.r.o. - IČO: 87654321
  - Marketing Plus - IČO: 11223344

## ✨ Tipy

1. **Každý manažer si nastaví svoje údaje** - system podporuje více manažerů, každý si může fakturovat na svoje údaje

2. **PDF se otevře v novém okně** - můžete ho nechat otevřené a upravit fakturu, pak obnovit okno pro nový export

3. **Popis služeb** je volitelný, ale doporučujeme ho vyplnit pro transparentnost

4. **Automatické číslo faktury** - při vytváření nové faktury se automaticky vygeneruje číslo INV-{timestamp}

## 🎊 HOTOVO!

Fakturační systém je plně funkční:
- ✅ PDF generování s profesionálním designem  
- ✅ Fakturační údaje pro klienty
- ✅ Nastavení fakturačních údajů pro manažery
- ✅ Popis služeb na fakturách
- ✅ Plná integrace s existujícím systémem

**Můžete začít vystavovat faktury! 💼**
