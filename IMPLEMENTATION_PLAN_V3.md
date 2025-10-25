# 🚀 Implementační plán CRM v3.0.0

## 📋 Přehled nových funkcí

### 1. 📊 Řízení projektů (nová záložka)
### 2. ✅ Nové statusy úkolů
### 3. 🤖 AI generování popisků pro sociální sítě
### 4. ⏰ Automatické email notifikace (deadline)
### 5. 💰 Naceňování služeb
### 6. 💳 Rozšířený finanční management
### 7. 📄 Automatické generování pravidelných faktur
### 8. 📁 Google Drive integrace
### 9. ✨ UX vylepšení

---

## 🗂️ Funkce 1: Řízení projektů

### Databáze:
**Nová tabulka `projects`:**
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'web', 'social_media', 'campaign', 'video', 'photography', 'graphics'
  brief TEXT,
  deadline DATE,
  status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'waiting_for_client', 'approved', 'completed', 'cancelled'
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_milestones (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  deadline DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_team (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(100), -- 'manager', 'designer', 'developer', 'photographer', etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_checklist (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  task_title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Backend:
- `routes/projects.js` - CRUD operace
- Email notifikace den před deadlinem

### Frontend:
- `pages/Projects.jsx` - Nová záložka
- Kanban board nebo list view
- Detail projektu s checklistem

---

## ✅ Funkce 2: Nové statusy úkolů

### Databáze:
```sql
ALTER TABLE tasks 
ALTER COLUMN status TYPE VARCHAR(50);

-- Nové hodnoty: 'new', 'in_progress', 'waiting_for_client', 'done'
```

### Backend:
- Aktualizovat validaci v `routes/tasks.js`

### Frontend:
- Aktualizovat dropdown v `pages/Tasks.jsx`
- Barvy podle statusu

---

## 🤖 Funkce 3: AI generování popisků

### Databáze:
```sql
CREATE TABLE ai_post_history (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  post_type VARCHAR(100),
  topic TEXT,
  generated_caption TEXT,
  used BOOLEAN DEFAULT FALSE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Backend:
- `routes/ai-captions.js`
- Integrace OpenAI API (nebo jiné AI)
- Učení z historie (prompt engineering)

### Frontend:
- `pages/AICaptions.jsx` nebo modal
- Chatovací rozhraní
- Výběr klienta
- Typ příspěvku
- Historie generování

---

## ⏰ Funkce 4: Automatické email notifikace

### Backend:
- CRON job nebo scheduled task
- `services/notificationService.js`
- **Úkoly:** Email v den deadlinu (8:00 ráno)
- **Projekty:** Email den před deadlinem (8:00 ráno)

### Implementace:
- Node-cron nebo podobná knihovna
- Kontrola deadlinů každý den
- Email template pro každý typ

---

## 💰 Funkce 5: Naceňování služeb

### Databáze:
```sql
CREATE TABLE service_pricing (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL, -- 'social_media', 'ads', 'creative', 'web', 'maintenance'
  service_name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2),
  price_type VARCHAR(50), -- 'monthly', 'one_time', 'hourly'
  is_package BOOLEAN DEFAULT FALSE,
  package_items JSONB, -- Pro balíčky typu BASIC, STANDARD, PREMIUM
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client_quotes (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  quote_name VARCHAR(255),
  services JSONB, -- Array služeb a jejich cen
  monthly_total DECIMAL(10,2),
  one_time_total DECIMAL(10,2),
  custom_adjustments TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Data z ceníku:
- Balíčky sociálních sítí: BASIC (5000), STANDARD (10000), PREMIUM (15000)
- Rozšíření platforem: LinkedIn (+1500/+2500), TikTok (+1000), YouTube (+1000)
- Reklamy: od 2000 Kč
- Grafika: od 500 Kč
- Focení: půldenní (1500), celodenní (2500)
- Weby: jednostránkový (10000), vícestránkový (15000), e-shop (20000)
- Údržba webu: 2000-5000 jednorázově, 2500 měsíčně obsah, 5000 e-shop
- CRM: individuálně

### Frontend:
- `pages/Pricing.jsx` - Konfigurátor nabídky
- Checkboxy pro výběr služeb
- Automatický výpočet ceny
- Možnost manuální úpravy
- Uložení nabídky ke klientovi

---

## 💳 Funkce 6: Rozšířený finanční management

### Databáze:
```sql
ALTER TABLE clients
ADD COLUMN monthly_recurring_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN invoice_day INTEGER, -- Den v měsíci kdy vystavit fakturu (1-31)
ADD COLUMN invoice_due_days INTEGER DEFAULT 14; -- Počet dní splatnosti

CREATE TABLE one_time_invoices (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  description VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  invoice_id INTEGER REFERENCES invoices(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_splits (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2),
  is_recurring BOOLEAN DEFAULT TRUE, -- TRUE = z pravidelných faktur, FALSE = jednorázové
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Frontend:
- Rozšířit detail klienta o finanční sekci
- Viditelnost **POUZE pro manažery** (role check)
- Přehled pravidelných faktur
- Přehled jednorázových faktur
- Nastavení přerozdělení (splits)

---

## 📄 Funkce 7: Automatické generování faktur

### Backend:
- CRON job kontrolující `invoice_day` u klientů
- Automatické vytvoření faktury v `invoices` tabulce
- Email notifikace manažerovi

### Frontend:
- Indikace automaticky vygenerovaných faktur
- Možnost stáhnout/poslat

---

## 📁 Funkce 8: Google Drive integrace

### Možnosti:
**A) Google Drive API (komplikovanější):**
- OAuth autentizace
- Zobrazení souborů z Drive
- Upload/download

**B) Jednodušší řešení:**
- Google Drive Picker API
- Zobrazení souborů v iframe
- Umožní procházet Drive bez opuštění CRM

### Implementace:
- Google Cloud Console - aktivace Drive API
- Frontend: Google Picker nebo iframe
- Backend: Uložení access tokenů

---

## ✨ Funkce 9: UX vylepšení

- Dashboard widget s deadline overview
- Notifikace v systému (bell icon)
- Rychlé akce (quick actions)
- Drag & drop v projektech
- Dark mode? (optional)
- Responsive design audit
- Loading states
- Error handling

---

## 📊 Oprávnění (Permissions)

### Stávající role:
- **employee** - základní pracovník
- **manager** - manažer
- **admin** - hlavní admin

### Nová oprávnění:
```javascript
Projekty: Všichni (read/write)
Úkoly: Všichni (read/write)
AI Popisky: Všichni (read/write)
Naceňování: Manažeři + Admin (read/write)
Finance (splits, recurring): Manažeři + Admin ONLY
Faktury: Manažeři + Admin (write), Všichni (read)
```

---

## 🔧 Technologie

### Nové závislosti:
- **AI:** OpenAI API (`openai` npm package)
- **CRON:** `node-cron`
- **Google:** `googleapis` npm package
- **PDF:** Existing (už máte)

---

## 📅 Postup implementace

### Fáze 1: Databáze & Backend (2-3 hodiny)
1. Migrace databáze - všechny nové tabulky
2. Seed data pro service_pricing
3. Backend routes pro všechny nové funkce
4. Email služby & CRON joby

### Fáze 2: Frontend - Core Features (3-4 hodiny)
1. Projekty stránka
2. Naceňování stránka  
3. Aktualizace Tasks (nové statusy)
4. Rozšíření client detail (finance - permissions)

### Fáze 3: Frontend - Advanced Features (2-3 hodiny)
1. AI Captions modal/page
2. Google Drive integrace
3. Dashboard widgets
4. Notifikace systém

### Fáze 4: Testing & Polish (1-2 hodiny)
1. Testing všech funkcí
2. UX improvements
3. Dokumentace

### Celkový čas: 8-12 hodin práce

---

## 🎯 Prioritizace

### Must-have (core):
1. ✅ Projekty
2. ✅ Nové statusy úkolů
3. ✅ Naceňování  
4. ✅ Finance (splits, recurring)
5. ✅ Auto fakturace
6. ✅ Email notifikace deadline

### Nice-to-have (can be v3.1):
1. 🤖 AI Captions (vyžaduje OpenAI klíč a náklady)
2. 📁 Google Drive (komplexní OAuth)
3. ✨ Fancy UX features

---

## 💡 Doporučení

**Začneme s must-have features a pak přidáme advanced?**

Nebo chcete všechno najednou? Pro AI a Google Drive budete potřebovat:
- OpenAI API klíč (platí se podle použití)
- Google Cloud Project (zdarma s limity)

**Chcete pokračovat s implementací?** 
Můžu začít postupně nebo najednou podle vašich preferencí.
