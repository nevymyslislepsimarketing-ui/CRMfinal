# Changelog - Nevymyslíš CRM

## [2.0.0] - 2025-10-23

### ✨ Nové funkce

#### 1. Filtrování úkolů podle uživatele
- **Umístění:** Stránka Úkoly
- **Pro:** Manažery
- Dropdown menu pro výběr konkrétního uživatele
- Zobrazení pouze úkolů vybraného uživatele
- Tlačítko pro zrušení filtru

#### 2. Detail klienta s rozšířenými informacemi
- **Umístění:** Stránka Klienti
- Nové tlačítko "Zobrazit detail" (ikona oka)
- Kompletní modal s informacemi o klientovi
- **Google Drive integrace:**
  - Pole pro zadání odkazu na Google Drive
  - Klikací tlačítko pro otevření v novém okně
- **Správa přihlašovacích údajů:**
  - Přidání/úprava/mazání přihlašovacích údajů
  - Pole: Platforma, Uživatelské jméno, Heslo, Poznámky
  - Zobrazení všech údajů v přehledném seznamu

#### 3. Klikací Dashboard karty
- **Umístění:** Dashboard
- Všechny statistické karty jsou nyní klikací
- Navigace na příslušné stránky:
  - "Celkem klientů" → Klienti
  - "Nevyřízené úkoly" → Úkoly
  - "Faktury po splatnosti" → Faktury
  - "Nezaplaceno" → Faktury
  - "Za tento měsíc" → Faktury
- Hover efekty pro lepší UX

#### 4. Editace uživatelů v Admin panelu
- **Umístění:** Admin Panel
- Nové tlačítko "Upravit" u každého uživatele
- **Pro manažery:**
  - Úprava pracovníků (jméno, pozice)
  - Možnost povýšit pracovníka na manažera
  - Nemožnost upravovat jiné manažery
- **Pro hlavního Admina:**
  - Úprava všech uživatelů včetně manažerů
  - Možnost degradovat manažera na pracovníka
- Bezpečnostní kontroly na backendu i frontendu

#### 5. Email notifikace při přiřazení úkolu
- **Umístění:** Automatické při vytváření úkolu
- Email se odesílá když manažer přiřadí úkol jinému uživateli
- **Obsah emailu:**
  - Jméno zadavatele
  - Název a popis úkolu
  - Priorita a termín
  - Jméno klienta
  - Odkaz do CRM
- Profesionální HTML design
- Integrace s Mailtrap API

#### 6. Vylepšený Kalendář (Notion-style)
- **Umístění:** Stránka Kalendář
- **Měsíční zobrazení:**
  - Klasické zobrazení měsíce
  - Týden začíná pondělím
  - Zobrazení až 3 úkolů na den
  - Časy zobrazené u úkolů
  - Zvýraznění dnešního dne
  - Kliknutí na den vytvoří úkol
- **Týdenní zobrazení:**
  - Časová osa 6:00 - 24:00 (18 hodin)
  - 7 dní v týdnu jako sloupce
  - Každá hodina jako řádek
  - Úkoly v příslušných časových slotech
  - Kliknutí na slot předvyplní čas
  - Barevné rozlišení podle typu aktivity
  - Horizontální scrollování
- **Navigace:**
  - Přepínání mezi měsícem a týdnem
  - Tlačítka Předchozí/Další/Dnes
  - Zobrazení aktuálního období
- **Nová funkce:** Checkbox pro sdílenou aktivitu

### 🗄️ Databázové změny

#### Nové tabulky:
```sql
CREATE TABLE client_credentials (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  platform VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  password TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Nové sloupce:
```sql
ALTER TABLE clients ADD COLUMN google_drive_link TEXT;
```

#### Migrace:
- Nový skript: `backend/scripts/addClientFields.js`
- Automatické vytvoření tabulky a sloupce
- Spustit před prvním použitím nových funkcí

### 🔧 Backend změny

#### Nové API endpointy:

**Přihlašovací údaje klientů:**
- `GET /clients/:id/credentials` - Získat všechny údaje
- `POST /clients/:id/credentials` - Přidat nové údaje
- `PUT /clients/:id/credentials/:credentialId` - Upravit údaje
- `DELETE /clients/:id/credentials/:credentialId` - Smazat údaje

**Správa uživatelů:**
- `PATCH /users/:id` - Upravit uživatele (jméno, pozice, role)

#### Aktualizované endpointy:

**Klienti:**
- `POST /clients` - Přidáno pole `google_drive_link`
- `PUT /clients/:id` - Přidáno pole `google_drive_link`

**Úkoly:**
- `POST /tasks` - Přidána automatická email notifikace

#### Nové služby:
- `emailService.sendNewTaskEmail()` - Odeslání emailu o novém úkolu

#### Bezpečnost:
- Přísná kontrola oprávnění pro editaci uživatelů
- Validace dat na backendu
- Ochrana proti editaci vlastního účtu
- Ochrana hlavního admin účtu

### 🎨 Frontend změny

#### Nové soubory:
- `frontend/src/pages/CalendarEnhanced.jsx` - Kompletně nový kalendář

#### Aktualizované komponenty:
- `frontend/src/pages/Clients.jsx`
  - Detail klienta modal
  - Credentials management
  - Google Drive integrace
- `frontend/src/pages/Tasks.jsx`
  - Filtr podle uživatele
  - Filter komponenta
- `frontend/src/pages/Dashboard.jsx`
  - Klikací karty
  - Navigate funkce
- `frontend/src/pages/Admin.jsx`
  - Editace uživatelů modal
  - Kontrola oprávnění
- `frontend/src/App.jsx`
  - Routing pro nový kalendář

#### UI/UX vylepšení:
- Konzistentní design se stávajícím systémem
- Responzivní modaly
- Hover efekty
- Loading states
- Error handling

### 📚 Dokumentace

#### Nové soubory:
- `IMPLEMENTED_FEATURES.md` - Kompletní dokumentace všech funkcí
- `QUICK_START.md` - Průvodce pro rychlý start
- `CHANGELOG.md` - Tento soubor
- `COMMIT_MESSAGE.txt` - Připravená commit message
- `GIT_COMMANDS.sh` - Git příkazy pro commit

### 🔄 Migrace

#### Před spuštěním aplikace:
```bash
cd backend
node scripts/addClientFields.js
```

Tento příkaz vytvoří:
- Novou tabulku `client_credentials`
- Nový sloupec `google_drive_link` v tabulce `clients`

### ⚙️ Konfigurace

#### Environment proměnné:
Žádné nové proměnné nejsou vyžadovány. Existující konfigurace zůstává.

Pro email notifikace je potřeba mít nastavené:
- `MAILTRAP_API_TOKEN`
- `EMAIL_FROM`
- `EMAIL_FROM_NAME`
- `FRONTEND_URL`

### 🧪 Testování

#### Otestováno:
- ✅ Všechny nové funkce
- ✅ Databázová migrace
- ✅ API endpointy
- ✅ Email notifikace (Mailtrap)
- ✅ Responzivita
- ✅ Bezpečnostní kontroly
- ✅ Kompatibilita se stávajícími funkcemi

### 📦 Dependencies

Žádné nové dependencies nebyly přidány. Projekt používá existující balíčky.

### 🐛 Bug Fixes

- Opravena chyba v Tasks.jsx kde chyběl import `useAuth`
- Upraveno filtrování úkolů pro správnou funkčnost s ID

### 🔐 Bezpečnost

- Kontrola oprávnění pro všechny nové endpointy
- Validace vstupních dat
- Ochrana před neoprávněnou editací uživatelů
- Sanitizace dat před uložením

### ⚠️ Breaking Changes

**Žádné breaking changes** - všechny změny jsou zpětně kompatibilní.

**Ale vyžaduje se:**
- Spuštění databázové migrace před prvním použitím

### 📝 Poznámky

- Přihlašovací údaje klientů jsou uloženy v plain text (interní použití)
- Email notifikace vyžadují správně nastavenou Mailtrap konfiguraci
- Všechny nové funkce jsou optimalizovány pro výkon
- Kalendář je optimalizován pro desktop i mobilní zařízení

### 🎯 Další kroky

Doporučené následující kroky:
1. Provést důkladné testování v produkčním prostředí
2. Nastavit zálohovací systém pro novou tabulku
3. Monitorovat výkon email notifikací
4. Shromáždit feedback od uživatelů

---

## [1.1.0] - Předchozí verze

Základní CRM funkcionalita s úkoly, klienty, fakturami, pipeline a kalendářem.

---

**Typ vydání:** Major Feature Release  
**Verze:** 2.0.0  
**Datum:** 23. října 2025  
**Status:** ✅ Production Ready
