const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Získat všechny služby z ceníku
router.get('/services', authMiddleware, async (req, res) => {
  try {
    const { category, price_type } = req.query;
    
    let query = 'SELECT * FROM service_pricing WHERE active = true';
    const params = [];
    let paramCount = 1;
    
    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }
    
    if (price_type) {
      query += ` AND price_type = $${paramCount}`;
      params.push(price_type);
      paramCount++;
    }
    
    query += ' ORDER BY category, base_price';
    
    const result = await pool.query(query, params);
    
    // Seskupit podle kategorií
    const servicesByCategory = result.rows.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {});
    
    res.json({ 
      services: result.rows,
      servicesByCategory 
    });
  } catch (error) {
    console.error('Chyba při získávání služeb:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Vytvořit nabídku pro klienta
router.post('/quotes', authMiddleware, async (req, res) => {
  try {
    const { client_id, quote_name, services, custom_adjustments } = req.body;
    
    if (!client_id || !services || !Array.isArray(services)) {
      return res.status(400).json({ error: 'Klient a služby jsou povinné' });
    }
    
    // Vypočítat celkové ceny
    let monthly_total = 0;
    let one_time_total = 0;
    
    for (const service of services) {
      if (service.price_type === 'monthly') {
        monthly_total += parseFloat(service.price || service.base_price || 0);
      } else if (service.price_type === 'one_time') {
        one_time_total += parseFloat(service.price || service.base_price || 0);
      }
    }
    
    const result = await pool.query(`
      INSERT INTO client_quotes 
      (client_id, quote_name, services, monthly_total, one_time_total, custom_adjustments, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      client_id,
      quote_name || 'Nabídka služeb',
      JSON.stringify(services),
      monthly_total,
      one_time_total,
      custom_adjustments,
      req.user.userId
    ]);
    
    // Aktualizovat monthly_recurring_amount u klienta pokud je to schváleno
    if (req.body.apply_to_client) {
      await pool.query(`
        UPDATE clients 
        SET monthly_recurring_amount = $1 
        WHERE id = $2
      `, [monthly_total, client_id]);
    }
    
    res.status(201).json({ quote: result.rows[0] });
  } catch (error) {
    console.error('Chyba při vytváření nabídky:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat všechny nabídky
router.get('/quotes', authMiddleware, async (req, res) => {
  try {
    const { client_id, status } = req.query;
    
    let query = `
      SELECT q.*, c.name as client_name, u.name as created_by_name
      FROM client_quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (client_id) {
      query += ` AND q.client_id = $${paramCount}`;
      params.push(client_id);
      paramCount++;
    }
    
    if (status) {
      query += ` AND q.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    query += ' ORDER BY q.created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({ quotes: result.rows });
  } catch (error) {
    console.error('Chyba při získávání nabídek:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat detail nabídky
router.get('/quotes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT q.*, c.name as client_name, u.name as created_by_name
      FROM client_quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nabídka nenalezena' });
    }
    
    res.json({ quote: result.rows[0] });
  } catch (error) {
    console.error('Chyba při získávání nabídky:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Aktualizovat nabídku
router.put('/quotes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { quote_name, services, monthly_total, one_time_total, custom_adjustments, status } = req.body;
    
    const result = await pool.query(`
      UPDATE client_quotes 
      SET quote_name = COALESCE($1, quote_name),
          services = COALESCE($2, services),
          monthly_total = COALESCE($3, monthly_total),
          one_time_total = COALESCE($4, one_time_total),
          custom_adjustments = COALESCE($5, custom_adjustments),
          status = COALESCE($6, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [quote_name, services ? JSON.stringify(services) : null, monthly_total, one_time_total, custom_adjustments, status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nabídka nenalezena' });
    }
    
    res.json({ quote: result.rows[0] });
  } catch (error) {
    console.error('Chyba při aktualizaci nabídky:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Schválit nabídku a aplikovat na klienta
router.post('/quotes/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Získat nabídku
    const quoteResult = await pool.query(
      'SELECT * FROM client_quotes WHERE id = $1',
      [id]
    );
    
    if (quoteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Nabídka nenalezena' });
    }
    
    const quote = quoteResult.rows[0];
    
    // Aktualizovat status nabídky
    await pool.query(
      'UPDATE client_quotes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['approved', id]
    );
    
    // Aplikovat na klienta
    await pool.query(`
      UPDATE clients 
      SET monthly_recurring_amount = $1 
      WHERE id = $2
    `, [quote.monthly_total, quote.client_id]);
    
    res.json({ message: 'Nabídka schválena a aplikována na klienta' });
  } catch (error) {
    console.error('Chyba při schvalování nabídky:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Smazat nabídku
router.delete('/quotes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM client_quotes WHERE id = $1', [id]);
    
    res.json({ message: 'Nabídka smazána' });
  } catch (error) {
    console.error('Chyba při mazání nabídky:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

module.exports = router;
