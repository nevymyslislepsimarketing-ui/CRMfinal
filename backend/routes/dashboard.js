const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Dashboard route je chráněna autentizací
router.use(authenticateToken);

// Získat statistiky pro dashboard
router.get('/stats', async (req, res) => {
  try {
    // Počet všech klientů
    const clientsResult = await pool.query('SELECT COUNT(*) as total FROM clients');
    const totalClients = parseInt(clientsResult.rows[0].total);

    // Počet aktivních klientů
    const activeClientsResult = await pool.query(
      "SELECT COUNT(*) as total FROM clients WHERE status = 'active'"
    );
    const activeClients = parseInt(activeClientsResult.rows[0].total);

    // Počet nehotových úkolů
    // Manažeři vidí všechny, zaměstnanci jen své
    let pendingTasksQuery = "SELECT COUNT(*) as total FROM tasks WHERE status != 'completed'";
    if (req.user.role !== 'manager') {
      pendingTasksQuery += ` AND assigned_to = ${req.user.id}`;
    }
    const pendingTasksResult = await pool.query(pendingTasksQuery);
    const pendingTasks = parseInt(pendingTasksResult.rows[0].total);

    // Počet faktur po splatnosti (nezaplacených a po termínu)
    const overdueInvoicesResult = await pool.query(
      'SELECT COUNT(*) as total FROM invoices WHERE paid = false AND due_date < CURRENT_DATE'
    );
    const overdueInvoices = parseInt(overdueInvoicesResult.rows[0].total);

    // Celkový počet faktur
    const totalInvoicesResult = await pool.query('SELECT COUNT(*) as total FROM invoices');
    const totalInvoices = parseInt(totalInvoicesResult.rows[0].total);

    // Celková částka nezaplacených faktur
    const unpaidAmountResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE paid = false'
    );
    const unpaidAmount = parseFloat(unpaidAmountResult.rows[0].total);

    // Vyfakturováno za tento měsíc (zaplacené faktury)
    const monthlyPaidResult = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM invoices 
      WHERE paid = true 
      AND EXTRACT(MONTH FROM issued_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM issued_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);
    const monthlyPaidAmount = parseFloat(monthlyPaidResult.rows[0].total);

    // Nedávné úkoly (posledních 5)
    // Manažeři vidí všechny, zaměstnanci jen své
    let recentTasksQuery = `
      SELECT 
        t.*,
        c.name as client_name,
        u.name as assigned_to_name
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN users u ON t.assigned_to = u.id
    `;
    
    if (req.user.role !== 'manager') {
      recentTasksQuery += ` WHERE t.assigned_to = ${req.user.id}`;
    }
    
    recentTasksQuery += ` ORDER BY t.created_at DESC LIMIT 5`;
    const recentTasksResult = await pool.query(recentTasksQuery);

    // Nadcházející úkoly (podle deadline)
    let upcomingTasksQuery = `
      SELECT 
        t.*,
        c.name as client_name,
        u.name as assigned_to_name
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.status != 'completed' AND t.deadline >= CURRENT_DATE
    `;
    
    if (req.user.role !== 'manager') {
      upcomingTasksQuery += ` AND t.assigned_to = ${req.user.id}`;
    }
    
    upcomingTasksQuery += ` ORDER BY t.deadline ASC LIMIT 5`;
    const upcomingTasksResult = await pool.query(upcomingTasksQuery);

    // Nedávné faktury
    const recentInvoicesResult = await pool.query(`
      SELECT 
        i.*,
        c.name as client_name
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      ORDER BY i.created_at DESC
      LIMIT 5
    `);

    res.json({
      stats: {
        totalClients,
        activeClients,
        pendingTasks,
        overdueInvoices,
        totalInvoices,
        unpaidAmount,
        monthlyPaidAmount
      },
      recentTasks: recentTasksResult.rows,
      upcomingTasks: upcomingTasksResult.rows,
      recentInvoices: recentInvoicesResult.rows
    });
  } catch (error) {
    console.error('Chyba při získávání statistik:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

module.exports = router;
