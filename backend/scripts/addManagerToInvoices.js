const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

const addManagerToInvoices = async () => {
  console.log('🔧 Přidávání manager_id do tabulky invoices...');
  
  try {
    // Přidat sloupec manager_id do invoices
    try {
      await pool.query(`
        ALTER TABLE invoices 
        ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES users(id)
      `);
      console.log('✅ Sloupec manager_id přidán do invoices');
    } catch (err) {
      if (err.code === '42701') {
        console.log('ℹ️  Sloupec manager_id již existuje v invoices');
      } else {
        throw err;
      }
    }

    // Vytvořit index
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_invoices_manager ON invoices(manager_id)
      `);
      console.log('✅ Index na manager_id vytvořen');
    } catch (err) {
      console.log('ℹ️  Index již existuje');
    }

    console.log('🎉 Manager_id úspěšně přidán do invoices!');
    
  } catch (error) {
    console.error('❌ Chyba:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

addManagerToInvoices()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
