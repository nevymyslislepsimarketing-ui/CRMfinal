const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Middleware pro kontrolu manažerských oprávnění
const managerOnly = (req, res, next) => {
  if (req.user.role !== 'manager' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Přístup pouze pro manažery' });
  }
  next();
};

// ===== INVOICE SPLITS (Přerozdělení faktur) =====

// Získat přerozdělení pro klienta
router.get('/splits/:clientId', authMiddleware, managerOnly, async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const result = await pool.query(`
      SELECT s.*, u.name as user_name, u.email as user_email
      FROM invoice_splits s
      JOIN users u ON s.user_id = u.id
      WHERE s.client_id = $1
      ORDER BY s.is_recurring DESC, s.amount DESC
    `, [clientId]);
    
    // Rozdělit na recurring a one-time
    const splits = {
      recurring: result.rows.filter(s => s.is_recurring),
      oneTime: result.rows.filter(s => !s.is_recurring)
    };
    
    res.json({ splits });
  } catch (error) {
    console.error('Chyba při získávání přerozdělení:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Vytvořit přerozdělení
router.post('/splits', authMiddleware, managerOnly, async (req, res) => {
  try {
    const { client_id, user_id, amount, percentage, is_recurring } = req.body;
    
    if (!client_id || !user_id || (!amount && !percentage)) {
      return res.status(400).json({ error: 'Klient, uživatel a částka/procento jsou povinné' });
    }
    
    const result = await pool.query(`
      INSERT INTO invoice_splits (client_id, user_id, amount, percentage, is_recurring)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [client_id, user_id, amount, percentage, is_recurring !== false]);
    
    res.status(201).json({ split: result.rows[0] });
  } catch (error) {
    console.error('Chyba při vytváření přerozdělení:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Aktualizovat přerozdělení
router.put('/splits/:id', authMiddleware, managerOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, percentage, is_recurring } = req.body;
    
    const result = await pool.query(`
      UPDATE invoice_splits 
      SET amount = COALESCE($1, amount),
          percentage = COALESCE($2, percentage),
          is_recurring = COALESCE($3, is_recurring),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [amount, percentage, is_recurring, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Přerozdělení nenalezeno' });
    }
    
    res.json({ split: result.rows[0] });
  } catch (error) {
    console.error('Chyba při aktualizaci přerozdělení:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Smazat přerozdělení
router.delete('/splits/:id', authMiddleware, managerOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM invoice_splits WHERE id = $1', [id]);
    
    res.json({ message: 'Přerozdělení smazáno' });
  } catch (error) {
    console.error('Chyba při mazání přerozdělení:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// ===== ONE-TIME INVOICES (Jednorázové faktury) =====

// Získat jednorázové faktury pro klienta
router.get('/one-time/:clientId', authMiddleware, managerOnly, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { paid } = req.query;
    
    let query = 'SELECT * FROM one_time_invoices WHERE client_id = $1';
    const params = [clientId];
    
    if (paid !== undefined) {
      query += ' AND paid = $2';
      params.push(paid === 'true');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    // Spočítat celkem
    const unpaidTotal = result.rows
      .filter(i => !i.paid)
      .reduce((sum, i) => sum + parseFloat(i.amount), 0);
    
    const paidTotal = result.rows
      .filter(i => i.paid)
      .reduce((sum, i) => sum + parseFloat(i.amount), 0);
    
    res.json({ 
      oneTimeInvoices: result.rows,
      summary: {
        unpaidTotal,
        paidTotal,
        totalCount: result.rows.length
      }
    });
  } catch (error) {
    console.error('Chyba při získávání jednorázových faktur:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Vytvořit jednorázovou fakturu
router.post('/one-time', authMiddleware, managerOnly, async (req, res) => {
  try {
    const { client_id, description, amount, paid } = req.body;
    
    if (!client_id || !amount) {
      return res.status(400).json({ error: 'Klient a částka jsou povinné' });
    }
    
    const result = await pool.query(`
      INSERT INTO one_time_invoices (client_id, description, amount, paid)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [client_id, description, amount, paid || false]);
    
    res.status(201).json({ oneTimeInvoice: result.rows[0] });
  } catch (error) {
    console.error('Chyba při vytváření jednorázové faktury:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Označit jako zaplacenou
router.patch('/one-time/:id/pay', authMiddleware, managerOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { invoice_id } = req.body;
    
    const result = await pool.query(`
      UPDATE one_time_invoices 
      SET paid = true, invoice_id = $1
      WHERE id = $2
      RETURNING *
    `, [invoice_id, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jednorázová faktura nenalezena' });
    }
    
    res.json({ oneTimeInvoice: result.rows[0] });
  } catch (error) {
    console.error('Chyba při označování faktury jako zaplacené:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Smazat jednorázovou fakturu
router.delete('/one-time/:id', authMiddleware, managerOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM one_time_invoices WHERE id = $1', [id]);
    
    res.json({ message: 'Jednorázová faktura smazána' });
  } catch (error) {
    console.error('Chyba při mazání jednorázové faktury:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// ===== FINANČNÍ PŘEHLED KLIENTA =====

// Získat kompletní finanční přehled klienta
router.get('/overview/:clientId', authMiddleware, managerOnly, async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Základní info klienta
    const clientResult = await pool.query(`
      SELECT id, name, monthly_recurring_amount, invoice_day, invoice_due_days
      FROM clients WHERE id = $1
    `, [clientId]);
    
    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Klient nenalezen' });
    }
    
    const client = clientResult.rows[0];
    
    // Přerozdělení pravidelných faktur
    const splitsResult = await pool.query(`
      SELECT s.*, u.name as user_name
      FROM invoice_splits s
      JOIN users u ON s.user_id = u.id
      WHERE s.client_id = $1 AND s.is_recurring = true
    `, [clientId]);
    
    // Jednorázové faktury (nezaplacené)
    const oneTimeResult = await pool.query(`
      SELECT * FROM one_time_invoices 
      WHERE client_id = $1 AND paid = false
      ORDER BY created_at DESC
    `, [clientId]);
    
    const unpaidTotal = oneTimeResult.rows.reduce((sum, i) => sum + parseFloat(i.amount), 0);
    
    // Historie faktur
    const invoicesResult = await pool.query(`
      SELECT * FROM invoices 
      WHERE client_id = $1 
      ORDER BY issued_at DESC
      LIMIT 12
    `, [clientId]);
    
    res.json({
      client,
      recurring: {
        monthly_amount: client.monthly_recurring_amount,
        splits: splitsResult.rows
      },
      oneTime: {
        unpaid: oneTimeResult.rows,
        unpaidTotal
      },
      recentInvoices: invoicesResult.rows
    });
  } catch (error) {
    console.error('Chyba při získávání finančního přehledu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Aktualizovat nastavení pravidelných faktur u klienta
router.put('/recurring-settings/:clientId', authMiddleware, managerOnly, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { monthly_recurring_amount, invoice_day, invoice_due_days } = req.body;
    
    const result = await pool.query(`
      UPDATE clients 
      SET monthly_recurring_amount = COALESCE($1, monthly_recurring_amount),
          invoice_day = COALESCE($2, invoice_day),
          invoice_due_days = COALESCE($3, invoice_due_days)
      WHERE id = $4
      RETURNING id, name, monthly_recurring_amount, invoice_day, invoice_due_days
    `, [monthly_recurring_amount, invoice_day, invoice_due_days, clientId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Klient nenalezen' });
    }
    
    res.json({ client: result.rows[0] });
  } catch (error) {
    console.error('Chyba při aktualizaci nastavení faktur:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

module.exports = router;
