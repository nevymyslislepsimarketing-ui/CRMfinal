const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');
const { sendNewTaskEmail } = require('../services/emailService');

const router = express.Router();

// Všechny routes jsou chráněny autentizací
router.use(authenticateToken);

// Získat všechny úkoly s informacemi o klientovi a přiřazeném uživateli
router.get('/', async (req, res) => {
  try {
    // Zobrazit pouze nekompletní úkoly nebo kompletní které NEJSOU součástí opakovaných úkolů
    // Tím zajistíme že z recurring úkolů vidíme jen aktuální (pending/in_progress)
    
    // Manažeři vidí všechny úkoly, zaměstnanci jen své
    let query = `
      SELECT 
        t.*,
        c.name as client_name,
        c.google_drive_url as client_google_drive_url,
        u.name as assigned_to_name,
        tt.name as task_type_name,
        tt.icon as task_type_icon,
        tt.color as task_type_color
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN task_types tt ON t.task_type_id = tt.id
      WHERE (t.status != 'completed' OR t.recurring_task_id IS NULL)
    `;
    
    // Pokud není manažer, zobrazit jen úkoly přiřazené tomuto uživateli
    if (req.user.role !== 'manager') {
      query += ` AND t.assigned_to = ${req.user.id}`;
    }
    
    query += ` ORDER BY t.created_at DESC`;
    
    const result = await pool.query(query);
    res.json({ tasks: result.rows });
  } catch (error) {
    console.error('Chyba při získávání úkolů:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat jeden úkol podle ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        c.name as client_name,
        u.name as assigned_to_name
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Úkol nenalezen' });
    }

    res.json({ task: result.rows[0] });
  } catch (error) {
    console.error('Chyba při získávání úkolu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Vytvořit nový úkol
router.post('/', async (req, res) => {
  const { title, description, deadline, priority = 'medium', status = 'pending', client_id, assigned_to, task_type_id, start_time, end_time } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ error: 'Název úkolu je povinný' });
    }

    const result = await pool.query(
      'INSERT INTO tasks (title, description, deadline, priority, status, client_id, assigned_to, task_type_id, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [title, description, deadline, priority, status, client_id, assigned_to, task_type_id, start_time, end_time]
    );

    const createdTask = result.rows[0];

    // Odeslat email, pokud je úkol přiřazen někomu jinému než tvůrci
    if (assigned_to && assigned_to !== req.user.id) {
      try {
        // Získat informace o přiřazeném uživateli
        const userResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [assigned_to]);
        
        if (userResult.rows.length > 0) {
          const assignedUser = userResult.rows[0];
          
          // Získat jméno klienta, pokud existuje
          let clientName = null;
          if (client_id) {
            const clientResult = await pool.query('SELECT name FROM clients WHERE id = $1', [client_id]);
            if (clientResult.rows.length > 0) {
              clientName = clientResult.rows[0].name;
            }
          }
          
          // Odeslat email (bez čekání na dokončení)
          sendNewTaskEmail(assignedUser, {
            ...createdTask,
            client_name: clientName
          }, req.user.name).catch(err => {
            console.error('Chyba při odesílání emailu o úkolu:', err);
          });
        }
      } catch (emailError) {
        console.error('Chyba při zpracování emailu:', emailError);
        // Nepřerušujeme proces - úkol byl vytvořen
      }
    }

    res.status(201).json({
      message: 'Úkol úspěšně vytvořen',
      task: createdTask
    });
  } catch (error) {
    console.error('Chyba při vytváření úkolu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Aktualizovat úkol
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, deadline, priority, status, client_id, assigned_to, task_type_id, start_time, end_time } = req.body;

  try {
    // Získat původní úkol
    const originalTask = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (originalTask.rows.length === 0) {
      return res.status(404).json({ error: 'Úkol nenalezen' });
    }

    const oldStatus = originalTask.rows[0].status;
    const recurringTaskId = originalTask.rows[0].recurring_task_id;

    // Aktualizovat úkol
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, deadline = $3, priority = $4, status = $5, client_id = $6, assigned_to = $7, task_type_id = $8, start_time = $9, end_time = $10, updated_at = CURRENT_TIMESTAMP WHERE id = $11 RETURNING *',
      [title, description, deadline, priority, status, client_id, assigned_to, task_type_id, start_time, end_time, id]
    );

    // Pokud byl úkol dokončen a je součástí opakovaného úkolu, vytvoř další
    if (oldStatus !== 'completed' && status === 'completed' && recurringTaskId) {
      // Načíst recurring task
      const recurringResult = await pool.query('SELECT * FROM recurring_tasks WHERE id = $1 AND is_active = TRUE', [recurringTaskId]);
      
      if (recurringResult.rows.length > 0) {
        const recurring = recurringResult.rows[0];
        
        // Vypočítat další datum podle recurrence pattern
        const currentDeadline = new Date(deadline || new Date());
        let nextDeadline = new Date(currentDeadline);
        
        switch (recurring.recurrence_pattern) {
          case 'daily':
            nextDeadline.setDate(nextDeadline.getDate() + (recurring.frequency || 1));
            break;
          case 'weekly':
            nextDeadline.setDate(nextDeadline.getDate() + (7 * (recurring.frequency || 1)));
            break;
          case 'monthly':
            nextDeadline.setMonth(nextDeadline.getMonth() + (recurring.frequency || 1));
            break;
        }

        // Zkontrolovat zda není po end_date
        if (!recurring.end_date || nextDeadline <= new Date(recurring.end_date)) {
          // Vytvořit další úkol
          await pool.query(
            `INSERT INTO tasks 
            (title, description, deadline, priority, status, client_id, assigned_to, task_type_id, recurring_task_id) 
            VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8)`,
            [recurring.title, recurring.description, nextDeadline, recurring.priority, recurring.client_id, recurring.assigned_to, recurring.task_type_id, recurringTaskId]
          );
        }
      }
    }

    res.json({
      message: 'Úkol úspěšně aktualizován',
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Chyba při aktualizaci úkolu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Smazat úkol
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Úkol nenalezen' });
    }

    res.json({ message: 'Úkol úspěšně smazán' });
  } catch (error) {
    console.error('Chyba při mazání úkolu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

module.exports = router;
