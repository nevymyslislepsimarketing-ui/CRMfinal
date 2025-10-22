const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Všechny routes jsou chráněny autentizací
router.use(authenticateToken);

// Získat všechny uživatele
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, is_active, position, created_at FROM users ORDER BY name ASC'
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Chyba při získávání uživatelů:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Toggle user status (aktivovat/deaktivovat)
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Získat info o aktuálním uživateli
    const currentUserResult = await pool.query(
      'SELECT email, role FROM users WHERE id = $1',
      [currentUserId]
    );
    const currentUser = currentUserResult.rows[0];

    // Získat info o cílovém uživateli
    const targetUserResult = await pool.query(
      'SELECT email, role FROM users WHERE id = $1',
      [id]
    );
    
    if (targetUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }

    const targetUser = targetUserResult.rows[0];

    // Kontrola oprávnění
    const isAdmin = currentUser.email === 'info@nevymyslis.cz';
    const isManager = currentUser.role === 'manager';
    const targetIsEmployee = targetUser.role === 'employee';

    // Admin může vše, Manager jen employees
    if (!isAdmin && !(isManager && targetIsEmployee)) {
      return res.status(403).json({ error: 'Nemáte oprávnění k této akci' });
    }

    // Zabránit deaktivaci vlastního účtu
    if (parseInt(id) === currentUserId) {
      return res.status(400).json({ error: 'Nemůžete deaktivovat vlastní účet' });
    }

    // Toggle status
    const result = await pool.query(
      'UPDATE users SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, is_active',
      [id]
    );

    res.json({ 
      message: result.rows[0].is_active ? 'Uživatel aktivován' : 'Uživatel deaktivován',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Chyba při změně statusu uživatele:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Smazat uživatele
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Získat info o aktuálním uživateli
    const currentUserResult = await pool.query(
      'SELECT email, role FROM users WHERE id = $1',
      [currentUserId]
    );
    const currentUser = currentUserResult.rows[0];

    // Získat info o cílovém uživateli
    const targetUserResult = await pool.query(
      'SELECT email, role FROM users WHERE id = $1',
      [id]
    );
    
    if (targetUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }

    const targetUser = targetUserResult.rows[0];

    // Kontrola oprávnění
    const isAdmin = currentUser.email === 'info@nevymyslis.cz';
    const isManager = currentUser.role === 'manager';
    const targetIsEmployee = targetUser.role === 'employee';

    // Admin může vše, Manager jen employees
    if (!isAdmin && !(isManager && targetIsEmployee)) {
      return res.status(403).json({ error: 'Nemáte oprávnění k této akci' });
    }

    // Zabránit smazání vlastního účtu
    if (parseInt(id) === currentUserId) {
      return res.status(400).json({ error: 'Nemůžete smazat vlastní účet' });
    }

    // Zabránit smazání hlavního admin účtu
    if (targetUser.email === 'info@nevymyslis.cz') {
      return res.status(403).json({ error: 'Nelze smazat hlavní administrátorský účet' });
    }

    // Smazat uživatele (CASCADE smaže i propojené záznamy)
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'Uživatel úspěšně smazán' });
  } catch (error) {
    console.error('Chyba při mazání uživatele:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

module.exports = router;
