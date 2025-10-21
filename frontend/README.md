# Nevymyslíš CRM - Frontend

React frontend aplikace pro CRM systém marketingové firmy Nevymyslíš.

## Technologie

- **React 18** - UI knihovna
- **React Router** - Routování
- **TailwindCSS** - Styling
- **Axios** - HTTP klient
- **Vite** - Build tool
- **Lucide React** - Ikony

## Instalace

1. Nainstalujte závislosti:
```bash
npm install
```

2. Ujistěte se, že backend API běží na `http://localhost:5001`

## Spuštění

### Vývojový režim
```bash
npm run dev
```

Aplikace běží na `http://localhost:5173`

### Build pro produkci
```bash
npm run build
```

### Preview produkční verze
```bash
npm run preview
```

## Struktura projektu

```
src/
├── api/
│   └── axios.js          # Axios konfigurace a interceptory
├── components/
│   ├── Layout.jsx        # Hlavní layout s navigací
│   └── ProtectedRoute.jsx # Ochrana routes před neautorizovaným přístupem
├── context/
│   └── AuthContext.jsx   # Kontext pro autentizaci
├── pages/
│   ├── Login.jsx         # Přihlášení
│   ├── Register.jsx      # Registrace
│   ├── Dashboard.jsx     # Dashboard s přehledy
│   ├── Clients.jsx       # Správa klientů
│   ├── Tasks.jsx         # Správa úkolů
│   └── Invoices.jsx      # Správa faktur
├── App.jsx               # Hlavní komponenta s routováním
├── main.jsx              # Entry point
└── index.css             # Globální styly
```

## Funkce

### ✅ Autentizace
- Přihlášení a registrace uživatelů
- JWT token v localStorage
- Automatické přesměrování při vypršení tokenu
- Ochrana routes

### ✅ Dashboard
- Přehled statistik (klienti, úkoly, faktury)
- Nadcházející úkoly
- Nedávné faktury
- Grafické zobrazení dat

### ✅ Správa klientů
- CRUD operace
- Status klienta (aktivní/neaktivní)
- Kontaktní informace
- Poznámky

### ✅ Správa úkolů
- CRUD operace
- Přiřazení klientovi
- Přiřazení uživateli
- Priority a statusy
- Termíny

### ✅ Správa faktur
- CRUD operace
- Propojení s klienty
- Označení jako zaplaceno
- Upozornění na faktury po splatnosti
- Automatické generování čísla faktury

## Demo přístup

Po spuštění backendu a inicializaci databáze můžete použít:
- **Email:** admin@nevymyslis.cz
- **Heslo:** admin123

## API Endpoint

Frontend komunikuje s backend API na `http://localhost:5001/api`

Můžete změnit v souboru `src/api/axios.js`
