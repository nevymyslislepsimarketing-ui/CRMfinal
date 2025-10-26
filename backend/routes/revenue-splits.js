const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Všechny routes jsou chráněny autentizací
router.use(authenticateToken);

// Získat rozdělení příjmů pro klienta
router.get('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        rs.*,
        u.name as user_name,
        u.email as user_email
      FROM revenue_splits rs
      LEFT JOIN users u ON rs.user_id = u.id
      WHERE rs.client_id = $1
      ORDER BY rs.amount DESC
    `, [clientId]);
    
    res.json({ splits: result.rows });
  } catch (error) {
    console.error('Chyba při získávání rozdělení:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Nastavit/aktualizovat rozdělení pro klienta
router.post('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { splits } = req.body; // [{ user_id, amount, notes }]
    
    if (!Array.isArray(splits)) {
      return res.status(400).json({ error: 'Splits musí být pole' });
    }
    
    // Smazat stávající rozdělení
    await pool.query('DELETE FROM revenue_splits WHERE client_id = $1', [clientId]);
    
    // Vložit nová rozdělení
    for (const split of splits) {
      if (split.amount > 0) {
        await pool.query(`
          INSERT INTO revenue_splits (client_id, user_id, amount, notes)
          VALUES ($1, $2, $3, $4)
        `, [clientId, split.user_id, split.amount, split.notes || null]);
      }
    }
    
    // Vrátit aktualizovaná data
    const result = await pool.query(`
      SELECT 
        rs.*,
        u.name as user_name,
        u.email as user_email
      FROM revenue_splits rs
      LEFT JOIN users u ON rs.user_id = u.id
      WHERE rs.client_id = $1
      ORDER BY rs.amount DESC
    `, [clientId]);
    
    res.json({ splits: result.rows });
  } catch (error) {
    console.error('Chyba při ukládání rozdělení:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat přehled příjmů pro pracovníka
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        rs.*,
        c.name as client_name
      FROM revenue_splits rs
      LEFT JOIN clients c ON rs.client_id = c.id
      WHERE rs.user_id = $1
      ORDER BY rs.amount DESC
    `, [userId]);
    
    // Spočítat celkový měsíční příjem
    const total = result.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0);
    
    res.json({ 
      splits: result.rows,
      total_monthly: total
    });
  } catch (error) {
    console.error('Chyba při získávání příjmů pracovníka:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

module.exports = router;
