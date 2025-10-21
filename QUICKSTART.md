# 🚀 Rychlý start - Nevymyslíš CRM

Tento průvodce vám pomůže rychle spustit CRM systém.

## Krok 1: Příprava databáze

1. Ujistěte se, že máte nainstalovaný **PostgreSQL**

2. Vytvořte databázi:
```bash
createdb nevymyslis_crm
```

Nebo pomocí psql:
```bash
psql -U postgres
CREATE DATABASE nevymyslis_crm;
\q
```

## Krok 2: Spuštění backendu

Otevřete nový terminál:

```bash
# Přejděte do složky backendu
cd backend

# Nainstalujte závislosti
npm install

# Zkontrolujte a upravte .env soubor podle potřeby
# (výchozí nastavení by mělo fungovat)

# Inicializujte databázi (vytvoří tabulky a demo data)
npm run init-db

# Spusťte server
npm start
```

Backend by měl běžet na **http://localhost:5001**

✅ Měli byste vidět:
```
╔════════════════════════════════════════╗
║   🚀 Nevymyslíš CRM Backend Server    ║
║                                        ║
║   Port: 5001                           ║
║   Prostředí: development               ║
╚════════════════════════════════════════╝
```

## Krok 3: Spuštění frontendu

Otevřete **NOVÝ** terminál (backend musí běžet):

```bash
# Přejděte do složky frontendu
cd frontend

# Nainstalujte závislosti
npm install

# Spusťte vývojový server
npm run dev
```

Frontend by měl běžet na **http://localhost:5173**

Prohlížeč by se měl automaticky otevřít.

## Krok 4: Přihlášení

Použijte demo přihlašovací údaje:

- **Email:** admin@nevymyslis.cz
- **Heslo:** admin123

## 🎉 Hotovo!

Nyní byste měli vidět dashboard s demo daty:
- 3 demo klienti
- Přehled statistik
- Navigace mezi sekcemi

## Možné problémy

### Backend se nespustí
- ❌ Zkontrolujte, zda běží PostgreSQL
- ❌ Ověřte připojení v `.env` souboru
- ❌ Ujistěte se, že je vytvořena databáze `nevymyslis_crm`

### Frontend nemůže načíst data
- ❌ Zkontrolujte, zda backend běží na portu 5001
- ❌ Otevřete konzoli v prohlížeči (F12) a hledejte chybové zprávy
- ❌ Zkontrolujte CORS nastavení

### Nelze se přihlásit
- ❌ Zkontrolujte, zda byla databáze inicializována (`npm run init-db` v backendu)
- ❌ Zkuste zaregistrovat nového uživatele

## Další kroky

### Vytvoření nových uživatelů
1. Klikněte na "Zaregistrujte se" na přihlašovací stránce
2. Nebo použijte API endpoint: `POST /api/auth/register`

### Přidání klientů
1. Přejděte do sekce "Klienti"
2. Klikněte na "Přidat klienta"

### Správa úkolů
1. Přejděte do sekce "Úkoly"
2. Vytvořte úkol a přiřaďte ho klientovi a uživateli

### Správa faktur
1. Přejděte do sekce "Faktury"
2. Vytvořte fakturu pro klienta
3. Označte fakturu jako zaplacenou po úhradě

## Pro produkční nasazení

1. **Změňte JWT_SECRET** v `.env` na silný random string
2. **Změňte databázové heslo** v produkčním prostředí
3. **Nastavte NODE_ENV=production**
4. **Build frontend**: `cd frontend && npm run build`
5. **Použijte reverzní proxy** (např. nginx)
6. **Nastavte HTTPS**

---

Užijte si používání CRM systému! 🎊
