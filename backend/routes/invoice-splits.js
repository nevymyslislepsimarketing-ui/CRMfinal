const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Uložit rozdělení pro fakturu
router.post('/invoice/:invoiceId', authMiddleware, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { splits } = req.body;

    if (!Array.isArray(splits)) {
      return res.status(400).json({ error: 'Splits musí být pole' });
    }

    // Smazat existující rozdělení
    await pool.query('DELETE FROM invoice_splits WHERE invoice_id = $1', [invoiceId]);

    // Vložit nové rozdělení
    for (const split of splits) {
      if (split.amount > 0) {
        await pool.query(
          `INSERT INTO invoice_splits (invoice_id, user_id, amount, notes)
           VALUES ($1, $2, $3, $4)`,
          [invoiceId, split.user_id, split.amount, split.notes || null]
        );
      }
    }

    res.json({ 
      success: true, 
      message: 'Rozdělení faktury uloženo',
      count: splits.filter(s => s.amount > 0).length
    });
  } catch (error) {
    console.error('Chyba při ukládání rozdělení faktury:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat rozdělení pro fakturu
router.get('/invoice/:invoiceId', authMiddleware, async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const result = await pool.query(
      `SELECT s.*, u.name as user_name
       FROM invoice_splits s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.invoice_id = $1
       ORDER BY s.user_id`,
      [invoiceId]
    );

    res.json({ splits: result.rows });
  } catch (error) {
    console.error('Chyba při načítání rozdělení faktury:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat přehled rozdělení pro uživatele
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT 
        s.*,
        i.invoice_number,
        i.amount as invoice_amount,
        i.issued_at,
        i.paid,
        c.name as client_name
       FROM invoice_splits s
       LEFT JOIN invoices i ON s.invoice_id = i.id
       LEFT JOIN clients c ON i.client_id = c.id
       WHERE s.user_id = $1
       ORDER BY i.issued_at DESC`,
      [userId]
    );

    const total = result.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0);

    res.json({ 
      splits: result.rows,
      total
    });
  } catch (error) {
    console.error('Chyba při načítání rozdělení pro uživatele:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

module.exports = router;
