const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Získat všechny projekty
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { client_id, status, type } = req.query;
    
    let query = `
      SELECT p.*, 
        c.name as client_name,
        u.name as created_by_name,
        (SELECT COUNT(*) FROM project_checklist WHERE project_id = p.id) as total_tasks,
        (SELECT COUNT(*) FROM project_checklist WHERE project_id = p.id AND completed = true) as completed_tasks
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (client_id) {
      query += ` AND p.client_id = $${paramCount}`;
      params.push(client_id);
      paramCount++;
    }
    
    if (status) {
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    if (type) {
      query += ` AND p.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({ projects: result.rows });
  } catch (error) {
    console.error('Chyba při získávání projektů:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat detail projektu
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Základní info
    const projectResult = await pool.query(`
      SELECT p.*, 
        c.name as client_name,
        c.email as client_email,
        u.name as created_by_name
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = $1
    `, [id]);
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Projekt nenalezen' });
    }
    
    // Milestones
    const milestonesResult = await pool.query(`
      SELECT * FROM project_milestones 
      WHERE project_id = $1 
      ORDER BY deadline ASC
    `, [id]);
    
    // Team
    const teamResult = await pool.query(`
      SELECT pt.*, u.name as user_name, u.email as user_email
      FROM project_team pt
      JOIN users u ON pt.user_id = u.id
      WHERE pt.project_id = $1
    `, [id]);
    
    // Checklist
    const checklistResult = await pool.query(`
      SELECT pc.*, u.name as assigned_to_name
      FROM project_checklist pc
      LEFT JOIN users u ON pc.assigned_to = u.id
      WHERE pc.project_id = $1
      ORDER BY pc.order_index, pc.id
    `, [id]);
    
    const project = {
      ...projectResult.rows[0],
      milestones: milestonesResult.rows,
      team: teamResult.rows,
      checklist: checklistResult.rows
    };
    
    res.json({ project });
  } catch (error) {
    console.error('Chyba při získávání projektu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Vytvořit projekt
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { client_id, name, type, brief, deadline, status } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Název a typ projektu jsou povinné' });
    }
    
    const result = await pool.query(`
      INSERT INTO projects (client_id, name, type, brief, deadline, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [client_id, name, type, brief, deadline, status || 'in_progress', req.user.userId]);
    
    res.status(201).json({ project: result.rows[0] });
  } catch (error) {
    console.error('Chyba při vytváření projektu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Aktualizovat projekt
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id, name, type, brief, deadline, status } = req.body;
    
    const result = await pool.query(`
      UPDATE projects 
      SET client_id = COALESCE($1, client_id),
          name = COALESCE($2, name),
          type = COALESCE($3, type),
          brief = COALESCE($4, brief),
          deadline = COALESCE($5, deadline),
          status = COALESCE($6, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [client_id, name, type, brief, deadline, status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Projekt nenalezen' });
    }
    
    res.json({ project: result.rows[0] });
  } catch (error) {
    console.error('Chyba při aktualizaci projektu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Smazat projekt
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    
    res.json({ message: 'Projekt smazán' });
  } catch (error) {
    console.error('Chyba při mazání projektu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// ===== MILESTONES =====

router.post('/:id/milestones', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, deadline } = req.body;
    
    const result = await pool.query(`
      INSERT INTO project_milestones (project_id, title, deadline)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id, title, deadline]);
    
    res.status(201).json({ milestone: result.rows[0] });
  } catch (error) {
    console.error('Chyba při vytváření milníku:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

router.put('/:id/milestones/:milestoneId', authMiddleware, async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const { title, deadline, completed } = req.body;
    
    const result = await pool.query(`
      UPDATE project_milestones 
      SET title = COALESCE($1, title),
          deadline = COALESCE($2, deadline),
          completed = COALESCE($3, completed)
      WHERE id = $4
      RETURNING *
    `, [title, deadline, completed, milestoneId]);
    
    res.json({ milestone: result.rows[0] });
  } catch (error) {
    console.error('Chyba při aktualizaci milníku:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

router.delete('/:id/milestones/:milestoneId', authMiddleware, async (req, res) => {
  try {
    const { milestoneId } = req.params;
    
    await pool.query('DELETE FROM project_milestones WHERE id = $1', [milestoneId]);
    
    res.json({ message: 'Milník smazán' });
  } catch (error) {
    console.error('Chyba při mazání milníku:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// ===== TEAM =====

router.post('/:id/team', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, role } = req.body;
    
    const result = await pool.query(`
      INSERT INTO project_team (project_id, user_id, role)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id, user_id, role]);
    
    res.status(201).json({ teamMember: result.rows[0] });
  } catch (error) {
    console.error('Chyba při přidávání člena týmu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

router.delete('/:id/team/:teamId', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    await pool.query('DELETE FROM project_team WHERE id = $1', [teamId]);
    
    res.json({ message: 'Člen týmu odstraněn' });
  } catch (error) {
    console.error('Chyba při odstraňování člena týmu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// ===== CHECKLIST =====

router.post('/:id/checklist', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { task_title, assigned_to, order_index } = req.body;
    
    const result = await pool.query(`
      INSERT INTO project_checklist (project_id, task_title, assigned_to, order_index)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id, task_title, assigned_to, order_index || 0]);
    
    res.status(201).json({ checklistItem: result.rows[0] });
  } catch (error) {
    console.error('Chyba při vytváření checklist položky:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

router.put('/:id/checklist/:checklistId', authMiddleware, async (req, res) => {
  try {
    const { checklistId } = req.params;
    const { task_title, completed, assigned_to, order_index } = req.body;
    
    const result = await pool.query(`
      UPDATE project_checklist 
      SET task_title = COALESCE($1, task_title),
          completed = COALESCE($2, completed),
          assigned_to = COALESCE($3, assigned_to),
          order_index = COALESCE($4, order_index)
      WHERE id = $5
      RETURNING *
    `, [task_title, completed, assigned_to, order_index, checklistId]);
    
    res.json({ checklistItem: result.rows[0] });
  } catch (error) {
    console.error('Chyba při aktualizaci checklist položky:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

router.delete('/:id/checklist/:checklistId', authMiddleware, async (req, res) => {
  try {
    const { checklistId } = req.params;
    
    await pool.query('DELETE FROM project_checklist WHERE id = $1', [checklistId]);
    
    res.json({ message: 'Checklist položka smazána' });
  } catch (error) {
    console.error('Chyba při mazání checklist položky:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

module.exports = router;
