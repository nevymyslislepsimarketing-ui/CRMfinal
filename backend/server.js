const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const clientsRoutes = require('./routes/clients');
const tasksRoutes = require('./routes/tasks');
const invoicesRoutes = require('./routes/invoices');
const dashboardRoutes = require('./routes/dashboard');
const usersRoutes = require('./routes/users');
const pipelineRoutes = require('./routes/pipeline');
const taskTypesRoutes = require('./routes/task-types');
const recurringTasksRoutes = require('./routes/recurring-tasks');
const companySettingsRoutes = require('./routes/company-settings');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// CORS - povolit přístup z Cloudflare Pages (nebo localhost pro development)
const corsOptions = {
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Základní route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Nevymyslíš CRM API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      clients: '/api/clients',
      tasks: '/api/tasks',
      invoices: '/api/invoices',
      dashboard: '/api/dashboard',
      users: '/api/users',
      pipeline: '/api/pipeline',
      taskTypes: '/api/task-types',
      recurringTasks: '/api/recurring-tasks',
      companySettings: '/api/company-settings',
      invoicesPdf: '/api/invoices/:id/html'
    }
  });
});

// Health check endpoint pro Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/pipeline', pipelineRoutes);
app.use('/api/task-types', taskTypesRoutes);
app.use('/api/recurring-tasks', recurringTasksRoutes);
app.use('/api/company-settings', companySettingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint nenalezen' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Interní chyba serveru' });
});

// Start serveru
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 Nevymyslíš CRM Backend Server    ║
║                                        ║
║   Port: ${PORT}                         ║
║   Prostředí: ${process.env.NODE_ENV}   ║
║                                        ║
║   API: http://localhost:${PORT}/api   ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
