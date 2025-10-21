const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Získat všechny opakované úkoly
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT rt.*, c.name as client_name, u.name as assigned_to_name, tt.name as task_type_name, tt.icon as task_type_icon
      FROM recurring_tasks rt
      LEFT JOIN clients c ON rt.client_id = c.id
      LEFT JOIN users u ON rt.assigned_to = u.id
      LEFT JOIN task_types tt ON rt.task_type_id = tt.id
      WHERE rt.is_active = TRUE
      ORDER BY rt.created_at DESC
    `);
    res.json({ recurringTasks: result.rows });
  } catch (error) {
    console.error('Chyba při načítání opakovaných úkolů:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Vytvořit nový opakovaný úkol
router.post('/', async (req, res) => {
  const { 
    title, 
    description, 
    task_type_id, 
    recurrence_pattern, 
    frequency, 
    start_date, 
    end_date, 
    priority, 
    client_id, 
    assigned_to 
  } = req.body;

  try {
    if (!title || !start_date || !recurrence_pattern) {
      return res.status(400).json({ error: 'Název, datum a vzor opakování jsou povinné' });
    }

    // Vytvořit recurring task
    const recurringResult = await pool.query(
      `INSERT INTO recurring_tasks 
      (title, description, task_type_id, recurrence_pattern, frequency, start_date, end_date, priority, client_id, assigned_to) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`,
      [title, description, task_type_id, recurrence_pattern, frequency, start_date, end_date, priority, client_id, assigned_to]
    );

    const recurringTask = recurringResult.rows[0];

    // Vytvořit první skutečný úkol
    await pool.query(
      `INSERT INTO tasks 
      (title, description, deadline, priority, status, client_id, assigned_to, task_type_id, recurring_task_id) 
      VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8)`,
      [title, description, start_date, priority, client_id, assigned_to, task_type_id, recurringTask.id]
    );

    res.status(201).json({
      message: 'Opakovaný úkol úspěšně vytvořen a první instance byla přidána',
      recurringTask: recurringTask
    });
  } catch (error) {
    console.error('Chyba při vytváření opakovaného úkolu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Deaktivovat opakovaný úkol
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE recurring_tasks SET is_active = FALSE WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opakovaný úkol nenalezen' });
    }
    res.json({ message: 'Opakovaný úkol deaktivován' });
  } catch (error) {
    console.error('Chyba při deaktivaci opakovaného úkolu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

module.exports = router;
