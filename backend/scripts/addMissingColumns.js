const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

const addMissingColumns = async () => {
  console.log('🔧 Přidávání chybějících sloupců...');
  
  try {
    // 1. Přidat assigned_to do projects
    console.log('📊 Kontrola projects.assigned_to...');
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'projects' AND column_name = 'assigned_to'
        ) THEN
          ALTER TABLE projects ADD COLUMN assigned_to INTEGER REFERENCES users(id);
          CREATE INDEX IF NOT EXISTS idx_projects_assigned ON projects(assigned_to);
          RAISE NOTICE 'Sloupec assigned_to přidán';
        ELSE
          RAISE NOTICE 'Sloupec assigned_to už existuje';
        END IF;
      END $$;
    `);
    console.log('✅ projects.assigned_to OK');

    // 2. Přidat prompt do ai_post_history
    console.log('🤖 Kontrola ai_post_history.prompt...');
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'ai_post_history' AND column_name = 'prompt'
        ) THEN
          ALTER TABLE ai_post_history ADD COLUMN prompt TEXT;
          RAISE NOTICE 'Sloupec prompt přidán';
        ELSE
          RAISE NOTICE 'Sloupec prompt už existuje';
        END IF;
      END $$;
    `);
    console.log('✅ ai_post_history.prompt OK');
    
    // 3. Přidat platform do ai_post_history
    console.log('🤖 Kontrola ai_post_history.platform...');
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'ai_post_history' AND column_name = 'platform'
        ) THEN
          ALTER TABLE ai_post_history ADD COLUMN platform VARCHAR(50);
          RAISE NOTICE 'Sloupec platform přidán';
        ELSE
          RAISE NOTICE 'Sloupec platform už existuje';
        END IF;
      END $$;
    `);
    console.log('✅ ai_post_history.platform OK');
    
    // 4. Přejmenovat generated_caption na generated_text
    console.log('🤖 Kontrola ai_post_history.generated_text...');
    await pool.query(`
      DO $$ 
      BEGIN
        -- Pokud existuje generated_caption, přejmenuj na generated_text
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'ai_post_history' AND column_name = 'generated_caption'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'ai_post_history' AND column_name = 'generated_text'
        ) THEN
          ALTER TABLE ai_post_history RENAME COLUMN generated_caption TO generated_text;
          RAISE NOTICE 'Sloupec přejmenován na generated_text';
        -- Pokud neexistuje ani generated_caption ani generated_text, přidej generated_text
        ELSIF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'ai_post_history' AND column_name = 'generated_text'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'ai_post_history' AND column_name = 'generated_caption'
        ) THEN
          ALTER TABLE ai_post_history ADD COLUMN generated_text TEXT;
          RAISE NOTICE 'Sloupec generated_text přidán';
        ELSE
          RAISE NOTICE 'Sloupec generated_text už existuje';
        END IF;
      END $$;
    `);
    console.log('✅ ai_post_history.generated_text OK');

    // 5. Přidat google_drive_link do clients
    console.log('👥 Kontrola clients.google_drive_link...');
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'clients' AND column_name = 'google_drive_link'
        ) THEN
          ALTER TABLE clients ADD COLUMN google_drive_link TEXT;
          RAISE NOTICE 'Sloupec google_drive_link přidán';
        ELSE
          RAISE NOTICE 'Sloupec google_drive_link už existuje';
        END IF;
      END $$;
    `);
    console.log('✅ clients.google_drive_link OK');

    console.log('🎉 Všechny sloupce zkontrolovány a přidány!');
    
  } catch (error) {
    console.error('❌ Chyba:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

addMissingColumns()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
