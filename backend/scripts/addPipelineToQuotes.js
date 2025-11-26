const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

const addPipelineToQuotes = async () => {
  console.log('🔧 Přidávání pipeline_id do client_quotes...');
  
  try {
    // Přidat sloupec pipeline_id do client_quotes
    await pool.query(`
      ALTER TABLE client_quotes 
      ADD COLUMN IF NOT EXISTS pipeline_id INTEGER REFERENCES pipeline(id) ON DELETE SET NULL
    `);
    
    console.log('✅ Sloupec pipeline_id byl úspěšně přidán do client_quotes');
    
    // Upravit client_id aby byl nullable (může být NULL pokud máme lead místo klienta)
    await pool.query(`
      ALTER TABLE client_quotes 
      ALTER COLUMN client_id DROP NOT NULL
    `);
    
    console.log('✅ Sloupec client_id byl nastaven jako nullable');
    
    // Přidat check constraint, aby alespoň jeden z client_id nebo pipeline_id byl vyplněn
    await pool.query(`
      ALTER TABLE client_quotes 
      ADD CONSTRAINT check_client_or_lead 
      CHECK (client_id IS NOT NULL OR pipeline_id IS NOT NULL)
    `);
    
    console.log('✅ Check constraint byl přidán');
    
    console.log('🎉 Migrace dokončena úspěšně!');
    
  } catch (error) {
    console.error('❌ Chyba při migraci:', error);
    await pool.end();
    process.exit(1);
  }
  
  await pool.end();
  process.exit(0);
};

addPipelineToQuotes();
