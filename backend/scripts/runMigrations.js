const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

const runMigrations = async () => {
  console.log('🚀 Spouštění migrací...');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  
  try {
    // Migrace 1: Přidat google_drive_link
    console.log('📝 Migrace 1: Přidávání sloupce google_drive_link...');
    
    await pool.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS google_drive_link TEXT;
    `);
    
    console.log('✅ Sloupec google_drive_link přidán');

    // Migrace 2: Vytvořit tabulku client_credentials
    console.log('📝 Migrace 2: Vytváření tabulky client_credentials...');
    
    await pool.query(`
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
    `);
    
    console.log('✅ Tabulka client_credentials vytvořena');

    // Vytvořit index pro lepší výkon
    console.log('📝 Vytváření indexu...');
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_client_credentials_client_id 
      ON client_credentials(client_id);
    `);
    
    console.log('✅ Index vytvořen');

    // Ověření
    console.log('🔍 Ověřování migrací...');
    
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'clients' 
      AND column_name = 'google_drive_link';
    `);
    
    const checkTable = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE tablename = 'client_credentials';
    `);
    
    if (checkColumn.rows.length > 0 && checkTable.rows.length > 0) {
      console.log('✅ Všechny migrace úspěšně ověřeny');
      console.log('🎉 Migrace dokončeny!');
      process.exit(0);
    } else {
      console.error('❌ Chyba při ověřování migrací');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Chyba při migraci:', error.message);
    
    // Pokud je chyba že už existuje, není to fatální
    if (error.message.includes('already exists')) {
      console.log('⚠️  Struktury již existují - to je v pořádku');
      console.log('✅ Migrace dokončeny (žádné změny nebyly potřeba)');
      process.exit(0);
    }
    
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Spustit migrace
runMigrations();
