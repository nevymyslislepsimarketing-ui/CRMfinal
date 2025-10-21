const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Získat všechny typy úkolů
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM task_types ORDER BY name ASC');
    res.json({ taskTypes: result.rows });
  } catch (error) {
    console.error('Chyba při získávání typů úkolů:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

module.exports = router;
