# 🚀 Návod pro migraci na produkčním serveru

## ⚠️ DŮLEŽITÉ - Před začátkem

**VŽDY nejprve zálohujte databázi!** Bez této zálohy NEZAČÍNEJTE migraci.

---

## 📋 Příprava

### 1. Kontrola připojení k serveru

Nejprve se ujistěte, že máte přístup k produkčnímu serveru:

```bash
# SSH připojení k serveru
ssh user@your-production-server.com

# Nebo pokud máte specifický port:
ssh -p 2222 user@your-production-server.com
```

### 2. Najděte složku s projektem

```bash
# Přejděte do složky projektu (upravte podle vaší struktury)
cd /path/to/nevymyslis-crm

# Ověřte že jste ve správné složce
ls -la
# Měli byste vidět složky: backend, frontend, atd.
```

---

## 🗄️ KROK 1: Zálohování databáze (POVINNÉ!)

### Metoda A: PostgreSQL pg_dump (doporučeno)

```bash
# Základní záloha
pg_dump -U postgres nevymyslis_crm > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# S kompresí (ušetříte místo)
pg_dump -U postgres nevymyslis_crm | gzip > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql.gz

# S heslem (pokud je vyžadováno)
PGPASSWORD=your_password pg_dump -U postgres -h localhost nevymyslis_crm > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql
```

### Metoda B: Přes psql s dotazem

```bash
# Přihlásit se do psql
psql -U postgres nevymyslis_crm

# V psql konzoli:
\copy (SELECT * FROM clients) TO '/tmp/clients_backup.csv' WITH CSV HEADER;
\copy (SELECT * FROM users) TO '/tmp/users_backup.csv' WITH CSV HEADER;
\copy (SELECT * FROM tasks) TO '/tmp/tasks_backup.csv' WITH CSV HEADER;
\q
```

### Ověření zálohy

```bash
# Zkontrolujte že záloha existuje a není prázdná
ls -lh backup_*.sql
# nebo
ls -lh backup_*.sql.gz

# Měla by mít nějakou rozumnou velikost (ne 0 bytes!)
```

---

## 📦 KROK 2: Pull nového kódu z Gitu

```bash
# Ujistěte se že jste v hlavní složce projektu
cd /path/to/nevymyslis-crm

# Stáhněte nejnovější změny
git pull origin main
# NEBO
git pull origin master

# Ověřte že máte nejnovější verzi
git log -1
# Měli byste vidět váš poslední commit o implementaci nových funkcí
```

---

## 🔧 KROK 3: Instalace závislostí (pokud jsou nové)

```bash
# Backend
cd backend
npm install

# Ujistěte se že .env soubor existuje a obsahuje správné údaje
cat .env | grep DATABASE_URL
# Měli byste vidět connection string k databázi
```

---

## 🗃️ KROK 4: Spuštění migrace

### Metoda A: Přímé spuštění skriptu (doporučeno)

```bash
# Ujistěte se že jste ve složce backend
cd /path/to/nevymyslis-crm/backend

# Spusťte migraci
node scripts/addClientFields.js
```

**Očekávaný výstup:**
```
🚀 Přidávání nových polí do tabulky clients...
✅ Pole google_drive_link přidáno
✅ Tabulka client_credentials vytvořena
🎉 Migrace úspěšně dokončena!
```

### Metoda B: S logováním (pro debugging)

```bash
# Spusťte migraci a uložte výstup do souboru
node scripts/addClientFields.js 2>&1 | tee migration_log_$(date +%Y%m%d_%H%M%S).log

# Po dokončení zkontrolujte log
cat migration_log_*.log
```

### Metoda C: Manuální spuštění SQL příkazů

Pokud skript selže, můžete spustit SQL příkazy manuálně:

```bash
# Přihlaste se do PostgreSQL
psql -U postgres nevymyslis_crm

# Spusťte následující SQL příkazy:
```

```sql
-- Přidat sloupec google_drive_link
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS google_drive_link TEXT;

-- Vytvořit tabulku client_credentials
CREATE TABLE IF NOT EXISTS client_credentials (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  platform VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  password TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ověřit že změny byly aplikovány
\d clients
\d client_credentials

-- Ukončit
\q
```

---

## ✅ KROK 5: Ověření migrace

### Ověřte nové struktury databáze:

```bash
# Přihlaste se do databáze
psql -U postgres nevymyslis_crm

# Zkontrolujte sloupec u clients
\d clients
# Měli byste vidět google_drive_link | text |

# Zkontrolujte novou tabulku
\d client_credentials
# Měla by se zobrazit celá struktura tabulky

# Vyzkoušejte SELECT dotaz
SELECT COUNT(*) FROM client_credentials;
# Mělo by vrátit 0 (žádné záznamy zatím)

# Ukončit
\q
```

---

## 🔄 KROK 6: Restart aplikace

### Pokud používáte PM2:

```bash
# Seznam běžících procesů
pm2 list

# Restart backendu
pm2 restart backend
# nebo
pm2 restart nevymyslis-backend

# Restart frontendu (pokud běží přes PM2)
pm2 restart frontend
# nebo
pm2 restart nevymyslis-frontend

# Zkontrolujte logy
pm2 logs backend --lines 50
```

### Pokud používáte systemd:

```bash
# Restart backendu
sudo systemctl restart nevymyslis-backend

# Restart frontendu
sudo systemctl restart nevymyslis-frontend

# Zkontrolujte status
sudo systemctl status nevymyslis-backend
sudo systemctl status nevymyslis-frontend

# Zkontrolujte logy
sudo journalctl -u nevymyslis-backend -n 50 -f
```

### Pokud používáte Docker:

```bash
# Najděte containery
docker ps

# Restart specifického containeru
docker restart nevymyslis-backend
docker restart nevymyslis-frontend

# Nebo restart všech pomocí docker-compose
docker-compose restart

# Zkontrolujte logy
docker logs nevymyslis-backend --tail 50
```

### Manuální restart:

```bash
# Zastavit běžící procesy (Ctrl+C na odpovídajících terminálech)

# Nebo najít a zabít procesy
ps aux | grep node
kill -9 PID_PROCESU

# Spustit znovu
cd /path/to/nevymyslis-crm/backend
nohup npm run start > backend.log 2>&1 &

cd /path/to/nevymyslis-crm/frontend
nohup npm run start > frontend.log 2>&1 &
```

---

## 🧪 KROK 7: Testování

### A) Test backendu:

```bash
# Test zdraví API
curl http://localhost:5000/api/health
# nebo
curl http://your-domain.com/api/health

# Test nového endpointu pro credentials
curl -X GET http://localhost:5000/api/clients/1/credentials \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### B) Test frontendu:

1. Otevřete prohlížeč a přejděte na vaši doménu
2. Přihlaste se jako manažer
3. **Testujte nové funkce:**
   - Otevřete stránku Klienti → Detail klienta
   - Otevřete stránku Úkoly → Měli byste vidět filtr
   - Otevřete Dashboard → Klikněte na karty
   - Otevřete Admin → Zkuste upravit uživatele
   - Otevřete Kalendář → Přepněte na týdenní zobrazení

---

## 🐛 Řešení problémů

### Problém 1: Migrace selže s chybou "relation already exists"

**Řešení:** Toto není chyba, tabulka už existuje. Pokračujte dál.

```bash
# Ověřte že tabulka existuje
psql -U postgres nevymyslis_crm -c "\d client_credentials"
```

### Problém 2: "permission denied for table clients"

**Řešení:** Databázový uživatel nemá oprávnění.

```bash
# Přihlaste se jako postgres superuser
psql -U postgres nevymyslis_crm

# Dejte oprávnění vašemu uživateli
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;

\q
```

### Problém 3: "Cannot find module"

**Řešení:** Chybí závislosti.

```bash
cd /path/to/nevymyslis-crm/backend
npm install
```

### Problém 4: "Connection refused" při připojení k databázi

**Řešení:** Zkontrolujte .env soubor a PostgreSQL service.

```bash
# Zkontrolujte .env
cat backend/.env | grep DATABASE_URL

# Zkontrolujte že PostgreSQL běží
sudo systemctl status postgresql
# nebo
pg_isready

# Spusťte PostgreSQL pokud neběží
sudo systemctl start postgresql
```

### Problém 5: Aplikace běží ale nové funkce nejsou viditelné

**Řešení:** Vyčistěte cache prohlížeče a rebuild frontend.

```bash
# Rebuild frontend
cd /path/to/nevymyslis-crm/frontend
npm run build

# Zkontrolujte že se build podařil
ls -la build/ nebo dist/
```

---

## 🔙 Rollback (v případě problémů)

### Pokud něco selže a potřebujete vrátit změny:

```bash
# 1. Obnovit databázi ze zálohy
psql -U postgres nevymyslis_crm < backup_before_migration_TIMESTAMP.sql

# Pokud je záloha komprimovaná:
gunzip -c backup_before_migration_TIMESTAMP.sql.gz | psql -U postgres nevymyslis_crm

# 2. Vrátit kód na předchozí commit
cd /path/to/nevymyslis-crm
git log --oneline -10  # Najděte hash předchozího commitu
git checkout PREVIOUS_COMMIT_HASH

# 3. Restart aplikace
pm2 restart all
# nebo podle vaší konfigurace
```

---

## 📝 Checklist pro produkční migraci

Projděte tento checklist krok za krokem:

- [ ] Máte SSH přístup k produkčnímu serveru
- [ ] Našli jste složku s projektem
- [ ] Vytvořili jste zálohu databáze
- [ ] Ověřili jste že záloha není prázdná
- [ ] Pullnuli jste nejnovější kód z Gitu
- [ ] Nainstalovali jste nové dependencies (pokud jsou)
- [ ] Ověřili jste .env soubor
- [ ] Spustili jste migrační skript
- [ ] Migrace proběhla úspěšně (viděli jste ✅)
- [ ] Ověřili jste nové struktury v databázi
- [ ] Restartovali jste backend
- [ ] Restartovali jste frontend (pokud je třeba)
- [ ] Otestovali jste že aplikace běží
- [ ] Otestovali jste všechny nové funkce
- [ ] Zkontrolovali jste logy na chyby
- [ ] Informovali jste tým o nových funkcích

---

## 📞 Nouzový kontakt

Pokud narazíte na problém který nemůžete vyřešit:

1. **Zachovejte klid** - máte zálohu databáze
2. **Zkontrolujte logy** - často tam najdete odpověď
3. **Použijte rollback** - pokud je to nutné
4. **Kontaktujte support** - pokud máte technickou podporu

---

## 📊 Po úspěšné migraci

### Co dělat dál:

1. **Monitorujte logy** prvních 24 hodin
2. **Informujte uživatele** o nových funkcích
3. **Sledujte výkon** - zejména nové API endpointy
4. **Shromážděte feedback** od uživatelů
5. **Plánujte pravidelné zálohy** nové tabulky client_credentials

### Nastavení automatických záloh:

```bash
# Vytvořte cron job pro denní zálohy
crontab -e

# Přidejte řádek (záloha každý den ve 2:00 ráno):
0 2 * * * pg_dump -U postgres nevymyslis_crm | gzip > /backups/nevymyslis_$(date +\%Y\%m\%d).sql.gz
```

---

## ✅ Hotovo!

Pokud jste prošli všemi kroky a všechny checkboxy jsou zaškrtnuté, **gratulujeme!** 🎉

Migrace byla úspěšná a nové funkce jsou nasazeny na produkci.

---

**Verze tohoto návodu:** 1.0  
**Datum:** 23. října 2025  
**Pro verzi CRM:** 2.0.0
