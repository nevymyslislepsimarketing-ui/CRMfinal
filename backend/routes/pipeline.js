const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Získat všechny leady
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.name as assigned_to_name
      FROM pipeline p
      LEFT JOIN users u ON p.assigned_to = u.id
      ORDER BY p.created_at DESC
    `);
    res.json({ pipeline: result.rows });
  } catch (error) {
    console.error('Chyba při získávání pipeline:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat jeden lead
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT p.*, u.name as assigned_to_name
      FROM pipeline p
      LEFT JOIN users u ON p.assigned_to = u.id
      WHERE p.id = $1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead nenalezen' });
    }
    res.json({ lead: result.rows[0] });
  } catch (error) {
    console.error('Chyba při získávání leadu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Vytvořit nový lead
router.post('/', async (req, res) => {
  const { company_name, contact_person, email, phone, stage = 'lead', value, probability, source, notes, next_action, next_action_date, assigned_to } = req.body;
  try {
    if (!company_name) {
      return res.status(400).json({ error: 'Název firmy je povinný' });
    }
    const result = await pool.query(
      `INSERT INTO pipeline (company_name, contact_person, email, phone, stage, value, probability, source, notes, next_action, next_action_date, assigned_to) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [company_name, contact_person, email, phone, stage, value, probability, source, notes, next_action, next_action_date, assigned_to]
    );
    res.status(201).json({ message: 'Lead úspěšně vytvořen', lead: result.rows[0] });
  } catch (error) {
    console.error('Chyba při vytváření leadu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Aktualizovat lead
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { company_name, contact_person, email, phone, stage, value, probability, source, notes, next_action, next_action_date, assigned_to } = req.body;
  try {
    const result = await pool.query(
      `UPDATE pipeline SET company_name = $1, contact_person = $2, email = $3, phone = $4, stage = $5, value = $6, probability = $7, source = $8, notes = $9, next_action = $10, next_action_date = $11, assigned_to = $12, updated_at = CURRENT_TIMESTAMP WHERE id = $13 RETURNING *`,
      [company_name, contact_person, email, phone, stage, value, probability, source, notes, next_action, next_action_date, assigned_to, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead nenalezen' });
    }
    res.json({ message: 'Lead úspěšně aktualizován', lead: result.rows[0] });
  } catch (error) {
    console.error('Chyba při aktualizaci leadu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Smazat lead
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM pipeline WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead nenalezen' });
    }
    res.json({ message: 'Lead úspěšně smazán' });
  } catch (error) {
    console.error('Chyba při mazání leadu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Konvertovat lead na klienta
router.post('/:id/convert', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const leadResult = await pool.query('SELECT * FROM pipeline WHERE id = $1', [id]);
    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead nenalezen' });
    }
    const lead = leadResult.rows[0];
    const clientResult = await pool.query(
      'INSERT INTO clients (name, email, phone, status, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [lead.company_name, lead.email, lead.phone, 'active', lead.notes]
    );
    await pool.query('DELETE FROM pipeline WHERE id = $1', [id]);
    res.json({ message: 'Lead úspěšně konvertován na klienta', client: clientResult.rows[0] });
  } catch (error) {
    console.error('Chyba při konverzi leadu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

module.exports = router;
