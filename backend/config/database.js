const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') 
    ? { rejectUnauthorized: false } 
    : false
});

pool.on('connect', () => {
  console.log('✅ Připojeno k PostgreSQL databázi');
});

pool.on('error', (err) => {
  console.error('❌ Neočekávaná chyba databáze:', err);
  process.exit(-1);
});

module.exports = pool;
