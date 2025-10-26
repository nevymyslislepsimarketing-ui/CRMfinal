const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

const addRevenueSplits = async () => {
  console.log('💰 Vytváření tabulky pro rozdělení příjmů...');
  
  try {
    // Tabulka pro rozdělení pravidelných příjmů mezi pracovníky
    await pool.query(`
      CREATE TABLE IF NOT EXISTS revenue_splits (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(client_id, user_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_revenue_splits_client ON revenue_splits(client_id);
      CREATE INDEX IF NOT EXISTS idx_revenue_splits_user ON revenue_splits(user_id);
    `);
    console.log('✅ Tabulka revenue_splits vytvořena');

    console.log('🎉 Migrace dokončena!');
    
  } catch (error) {
    console.error('❌ Chyba:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

addRevenueSplits()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
