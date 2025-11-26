const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

const pricingData = [
  // ====== PRAVIDELNÉ SLUŽBY (MĚSÍČNÍ SPOLUPRÁCE) ======
  
  // 1. KREATIVNÍ A VIZUÁLNÍ SLUŽBY
  {
    category: 'creative_visual',
    service_name: 'Kreativní a vizuální služby - Basic',
    description: 'Základní balíček pro menší firmy: návrh konceptu, pravidelné focení/natáčení, plánování, Reels/TikTok videa, monitoring',
    base_price: 7000,
    price_type: 'monthly',
    is_package: true,
    package_items: JSON.stringify({
      concept: true,
      shooting: 'regular',
      planning: true,
      reels_tiktok: true,
      monitoring: true,
      brand_recommendations: true
    })
  },
  {
    category: 'creative_visual',
    service_name: 'Kreativní a vizuální služby - Premium',
    description: 'Komplexnější obsah s vyšší frekvencí: návrh konceptu, pravidelné focení/natáčení, plánování, Reels/TikTok videa, monitoring, brand budování',
    base_price: 12000,
    price_type: 'monthly',
    is_package: true,
    package_items: JSON.stringify({
      concept: true,
      shooting: 'frequent',
      planning: true,
      reels_tiktok: true,
      monitoring: true,
      brand_building: true,
      brand_recommendations: true
    })
  },

  // 2. COPYWRITINGOVÉ SLUŽBY
  {
    category: 'copywriting',
    service_name: 'Copywritingové služby',
    description: 'Tvorba textového obsahu pro LinkedIn, firemní blog, Facebook: hodnotné články, storytelling, SEO optimalizace, návrh stylu komunikace',
    base_price: 4000,
    price_type: 'monthly',
    is_package: false
  },

  // 3. SPRÁVA REKLAMNÍCH KAMPANÍ
  {
    category: 'ads_management',
    service_name: 'Správa reklamních kampaní',
    description: 'Kompletní správa reklam na Meta (FB+IG), Google Ads a TikTok Ads: nastavení účtů, tvorba setů a vizuálů, optimalizace, analytika, A/B testování',
    base_price: 5000,
    price_type: 'monthly',
    is_package: false
  },

  // 4. MARKETINGOVÉ STRATEGIE A KONZULTACE
  {
    category: 'marketing_strategy',
    service_name: 'Marketingové strategie - Měsíční',
    description: 'Komplexní strategické řízení marketingu: brand manuál, hodnotová strategie, kontrola dodržování, školení a mentoring, strategické roadmapy',
    base_price: 5500,
    price_type: 'monthly',
    is_package: false
  },
  {
    category: 'marketing_strategy',
    service_name: 'Marketingové strategie - Úvodní balík',
    description: 'Jednorázový úvodní balík pro nastavení strategie: brand manuál, vizuální identita, mise/vize/hodnoty, positioning',
    base_price: 15000,
    price_type: 'one_time',
    is_package: false
  },

  // ====== JEDNORÁZOVÉ SLUŽBY ======
  
  // 1. GRAFICKÉ PRÁCE A VIZUÁLNÍ IDENTITA
  {
    category: 'graphics',
    service_name: 'Grafické práce',
    description: 'Bannery, plakáty, billboardy, vizitky, letáky, šablony příspěvků, loga, redesign, firemní materiály',
    base_price: 1000,
    price_type: 'one_time',
    is_package: false
  },
  {
    category: 'graphics',
    service_name: 'Vizuální identita',
    description: 'Logo + varianty, barevná paleta, typografie, pravidla pro sociální sítě a tisk, mini brand manuál nebo kompletní brand book',
    base_price: 15000,
    price_type: 'one_time',
    is_package: false
  },

  // 2. NATÁČENÍ A FOCENÍ
  {
    category: 'filming',
    service_name: 'Budget Friendly (iPhone 17 Pro)',
    description: 'Rychlé a cenově dostupné natáčení: krátká videa, Reels/TikTok, fotky, vhodné pro menší firmy. Zahrnuje střih, barvy, hudbu a základní edit',
    base_price: 1000,
    price_type: 'one_time',
    is_package: false
  },
  {
    category: 'filming',
    service_name: 'Reprezentativní filmová produkce',
    description: 'Profesionální filmové vybavení (kamera, světla, zvuk): firemní videa, reklamy, eventy, produktová videa. Profesionální postprodukce, color grading, scénář, režie',
    base_price: 3000,
    price_type: 'one_time',
    is_package: false
  },

  // 3. WEBOVÉ STRÁNKY A SYSTÉMY
  {
    category: 'web',
    service_name: 'Jednostránkový web',
    description: 'Moderní design, rychlost, základní SEO, responzivita a formuláře',
    base_price: 10000,
    price_type: 'one_time',
    is_package: false
  },
  {
    category: 'web',
    service_name: 'Multipage web',
    description: 'Vícestránkové weby, blog, portfolio, rezervace, pokročilá SEO optimalizace',
    base_price: 15000,
    price_type: 'one_time',
    is_package: false
  },
  {
    category: 'web',
    service_name: 'E-shop',
    description: 'Produktové kategorie, platební brány, doprava, napojení na sklad',
    base_price: 25000,
    price_type: 'one_time',
    is_package: false
  },
  {
    category: 'web',
    service_name: 'CRM systémy',
    description: 'Interní nástroje pro firmy: dashboardy, databáze, automatizace procesů',
    base_price: 50000,
    price_type: 'one_time',
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
