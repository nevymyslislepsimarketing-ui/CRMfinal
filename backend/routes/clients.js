const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Všechny routes jsou chráněny autentizací
router.use(authenticateToken);

// Získat všechny klienty
router.get('/', async (req, res) => {
  try {
    // Manažeři vidí všechny klienty, zaměstnanci jen ty, které mají zpřístupněné
    let query;
    let params = [];
    
    if (req.user.role === 'manager') {
      // Manažer vidí všechny
      query = 'SELECT * FROM clients ORDER BY created_at DESC';
    } else {
      // Zaměstnanec vidí jen zpřístupněné
      query = `
        SELECT DISTINCT c.* 
        FROM clients c
        INNER JOIN client_users cu ON c.id = cu.client_id
        WHERE cu.user_id = $1
        ORDER BY c.created_at DESC
      `;
      params = [req.user.id];
    }
    
    const result = await pool.query(query, params);
    res.json({ clients: result.rows });
  } catch (error) {
    console.error('Chyba při získávání klientů:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat jednoho klienta podle ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Klient nenalezen' });
    }

    res.json({ client: result.rows[0] });
  } catch (error) {
    console.error('Chyba při získávání klienta:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Vytvořit nového klienta
router.post('/', async (req, res) => {
  const { name, email, phone, status = 'active', notes, billing_company_name, ico, dic, billing_address, google_drive_link } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: 'Jméno klienta je povinné' });
    }

    const result = await pool.query(
      'INSERT INTO clients (name, email, phone, status, notes, billing_company_name, ico, dic, billing_address, google_drive_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [name, email, phone, status, notes, billing_company_name, ico, dic, billing_address, google_drive_link]
    );

    res.status(201).json({
      message: 'Klient úspěšně vytvořen',
      client: result.rows[0]
    });
  } catch (error) {
    console.error('Chyba při vytváření klienta:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Aktualizovat klienta
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    name, email, phone, status, notes, 
    billing_company_name, ico, dic, billing_address, google_drive_link,
    monthly_recurring_amount, invoice_day, invoice_due_days
  } = req.body;

  try {
    // Pokud aktualizujeme jen fakturační údaje (pravidelná faktura)
    if (monthly_recurring_amount !== undefined && name === undefined) {
      const result = await pool.query(
        `UPDATE clients SET 
          monthly_recurring_amount = $1, 
          invoice_day = $2, 
          invoice_due_days = $3,
          updated_at = CURRENT_TIMESTAMP 
          WHERE id = $4 RETURNING *`,
        [monthly_recurring_amount, invoice_day, invoice_due_days, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Klient nenalezen' });
      }

      return res.json({
        message: 'Fakturační údaje aktualizovány',
        client: result.rows[0]
      });
    }

    // Jinak aktualizujeme všechna pole (standardní editace klienta)
    const result = await pool.query(
      `UPDATE clients SET 
        name = $1, email = $2, phone = $3, status = $4, notes = $5, 
        billing_company_name = $6, ico = $7, dic = $8, billing_address = $9, google_drive_link = $10,
        updated_at = CURRENT_TIMESTAMP 
        WHERE id = $11 RETURNING *`,
      [name, email, phone, status, notes, billing_company_name, ico, dic, billing_address, google_drive_link, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Klient nenalezen' });
    }

    res.json({
      message: 'Klient úspěšně aktualizován',
      client: result.rows[0]
    });
  } catch (error) {
    console.error('Chyba při aktualizaci klienta:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Smazat klienta
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Klient nenalezen' });
    }

    res.json({ message: 'Klient úspěšně smazán' });
  } catch (error) {
    console.error('Chyba při mazání klienta:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat uživatele s přístupem ke klientovi (pouze pro manažery)
router.get('/:id/users', async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Přístup odepřen' });
  }

  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role
      FROM users u
      INNER JOIN client_users cu ON u.id = cu.user_id
      WHERE cu.client_id = $1
      ORDER BY u.name
    `, [id]);

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Chyba při získávání uživatelů klienta:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Přidat uživateli přístup ke klientovi (pouze pro manažery)
router.post('/:id/users/:userId', async (req, res) => {
  const { id, userId } = req.params;

  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Přístup odepřen' });
  }

  try {
    await pool.query(
      'INSERT INTO client_users (client_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [id, userId]
    );

    res.json({ message: 'Přístup úspěšně přiřazen' });
  } catch (error) {
    console.error('Chyba při přiřazování přístupu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Odebrat uživateli přístup ke klientovi (pouze pro manažery)
router.delete('/:id/users/:userId', async (req, res) => {
  const { id, userId } = req.params;

  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Přístup odepřen' });
  }

  try {
    await pool.query(
      'DELETE FROM client_users WHERE client_id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({ message: 'Přístup úspěšně odebrán' });
  } catch (error) {
    console.error('Chyba při odebírání přístupu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat přihlašovací údaje klienta
router.get('/:id/credentials', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM client_credentials WHERE client_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({ credentials: result.rows });
  } catch (error) {
    console.error('Chyba při získávání přihlašovacích údajů:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Přidat přihlašovací údaje klienta
router.post('/:id/credentials', async (req, res) => {
  const { id } = req.params;
  const { platform, username, password, notes } = req.body;

  try {
    if (!platform) {
      return res.status(400).json({ error: 'Platforma je povinná' });
    }

    const result = await pool.query(
      'INSERT INTO client_credentials (client_id, platform, username, password, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, platform, username, password, notes]
    );

    res.status(201).json({
      message: 'Přihlašovací údaje úspěšně přidány',
      credential: result.rows[0]
    });
  } catch (error) {
    console.error('Chyba při přidávání přihlašovacích údajů:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Aktualizovat přihlašovací údaje
router.put('/:id/credentials/:credentialId', async (req, res) => {
  const { id, credentialId } = req.params;
  const { platform, username, password, notes } = req.body;

  try {
    const result = await pool.query(
      'UPDATE client_credentials SET platform = $1, username = $2, password = $3, notes = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND client_id = $6 RETURNING *',
      [platform, username, password, notes, credentialId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Přihlašovací údaje nenalezeny' });
    }

    res.json({
      message: 'Přihlašovací údaje úspěšně aktualizovány',
      credential: result.rows[0]
    });
  } catch (error) {
    console.error('Chyba při aktualizaci přihlašovacích údajů:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Smazat přihlašovací údaje
router.delete('/:id/credentials/:credentialId', async (req, res) => {
  const { id, credentialId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM client_credentials WHERE id = $1 AND client_id = $2 RETURNING *',
      [credentialId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Přihlašovací údaje nenalezeny' });
    }

    res.json({ message: 'Přihlašovací údaje úspěšně smazány' });
  } catch (error) {
    console.error('Chyba při mazání přihlašovacích údajů:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

module.exports = router;
