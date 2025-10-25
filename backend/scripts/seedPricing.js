const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

const pricingData = [
  // SOCIÁLNÍ SÍTĚ - Balíčky
  {
    category: 'social_media',
    service_name: 'Balíček BASIC',
    description: '3 videa + 3 grafické příspěvky měsíčně, content plán, základní úprava fotek, odpovědi do 48h, 1x měsíční konzultace',
    base_price: 5000,
    price_type: 'monthly',
    is_package: true,
    package_items: JSON.stringify({
      videos: 3,
      graphics: 3,
      content_plan: true,
      photo_editing: 'basic',
      response_time: '48h',
      consultations: 1
    })
  },
  {
    category: 'social_media',
    service_name: 'Balíček STANDARD',
    description: '5 videí + 5 grafických příspěvků měsíčně, obsahový plán, marketingová strategie, reporting, aktivní komunikace',
    base_price: 10000,
    price_type: 'monthly',
    is_package: true,
    package_items: JSON.stringify({
      videos: 5,
      graphics: 5,
      content_plan: true,
      strategy: true,
      reporting: true,
      communication: 'active'
    })
  },
  {
    category: 'social_media',
    service_name: 'Balíček PREMIUM',
    description: '8 videí + 8 grafických příspěvků měsíčně, obsahový plán, strategie, reporting, aktivní komunikace, denní stories',
    base_price: 15000,
    price_type: 'monthly',
    is_package: true,
    package_items: JSON.stringify({
      videos: 8,
      graphics: 8,
      content_plan: true,
      strategy: true,
      reporting: true,
      communication: 'active',
      daily_stories: true
    })
  },

  // SOCIÁLNÍ SÍTĚ - Rozšíření
  {
    category: 'social_media_extension',
    service_name: 'LinkedIn - příspěvky',
    description: 'Rozšíření správy na LinkedIn',
    base_price: 1500,
    price_type: 'monthly',
    is_package: false
  },
  {
    category: 'social_media_extension',
    service_name: 'LinkedIn - příspěvky a náborový obsah',
    description: 'Kompletní správa LinkedIn včetně náborového obsahu',
    base_price: 2500,
    price_type: 'monthly',
    is_package: false
  },
  {
    category: 'social_media_extension',
    service_name: 'TikTok - videa',
    description: 'Tvorba a správa TikTok videí',
    base_price: 1000,
    price_type: 'monthly',
    is_package: false
  },
  {
    category: 'social_media_extension',
    service_name: 'YouTube - videa',
    description: 'Tvorba a správa YouTube videí',
    base_price: 1000,
    price_type: 'monthly',
    is_package: false
  },

  // REKLAMY
  {
    category: 'ads',
    service_name: 'Správa reklam (Meta, TikTok)',
    description: 'Placená reklama na sociálních sítích, cena dle rozsahu kampaně',
    base_price: 2000,
    price_type: 'monthly',
    is_package: false
  },

  // KREATIVNÍ SLUŽBY
  {
    category: 'creative',
    service_name: 'Tvorba grafiky',
    description: 'Grafické návrhy a vizuály',
    base_price: 500,
    price_type: 'one_time',
    is_package: false
  },
  {
    category: 'creative',
    service_name: 'Focení půldenní',
    description: 'Produktové fotografie, cca 4 hodiny',
    base_price: 1500,
    price_type: 'one_time',
    is_package: false
  },
  {
    category: 'creative',
    service_name: 'Focení celodenní',
    description: 'Produktové fotografie, cca 8 hodin',
    base_price: 2500,
    price_type: 'one_time',
    is_package: false
  },

  // WEBY
  {
    category: 'web',
    service_name: 'Jednostránkový web',
    description: 'Moderní responzivní web ideální pro prezentaci služeb',
    base_price: 10000,
    price_type: 'one_time',
    is_package: false
  },
  {
    category: 'web',
    service_name: 'Vícestránkový web',
    description: 'Komplexnější webové řešení pro firmy a projekty',
    base_price: 15000,
    price_type: 'one_time',
    is_package: false
  },
  {
    category: 'web',
    service_name: 'Kompletní e-shop',
    description: 'E-shop na míru včetně produktů, platební brány a analytics',
    base_price: 20000,
    price_type: 'one_time',
    is_package: false
  },

  // ÚDRŽBA
  {
    category: 'maintenance',
    service_name: 'Jednorázová úprava webu',
    description: 'Jednorázové úpravy stávajícího webu',
    base_price: 2000,
    price_type: 'one_time',
    is_package: false
  },
  {
    category: 'maintenance',
    service_name: 'Pravidelné přidávání obsahu',
    description: 'Měsíční aktualizace obsahu na webu',
    base_price: 2500,
    price_type: 'monthly',
    is_package: false
  },
  {
    category: 'maintenance',
    service_name: 'Správa e-shopu',
    description: 'Pravidelná správa a údržba e-shopu',
    base_price: 5000,
    price_type: 'monthly',
    is_package: false
  }
];

const seedPricing = async () => {
  console.log('🌱 Seed dat pro ceník služeb...');
  
  try {
    // Vymazat stará data
    await pool.query('DELETE FROM service_pricing');
    console.log('🗑️  Stará data vymazána');

    // Vložit nová data
    for (const item of pricingData) {
      await pool.query(`
        INSERT INTO service_pricing 
        (category, service_name, description, base_price, price_type, is_package, package_items)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        item.category,
        item.service_name,
        item.description,
        item.base_price,
        item.price_type,
        item.is_package,
        item.package_items || null
      ]);
      console.log(`  ✅ ${item.service_name}`);
    }

    console.log(`🎉 Seed dokončen! Vloženo ${pricingData.length} služeb.`);
    
  } catch (error) {
    console.error('❌ Chyba při seed:', error);
    await pool.end();
    process.exit(1);
  }
  
  await pool.end();
  process.exit(0);
};

seedPricing();
