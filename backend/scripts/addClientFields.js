const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const addClientFields = async () => {
  try {
    console.log('🚀 Přidávání nových polí do tabulky clients...');

    // Přidání pole pro Google Drive odkaz
    await pool.query(`
      ALTER TABLE clients 
      ADD COLUMN IF NOT EXISTS google_drive_link TEXT;
    `);
    console.log('✅ Pole google_drive_link přidáno');

    // Vytvoření tabulky pro přihlašovací údaje klientů
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

    console.log('🎉 Migrace úspěšně dokončena!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Chyba při migraci:', error);
    process.exit(1);
  }
};

addClientFields();
