# Nevymyslíš CRM - Backend API

Backend REST API pro CRM systém marketingové firmy Nevymyslíš.

## Technologie

- **Node.js** - Runtime prostředí
- **Express.js** - Web framework
- **PostgreSQL** - Databáze
- **JWT** - Autentizace
- **bcryptjs** - Hashování hesel

## Instalace

1. Nainstalujte závislosti:
```bash
npm install
```

2. Vytvořte PostgreSQL databázi:
```bash
createdb nevymyslis_crm
```

3. Zkopírujte `.env.example` do `.env` a upravte podle potřeby:
```bash
cp .env.example .env
```

4. Inicializujte databázi:
```bash
npm run init-db
```

## Spuštění

### Produkční režim
```bash
npm start
```

### Vývojový režim (s automatickým restartem)
```bash
npm run dev
```

Server běží na `http://localhost:5001`

## Demo přihlašovací údaje

- **Email:** admin@nevymyslis.cz
- **Heslo:** admin123

## API Endpoints

### Autentizace (`/api/auth`)
- `POST /register` - Registrace nového uživatele
- `POST /login` - Přihlášení uživatele
- `GET /me` - Získání informací o přihlášeném uživateli

### Klienti (`/api/clients`)
- `GET /` - Seznam všech klientů
- `GET /:id` - Detail klienta
- `POST /` - Vytvoření nového klienta
- `PUT /:id` - Aktualizace klienta
- `DELETE /:id` - Smazání klienta

### Úkoly (`/api/tasks`)
- `GET /` - Seznam všech úkolů
- `GET /:id` - Detail úkolu
- `POST /` - Vytvoření nového úkolu
- `PUT /:id` - Aktualizace úkolu
- `DELETE /:id` - Smazání úkolu

### Faktury (`/api/invoices`)
- `GET /` - Seznam všech faktur
- `GET /:id` - Detail faktury
- `POST /` - Vytvoření nové faktury
- `PUT /:id` - Aktualizace faktury
- `PATCH /:id/pay` - Označení faktury jako zaplacené
- `DELETE /:id` - Smazání faktury

### Dashboard (`/api/dashboard`)
- `GET /stats` - Statistiky a přehledy

### Uživatelé (`/api/users`)
- `GET /` - Seznam všech uživatelů

## Databázový model

### users
- id, name, email, password_hash, role, created_at

### clients
- id, name, email, phone, status, notes, created_at, updated_at

### tasks
- id, title, description, deadline, priority, status, client_id, assigned_to, created_at, updated_at

### invoices
- id, invoice_number, client_id, amount, issued_at, due_date, paid, created_at, updated_at

## Autentizace

API používá JWT tokeny. Pro přístup k chráněným endpoints musíte v hlavičce poslat:
```
Authorization: Bearer <token>
```
