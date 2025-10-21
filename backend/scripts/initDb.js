const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDatabase = async () => {
  try {
    console.log('🚀 Inicializace databáze...');

    // Smazání starých tabulek (pokud existují)
    console.log('🗑️  Mazání starých tabulek...');
    await pool.query('DROP TABLE IF EXISTS invoices CASCADE');
    await pool.query('DROP TABLE IF EXISTS recurring_tasks CASCADE');
    await pool.query('DROP TABLE IF EXISTS tasks CASCADE');
    await pool.query('DROP TABLE IF EXISTS task_types CASCADE');
    await pool.query('DROP TABLE IF EXISTS pipeline CASCADE');
    await pool.query('DROP TABLE IF EXISTS clients CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('✅ Staré tabulky smazány');

    // Vytvoření tabulky users s rozšířenými rolemi
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'employee',
        position VARCHAR(100),
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        force_password_change BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabulka users vytvořena');

    // Vytvoření tabulky clients s fakturačními údaji
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        billing_company_name VARCHAR(255),
        ico VARCHAR(50),
        dic VARCHAR(50),
        billing_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabulka clients vytvořena');

    // Vytvoření tabulky task_types (typy úkolů/aktivit)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(50) NOT NULL,
        icon VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabulka task_types vytvořena');

    // Vytvoření tabulky recurring_tasks (pravidelné úkoly) - MUSÍ BÝT PŘED tasks!
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recurring_tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        task_type_id INTEGER REFERENCES task_types(id) ON DELETE SET NULL,
        recurrence_pattern VARCHAR(50) NOT NULL,
        frequency INTEGER DEFAULT 1,
        start_date DATE NOT NULL,
        end_date DATE,
        priority VARCHAR(50) DEFAULT 'medium',
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabulka recurring_tasks vytvořena');

    // Vytvoření tabulky tasks s rozšířenými funkcemi (PO recurring_tasks!)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        deadline DATE,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        priority VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'pending',
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        task_type_id INTEGER REFERENCES task_types(id) ON DELETE SET NULL,
        recurring_task_id INTEGER REFERENCES recurring_tasks(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabulka tasks vytvořena');

    // Vytvoření tabulky pipeline (leady a potenciální klienti)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pipeline (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        stage VARCHAR(50) DEFAULT 'lead',
        value DECIMAL(10, 2),
        probability INTEGER DEFAULT 0,
        source VARCHAR(100),
        notes TEXT,
        next_action TEXT,
        next_action_date DATE,
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabulka pipeline vytvořena');

    // Vytvoření tabulky company_settings (fakturační údaje firmy)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        company_name VARCHAR(255) NOT NULL,
        ico VARCHAR(50),
        dic VARCHAR(50),
        address TEXT,
        bank_account VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50),
        logo_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
    `);
    console.log('✅ Tabulka company_settings vytvořena');

    // Vytvoření pivot tabulky pro viditelnost klientů
    await pool.query(`
      CREATE TABLE IF NOT EXISTS client_users (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(client_id, user_id)
      );
    `);
    console.log('✅ Tabulka client_users vytvořena');

    // Vytvoření tabulky invoices s rozšířenými údaji
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        issued_at DATE NOT NULL,
        due_date DATE NOT NULL,
        paid BOOLEAN DEFAULT FALSE,
        payment_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabulka invoices vytvořena');

    // Vytvoření tabulky pro reset hesla tokeny
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabulka password_resets vytvořena');

    // Vytvoření prvního admin uživatele s dočasným heslem
    const initialPassword = 'Nevymyslis2025!';
    const hashedPassword = await bcrypt.hash(initialPassword, 10);
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role, position, force_password_change)
      VALUES 
        ('Admin', 'info@nevymyslis.cz', $1, 'manager', 'Administrátor', TRUE)
      ON CONFLICT (email) DO NOTHING;
    `, [hashedPassword]);
    console.log('✅ Admin uživatel vytvořen');
    console.log('📧 Email: info@nevymyslis.cz');
    console.log('🔑 Heslo: ' + initialPassword);
    console.log('⚠️  Heslo bude nutné změnit při prvním přihlášení!');

    // Vytvoření základních typů úkolů
    await pool.query(`
      INSERT INTO task_types (name, color, icon, description)
      VALUES 
        ('Obchodní schůzka', '#C8B6FF', '🤝', 'Schůzka s klientem nebo potenciálním klientem'),
        ('Natáčení', '#FFD6BA', '🎥', 'Natáčení video obsahu'),
        ('Tvorba grafiky', '#FF6B9D', '🎨', 'Grafický design a vizuály'),
        ('Tvorba webu', '#4ECDC4', '💻', 'Vývoj a úprava webových stránek'),
        ('Správa reklam', '#FFE66D', '📊', 'Správa reklamních kampaní'),
        ('Vydávání contentu', '#95E1D3', '📱', 'Publikování obsahu na sociální sítě'),
        ('Konzultace', '#A8E6CF', '💬', 'Poradenství a konzultace'),
        ('Fotografie', '#FFA07A', '📸', 'Fotografování produktů nebo eventů')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Typy úkolů vytvořeny');

    console.log('🎉 Databáze úspěšně inicializována!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Chyba při inicializaci databáze:', error);
    process.exit(1);
  }
};

initDatabase();
