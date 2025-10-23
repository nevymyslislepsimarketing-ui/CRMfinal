-- ============================================
-- Manuální migrace pro CRM v2.0.0
-- ============================================
-- Použijte tento soubor pokud Node.js skript selže
-- Spustit pomocí: psql -U postgres nevymyslis_crm -f migration_manual.sql

-- Začátek transakce (rollback pokud něco selže)
BEGIN;

-- ============================================
-- KROK 1: Přidat sloupec google_drive_link
-- ============================================

DO $$ 
BEGIN
    -- Zkontrolovat jestli sloupec již existuje
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'google_drive_link'
    ) THEN
        -- Přidat sloupec
        ALTER TABLE clients ADD COLUMN google_drive_link TEXT;
        RAISE NOTICE '✅ Sloupec google_drive_link přidán do tabulky clients';
    ELSE
        RAISE NOTICE '⚠️  Sloupec google_drive_link již existuje';
    END IF;
END $$;

-- ============================================
-- KROK 2: Vytvořit tabulku client_credentials
-- ============================================

DO $$ 
BEGIN
    -- Zkontrolovat jestli tabulka již existuje
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'client_credentials'
    ) THEN
        -- Vytvořit tabulku
        CREATE TABLE client_credentials (
            id SERIAL PRIMARY KEY,
            client_id INTEGER NOT NULL,
            platform VARCHAR(255) NOT NULL,
            username VARCHAR(255),
            password TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_client
                FOREIGN KEY(client_id) 
                REFERENCES clients(id)
                ON DELETE CASCADE
        );
        
        -- Vytvořit index pro rychlejší vyhledávání
        CREATE INDEX idx_client_credentials_client_id ON client_credentials(client_id);
        
        RAISE NOTICE '✅ Tabulka client_credentials vytvořena';
    ELSE
        RAISE NOTICE '⚠️  Tabulka client_credentials již existuje';
    END IF;
END $$;

-- ============================================
-- KROK 3: Ověření
-- ============================================

-- Vypsat informace o nových strukturách
\echo ''
\echo '======================================'
\echo 'Ověření nových struktur:'
\echo '======================================'
\echo ''

-- Ověřit sloupec v clients
\echo 'Sloupce v tabulce clients:'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clients' 
AND column_name = 'google_drive_link';

-- Ověřit tabulku client_credentials
\echo ''
\echo 'Struktura tabulky client_credentials:'
\d client_credentials

-- Spočítat existující záznamy
\echo ''
\echo 'Počet záznamů v nové tabulce:'
SELECT COUNT(*) as credential_count FROM client_credentials;

-- ============================================
-- Commit nebo Rollback
-- ============================================

-- Pokud vše proběhlo OK, commitnout změny
COMMIT;

\echo ''
\echo '======================================'
\echo '✅ Migrace úspěšně dokončena!'
\echo '======================================'
\echo ''
\echo 'Nové struktury byly vytvořeny:'
\echo '  • clients.google_drive_link (sloupec)'
\echo '  • client_credentials (tabulka)'
\echo ''
\echo 'Nyní můžete restartovat aplikaci.'
\echo ''

-- V případě chyby se automaticky provede ROLLBACK díky BEGIN na začátku
