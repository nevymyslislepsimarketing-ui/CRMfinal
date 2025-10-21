# 🚀 Nevymyslíš CRM

Kompletní CRM systém pro marketingovou firmu Nevymyslíš. Umožňuje správu klientů, úkolů, faktur a poskytuje přehledný dashboard s důležitými metrikami.

## 📋 Obsah

- [Technologie](#technologie)
- [Funkce](#funkce)
- [Instalace](#instalace)
- [Spuštění](#spuštění)
- [Struktura projektu](#struktura-projektu)
- [API Dokumentace](#api-dokumentace)
- [Screenshots](#screenshots)

## 🛠 Technologie

### Backend
- **Node.js** + **Express.js** - Server a REST API
- **PostgreSQL** - Databáze
- **JWT** - Autentizace
- **bcryptjs** - Hashování hesel
- **Nodemailer** - Email odesílání (SMTP)

### Frontend
- **React 18** - UI framework
- **React Router** - Routování
- **TailwindCSS** - Styling
- **Axios** - HTTP klient
- **Vite** - Build tool
- **Lucide React** - Ikony

## ✨ Funkce

### Autentizace & Bezpečnost
- ✅ JWT autentizace s automatickou kontrolou validity
- ✅ Bcrypt hashování hesel
- ✅ **Force password change** při prvním přihlášení
- ✅ **Reset hesla přes email** s tokenem (1h platnost)
- ✅ **Role-based access control** (Manager / Employee)
- ✅ Ochrana všech API endpoints

### Dashboard
- ✅ Přehled počtu klientů (celkem a aktivních)
- ✅ Počet nevyřízených úkolů
- ✅ Faktury po splatnosti
- ✅ Celková částka nezaplacených faktur
- ✅ Seznam nadcházejících úkolů
- ✅ Seznam nedávných faktur

### Správa klientů
- ✅ CRUD operace (Create, Read, Update, Delete)
- ✅ Kontaktní informace (email, telefon)
- ✅ Status (aktivní/neaktivní)
- ✅ Poznámky

### Správa úkolů
- ✅ CRUD operace
- ✅ Propojení s klientem
- ✅ Přiřazení konkrétnímu uživateli
- ✅ Priority (nízká, střední, vysoká)
- ✅ Statusy (čeká, probíhá, hotovo)
- ✅ Termíny dokončení

### Správa faktur
- ✅ CRUD operace
- ✅ Propojení s klientem
- ✅ **Automatické číslování faktur** (formát: RRRRMMXXXXX)
- ✅ **Generování PDF faktur** s firemními údaji
- ✅ Částka, datum vystavení a splatnost
- ✅ Označení jako zaplaceno
- ✅ Vizuální upozornění na faktury po splatnosti
- ✅ Popis služeb (povinný)

## 📦 Instalace

### Předpoklady
- Node.js 16+ a npm
- PostgreSQL 12+

### 1. Naklonujte projekt
Projekt je již ve složce `nevymyslis-crm`

### 2. Nastavte PostgreSQL databázi
```bash
# Vytvořte novou databázi
createdb nevymyslis_crm

# Nebo pomocí psql
psql -U postgres
CREATE DATABASE nevymyslis_crm;
\q
```

### 3. Nastavte backend
```bash
cd backend

# Nainstalujte závislosti
npm install

# Upravte .env soubor (již vytvořen)
# Zkontrolujte připojení k databázi v .env

# Inicializujte databázi
npm run init-db
```

### 4. Nastavte frontend
```bash
cd ../frontend

# Nainstalujte závislosti
npm install
```

## 🚀 Spuštění

### Backend (port 5001)
```bash
cd backend
npm start
```

Backend API běží na: `http://localhost:5001`

### Frontend (port 5173)
```bash
cd frontend
npm run dev
```

Frontend aplikace běží na: `http://localhost:5173`

### První přihlášení
Po inicializaci databáze (`npm run init-db`) se vytvoří admin účet:
- **Email:** info@nevymyslis.cz
- **Dočasné heslo:** Bude zobrazeno v konzoli
- ⚠️ **Musíte změnit heslo při prvním přihlášení!**

## 📁 Struktura projektu

```
nevymyslis-crm/
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL připojení
│   ├── middleware/
│   │   └── auth.js              # JWT middleware
│   ├── routes/
│   │   ├── auth.js              # Autentizace endpoints
│   │   ├── clients.js           # Klienti endpoints
│   │   ├── tasks.js             # Úkoly endpoints
│   │   ├── invoices.js          # Faktury endpoints
│   │   ├── dashboard.js         # Dashboard statistiky
│   │   └── users.js             # Uživatelé endpoints
│   ├── scripts/
│   │   └── initDb.js            # Inicializace databáze
│   ├── server.js                # Express server
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js         # Axios konfigurace
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Hlavní layout
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Autentizace kontext
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Clients.jsx
│   │   │   ├── Tasks.jsx
│   │   │   └── Invoices.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🔌 API Dokumentace

### Autentizace
```
POST   /api/auth/register         - Vytvoření uživatele (pouze admin)
POST   /api/auth/login            - Přihlášení uživatele
POST   /api/auth/change-password  - Změna hesla
POST   /api/auth/forgot-password  - Žádost o reset hesla (email)
POST   /api/auth/reset-password   - Reset hesla pomocí tokenu
GET    /api/auth/me               - Informace o přihlášeném uživateli
```

### Klienti
```
GET    /api/clients          - Seznam všech klientů
GET    /api/clients/:id      - Detail klienta
POST   /api/clients          - Vytvoření nového klienta
PUT    /api/clients/:id      - Aktualizace klienta
DELETE /api/clients/:id      - Smazání klienta
```

### Úkoly
```
GET    /api/tasks            - Seznam všech úkolů
GET    /api/tasks/:id        - Detail úkolu
POST   /api/tasks            - Vytvoření nového úkolu
PUT    /api/tasks/:id        - Aktualizace úkolu
DELETE /api/tasks/:id        - Smazání úkolu
```

### Faktury
```
GET    /api/invoices         - Seznam všech faktur
GET    /api/invoices/:id     - Detail faktury
POST   /api/invoices         - Vytvoření nové faktury
PUT    /api/invoices/:id     - Aktualizace faktury
PATCH  /api/invoices/:id/pay - Označení jako zaplaceno
DELETE /api/invoices/:id     - Smazání faktury
```

### Dashboard
```
GET    /api/dashboard/stats  - Statistiky a přehledy
```

### Uživatelé
```
GET    /api/users            - Seznam všech uživatelů
```

## 📊 Databázový model

### users
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR(255) NOT NULL
email           VARCHAR(255) UNIQUE NOT NULL
password_hash   VARCHAR(255) NOT NULL
role            VARCHAR(50) DEFAULT 'user'
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### clients
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR(255) NOT NULL
email           VARCHAR(255)
phone           VARCHAR(50)
status          VARCHAR(50) DEFAULT 'active'
notes           TEXT
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### tasks
```sql
id              SERIAL PRIMARY KEY
title           VARCHAR(255) NOT NULL
description     TEXT
deadline        DATE
priority        VARCHAR(50) DEFAULT 'medium'
status          VARCHAR(50) DEFAULT 'pending'
client_id       INTEGER REFERENCES clients(id)
assigned_to     INTEGER REFERENCES users(id)
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### invoices
```sql
id              SERIAL PRIMARY KEY
invoice_number  VARCHAR(100) UNIQUE NOT NULL
client_id       INTEGER REFERENCES clients(id)
amount          DECIMAL(10, 2) NOT NULL
issued_at       DATE NOT NULL
due_date        DATE NOT NULL
paid            BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## 🔒 Bezpečnost

- ✅ Všechna hesla jsou hashována pomocí bcrypt
- ✅ JWT tokeny s expirací
- ✅ Chráněné API endpoints
- ✅ CORS konfigurace
- ✅ SQL injection prevence pomocí parametrizovaných dotazů

## 🎨 Design

- Moderní a čistý UI s TailwindCSS
- Responzivní design pro mobilní zařízení
- Barevné kódování pro lepší UX (statusy, priority)
- Notifikace a feedback pro uživatele

## 📝 License

Tento projekt je vytvořen pro marketingovou firmu Nevymyslíš.

## 🤝 Podpora

Pro otázky nebo problémy kontaktujte vývojový tým.

---

**Vytvořeno s ❤️ pro Nevymyslíš**
