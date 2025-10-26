const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

const addInvoiceSplits = async () => {
  console.log('🔧 Vytváření tabulky pro rozdělení jednorázových faktur...');
  
  try {
    // Zkontrolovat jestli tabulka existuje
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'invoice_splits'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('⚠️  Tabulka invoice_splits už existuje - smazat a znovu vytvořit...');
      await pool.query('DROP TABLE IF EXISTS invoice_splits CASCADE;');
      console.log('🗑️  Stará tabulka smazána');
    }

    // Vytvořit tabulku invoice_splits
    await pool.query(`
      CREATE TABLE invoice_splits (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabulka invoice_splits vytvořena');

    // Vytvořit indexy
    await pool.query(`
      CREATE INDEX idx_invoice_splits_invoice ON invoice_splits(invoice_id);
    `);
    console.log('✅ Index na invoice_id vytvořen');

    await pool.query(`
      CREATE INDEX idx_invoice_splits_user ON invoice_splits(user_id);
    `);
    console.log('✅ Index na user_id vytvořen');

    console.log('🎉 Invoice splits tabulka úspěšně nastavena!');
    
  } catch (error) {
    console.error('❌ Chyba při vytváření invoice_splits:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

addInvoiceSplits()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
