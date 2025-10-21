const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Všechny routes jsou chráněny autentizací
router.use(authenticateToken);

// Získat všechny uživatele (pro přiřazování úkolů)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role FROM users ORDER BY name ASC'
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Chyba při získávání uživatelů:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

module.exports = router;
