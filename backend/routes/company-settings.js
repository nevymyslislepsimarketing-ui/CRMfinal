const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

const router = express.Router();
router.use(authenticateToken);

// Získat fakturační údaje přihlášeného manažera
router.get('/my', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM company_settings WHERE user_id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.json({ settings: null });
    }
    
    res.json({ settings: result.rows[0] });
  } catch (error) {
    console.error('Chyba při načítání fakturačních údajů:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Vytvořit nebo aktualizovat fakturační údaje
router.post('/my', checkRole('manager'), async (req, res) => {
  const { company_name, ico, dic, address, bank_account, email, phone } = req.body;

  try {
    if (!company_name) {
      return res.status(400).json({ error: 'Název firmy je povinný' });
    }

    // Zkontrolovat, zda již existují nastavení
    const existing = await pool.query(
      'SELECT id FROM company_settings WHERE user_id = $1',
      [req.user.id]
    );

    let result;
    if (existing.rows.length > 0) {
      // Aktualizace
      result = await pool.query(
        `UPDATE company_settings 
        SET company_name = $1, ico = $2, dic = $3, address = $4, bank_account = $5, email = $6, phone = $7, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = $8 
        RETURNING *`,
        [company_name, ico, dic, address, bank_account, email, phone, req.user.id]
      );
    } else {
      // Vytvoření
      result = await pool.query(
        `INSERT INTO company_settings (user_id, company_name, ico, dic, address, bank_account, email, phone) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *`,
        [req.user.id, company_name, ico, dic, address, bank_account, email, phone]
      );
    }

    res.json({
      message: 'Fakturační údaje úspěšně uloženy',
      settings: result.rows[0]
    });
  } catch (error) {
    console.error('Chyba při ukládání fakturačních údajů:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

module.exports = router;
