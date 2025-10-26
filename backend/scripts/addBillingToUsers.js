const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

const addBillingToUsers = async () => {
  console.log('🔧 Přidávání fakturačních údajů do tabulky users...');
  
  try {
    // Přidat sloupce pro fakturační údaje
    const columns = [
      { name: 'billing_name', type: 'TEXT' },
      { name: 'billing_ico', type: 'VARCHAR(20)' },
      { name: 'billing_dic', type: 'VARCHAR(20)' },
      { name: 'billing_address', type: 'TEXT' },
      { name: 'billing_email', type: 'VARCHAR(255)' },
      { name: 'billing_phone', type: 'VARCHAR(50)' },
      { name: 'billing_bank_account', type: 'VARCHAR(50)' }
    ];

    for (const column of columns) {
      try {
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}
        `);
        console.log(`✅ Sloupec ${column.name} přidán`);
      } catch (err) {
        if (err.code === '42701') {
          console.log(`ℹ️  Sloupec ${column.name} již existuje`);
        } else {
          throw err;
        }
      }
    }

    // Přidat sloupec manager_id do clients pro pravidelné faktury
    try {
      await pool.query(`
        ALTER TABLE clients 
        ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES users(id)
      `);
      console.log('✅ Sloupec manager_id přidán do clients');
    } catch (err) {
      if (err.code === '42701') {
        console.log('ℹ️  Sloupec manager_id již existuje v clients');
      } else {
        throw err;
      }
    }

    // Vytvořit index
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_clients_manager ON clients(manager_id)
      `);
      console.log('✅ Index na manager_id vytvořen');
    } catch (err) {
      console.log('ℹ️  Index již existuje');
    }

    console.log('🎉 Fakturační údaje úspěšně přidány!');
    
  } catch (error) {
    console.error('❌ Chyba:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

addBillingToUsers()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
