const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

const migrateToV3 = async () => {
  console.log('🚀 Migrace na CRM v3.0.0...');
  
  try {
    // 1. PROJEKTY
    console.log('📊 Vytváření tabulky projects...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        brief TEXT,
        deadline DATE,
        status VARCHAR(50) DEFAULT 'in_progress',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    `);
    console.log('✅ Tabulka projects vytvořena');

    console.log('📋 Vytváření tabulky project_milestones...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_milestones (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        deadline DATE,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id);
    `);
    console.log('✅ Tabulka project_milestones vytvořena');

    console.log('👥 Vytváření tabulky project_team...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_team (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_project_team_project ON project_team(project_id);
      CREATE INDEX IF NOT EXISTS idx_project_team_user ON project_team(user_id);
    `);
    console.log('✅ Tabulka project_team vytvořena');

    console.log('✓ Vytváření tabulky project_checklist...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_checklist (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        task_title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        assigned_to INTEGER REFERENCES users(id),
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_checklist_project ON project_checklist(project_id);
    `);
    console.log('✅ Tabulka project_checklist vytvořena');

    // 2. AI HISTORIE
    console.log('🤖 Vytváření tabulky ai_post_history...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_post_history (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        post_type VARCHAR(100),
        topic TEXT,
        prompt TEXT,
        generated_caption TEXT,
        used BOOLEAN DEFAULT FALSE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_ai_history_client ON ai_post_history(client_id);
    `);
    console.log('✅ Tabulka ai_post_history vytvořena');
    
    // Přidat sloupec prompt pokud už tabulka existuje
    console.log('🔧 Kontrola sloupce prompt...');
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'ai_post_history' AND column_name = 'prompt'
        ) THEN
          ALTER TABLE ai_post_history ADD COLUMN prompt TEXT;
        END IF;
      END $$;
    `);
    console.log('✅ Sloupec prompt zkontrolován');

    // 3. CENÍK A NABÍDKY
    console.log('💰 Vytváření tabulky service_pricing...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_pricing (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        service_name VARCHAR(255) NOT NULL,
        description TEXT,
        base_price DECIMAL(10,2),
        price_type VARCHAR(50),
        is_package BOOLEAN DEFAULT FALSE,
        package_items JSONB,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_pricing_category ON service_pricing(category);
    `);
    console.log('✅ Tabulka service_pricing vytvořena');

    console.log('📋 Vytváření tabulky client_quotes...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS client_quotes (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        quote_name VARCHAR(255),
        services JSONB,
        monthly_total DECIMAL(10,2),
        one_time_total DECIMAL(10,2),
        custom_adjustments TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_quotes_client ON client_quotes(client_id);
    `);
    console.log('✅ Tabulka client_quotes vytvořena');

    // 4. FINANCE
    console.log('💳 Přidávání finančních sloupců do clients...');
    await pool.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS monthly_recurring_amount DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS invoice_day INTEGER,
      ADD COLUMN IF NOT EXISTS invoice_due_days INTEGER DEFAULT 14;
    `);
    console.log('✅ Finanční sloupce přidány');

    console.log('🧾 Vytváření tabulky one_time_invoices...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS one_time_invoices (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        description VARCHAR(255),
        amount DECIMAL(10,2) NOT NULL,
        paid BOOLEAN DEFAULT FALSE,
        invoice_id INTEGER REFERENCES invoices(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_one_time_client ON one_time_invoices(client_id);
    `);
    console.log('✅ Tabulka one_time_invoices vytvořena');

    console.log('💸 Vytváření tabulky invoice_splits...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoice_splits (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        percentage DECIMAL(5,2),
        is_recurring BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_splits_client ON invoice_splits(client_id);
      CREATE INDEX IF NOT EXISTS idx_splits_user ON invoice_splits(user_id);
    `);
    console.log('✅ Tabulka invoice_splits vytvořena');

    // 5. AKTUALIZACE TASKS STATUS
    console.log('✅ Aktualizace statusů úkolů...');
    await pool.query(`
      DO $$ 
      BEGIN
        -- Změnit typ sloupce pokud je potřeba
        ALTER TABLE tasks ALTER COLUMN status TYPE VARCHAR(50);
      EXCEPTION
        WHEN others THEN
          RAISE NOTICE 'Column status already correct type';
      END $$;
      
      -- Migrace starých hodnot na nové
      UPDATE tasks SET status = 'new' WHERE status = 'pending';
      UPDATE tasks SET status = 'done' WHERE status = 'completed';
    `);
    console.log('✅ Statusy úkolů aktualizovány');

    // Ověření
    console.log('🔍 Ověřování migrace...');
    const tables = [
      'projects', 'project_milestones', 'project_team', 'project_checklist',
      'ai_post_history', 'service_pricing', 'client_quotes',
      'one_time_invoices', 'invoice_splits'
    ];
    
    for (const table of tables) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        );
      `, [table]);
      
      if (result.rows[0].exists) {
        console.log(`  ✅ ${table}`);
      } else {
        console.log(`  ❌ ${table} - CHYBA!`);
      }
    }

    console.log('🎉 Migrace na v3.0.0 úspěšně dokončena!');
    
  } catch (error) {
    console.error('❌ Chyba při migraci:', error);
    console.error('Stack trace:', error.stack);
    await pool.end();
    process.exit(1);
  }
  
  await pool.end();
  process.exit(0);
};

migrateToV3();
