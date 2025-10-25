const cron = require('node-cron');
const pool = require('../db');
const emailService = require('./emailService');

// Kontrola deadlinů úkolů a projektů - každý den v 8:00
const checkDeadlines = cron.schedule('0 8 * * *', async () => {
  console.log('🔔 Kontroluji deadline notifikace...');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // 1. ÚKOLY - Email v den deadlinu
    const tasksResult = await pool.query(`
      SELECT t.*, u.email, u.name as user_name, c.name as client_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN clients c ON t.client_id = c.id
      WHERE t.deadline::date = $1 
        AND t.status NOT IN ('done', 'completed')
        AND u.email IS NOT NULL
    `, [today]);
    
    console.log(`📧 Posílám ${tasksResult.rows.length} task deadline emailů...`);
    
    for (const task of tasksResult.rows) {
      try {
        await emailService.sendTaskDeadlineEmail({
          to: task.email,
          userName: task.user_name,
          taskTitle: task.title,
          taskDescription: task.description,
          clientName: task.client_name,
          deadline: task.deadline,
          priority: task.priority
        });
        console.log(`  ✅ Email poslán: ${task.user_name} - ${task.title}`);
      } catch (error) {
        console.error(`  ❌ Chyba při posílání emailu pro úkol ${task.id}:`, error.message);
      }
    }
    
    // 2. PROJEKTY - Email den před deadlinem
    const projectsResult = await pool.query(`
      SELECT p.*, c.name as client_name, u.name as creator_name, u.email as creator_email
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.deadline::date = $1 
        AND p.status NOT IN ('completed', 'cancelled')
    `, [tomorrow]);
    
    console.log(`📧 Posílám ${projectsResult.rows.length} project deadline emailů...`);
    
    for (const project of projectsResult.rows) {
      try {
        // Poslat email tvůrci projektu
        if (project.creator_email) {
          await emailService.sendProjectDeadlineEmail({
            to: project.creator_email,
            userName: project.creator_name,
            projectName: project.name,
            projectType: project.type,
            clientName: project.client_name,
            deadline: project.deadline,
            brief: project.brief
          });
          console.log(`  ✅ Email poslán: ${project.creator_name} - ${project.name}`);
        }
        
        // Poslat email i členům týmu
        const teamResult = await pool.query(`
          SELECT u.email, u.name
          FROM project_team pt
          JOIN users u ON pt.user_id = u.id
          WHERE pt.project_id = $1 AND u.email IS NOT NULL
        `, [project.id]);
        
        for (const member of teamResult.rows) {
          await emailService.sendProjectDeadlineEmail({
            to: member.email,
            userName: member.name,
            projectName: project.name,
            projectType: project.type,
            clientName: project.client_name,
            deadline: project.deadline,
            brief: project.brief
          });
          console.log(`  ✅ Email poslán členu týmu: ${member.name}`);
        }
        
      } catch (error) {
        console.error(`  ❌ Chyba při posílání emailu pro projekt ${project.id}:`, error.message);
      }
    }
    
    console.log('✅ Deadline notifikace dokončeny');
    
  } catch (error) {
    console.error('❌ Chyba při kontrole deadlinů:', error);
  }
});

// Automatické generování pravidelných faktur - každý den v 9:00
const generateRecurringInvoices = cron.schedule('0 9 * * *', async () => {
  console.log('💰 Kontroluji automatické generování faktur...');
  
  try {
    const today = new Date();
    const currentDay = today.getDate();
    
    // Najít klienty s invoice_day = dnešní den
    const clientsResult = await pool.query(`
      SELECT id, name, email, monthly_recurring_amount, invoice_due_days, ico, dic, 
             billing_company_name, billing_address
      FROM clients
      WHERE invoice_day = $1 
        AND monthly_recurring_amount > 0
    `, [currentDay]);
    
    console.log(`📄 Generuji ${clientsResult.rows.length} pravidelných faktur...`);
    
    for (const client of clientsResult.rows) {
      try {
        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + (client.invoice_due_days || 14));
        
        // Vytvořit fakturu
        const invoiceResult = await pool.query(`
          INSERT INTO invoices 
          (client_id, issue_date, due_date, amount, status, payment_method, items, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [
          client.id,
          today,
          dueDate,
          client.monthly_recurring_amount,
          'pending',
          'bank_transfer',
          JSON.stringify([{
            description: 'Pravidelná měsíční faktura - marketingové služby',
            quantity: 1,
            unit_price: client.monthly_recurring_amount,
            total: client.monthly_recurring_amount
          }]),
          'Automaticky vygenerovaná pravidelná faktura'
        ]);
        
        console.log(`  ✅ Faktura vytvořena pro ${client.name} - ${client.monthly_recurring_amount} Kč`);
        
        // Poslat email notifikaci manažerům
        const managersResult = await pool.query(`
          SELECT email, name FROM users 
          WHERE role IN ('manager', 'admin') AND email IS NOT NULL
        `);
        
        for (const manager of managersResult.rows) {
          await emailService.sendInvoiceGeneratedEmail({
            to: manager.email,
            managerName: manager.name,
            clientName: client.name,
            amount: client.monthly_recurring_amount,
            invoiceId: invoiceResult.rows[0].id,
            dueDate: dueDate
          });
        }
        
      } catch (error) {
        console.error(`  ❌ Chyba při generování faktury pro klienta ${client.id}:`, error.message);
      }
    }
    
    console.log('✅ Automatické generování faktur dokončeno');
    
  } catch (error) {
    console.error('❌ Chyba při generování faktur:', error);
  }
});

// Spustit CRON joby
const startCronJobs = () => {
  console.log('⏰ Spouštím CRON joby...');
  checkDeadlines.start();
  generateRecurringInvoices.start();
  console.log('✅ CRON joby spuštěny');
  console.log('  - Deadline notifikace: každý den v 8:00');
  console.log('  - Generování faktur: každý den v 9:00');
};

// Zastavit CRON joby
const stopCronJobs = () => {
  console.log('🛑 Zastavuji CRON joby...');
  checkDeadlines.stop();
  generateRecurringInvoices.stop();
  console.log('✅ CRON joby zastaveny');
};

module.exports = {
  startCronJobs,
  stopCronJobs
};
