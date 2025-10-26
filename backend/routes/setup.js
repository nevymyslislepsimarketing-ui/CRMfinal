const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// ⚡ JEDNORÁZOVÝ SETUP ENDPOINT
// Pro spuštění migrací bez Shell přístupu

let setupCompleted = false;

router.post('/run-migrations', async (req, res) => {
  // Jednoduchá ochrana - heslo z env nebo z body
  const authKey = req.body.auth_key || req.headers['x-auth-key'];
  const expectedKey = process.env.SETUP_KEY || 'nevymyslis-setup-2025';
  
  if (authKey !== expectedKey) {
    return res.status(403).json({ 
      error: 'Unauthorized',
      message: 'Invalid auth key' 
    });
  }

  if (setupCompleted) {
    return res.status(200).json({ 
      message: 'Setup already completed',
      status: 'ok',
      hint: 'Use POST /api/setup/reset to run again'
    });
  }
  
  // Nastavit delší timeout pro response
  req.setTimeout(120000); // 2 minuty
  res.setTimeout(120000);

  try {
    console.log('🚀 Starting complete migrations via API endpoint...');
    const outputs = {};
    
    // 1. Základní migrace na v3 (tabulky projects, ai_post_history, atd.)
    console.log('📊 Step 1/5: Running migrateToV3.js...');
    try {
      const { stdout: migrateOutput, stderr: migrateError } = await execPromise(
        'node scripts/migrateToV3.js',
        { cwd: __dirname + '/..', timeout: 60000 }
      );
      console.log(migrateOutput);
      if (migrateError) console.warn('Migrate warnings:', migrateError);
      outputs.migrate = migrateOutput;
    } catch (err) {
      console.log('⚠️ migrateToV3.js skipped (tabulky již existují nebo chyba):', err.message);
      outputs.migrate = 'Skipped - tables may already exist';
    }
    
    // 2. Přidat chybějící sloupce (assigned_to, prompt, platform, generated_text, google_drive_link)
    console.log('🔧 Step 2/5: Running addMissingColumns.js...');
    const { stdout: columnsOutput, stderr: columnsError } = await execPromise(
      'node scripts/addMissingColumns.js',
      { cwd: __dirname + '/..', timeout: 60000 }
    );
    console.log(columnsOutput);
    if (columnsError) console.warn('Columns warnings:', columnsError);
    outputs.columns = columnsOutput;
    
    // 3. Vytvořit tabulku pro rozdělení příjmů (pravidelné faktury)
    console.log('💰 Step 3/5: Running addRevenueSplits.js...');
    const { stdout: splitsOutput, stderr: splitsError } = await execPromise(
      'node scripts/addRevenueSplits.js',
      { cwd: __dirname + '/..', timeout: 60000 }
    );
    console.log(splitsOutput);
    if (splitsError) console.warn('Splits warnings:', splitsError);
    outputs.revenue_splits = splitsOutput;

    // 4. Vytvořit tabulku pro rozdělení jednorázových faktur
    console.log('📄 Step 4/6: Running addInvoiceSplits.js...');
    const { stdout: invoiceSplitsOutput, stderr: invoiceSplitsError } = await execPromise(
      'node scripts/addInvoiceSplits.js',
      { cwd: __dirname + '/..', timeout: 60000 }
    );
    console.log(invoiceSplitsOutput);
    if (invoiceSplitsError) console.warn('Invoice splits warnings:', invoiceSplitsError);
    outputs.invoice_splits = invoiceSplitsOutput;

    // 5. Přidat fakturační údaje do users
    console.log('💼 Step 5/6: Running addBillingToUsers.js...');
    const { stdout: billingOutput, stderr: billingError } = await execPromise(
      'node scripts/addBillingToUsers.js',
      { cwd: __dirname + '/..', timeout: 60000 }
    );
    console.log(billingOutput);
    if (billingError) console.warn('Billing warnings:', billingError);
    outputs.billing_users = billingOutput;
    
    // 6. Seed ceníku
    console.log('🌱 Step 6/6: Running seedPricing.js...');
    try {
      const { stdout: seedOutput, stderr: seedError } = await execPromise(
        'node scripts/seedPricing.js',
        { cwd: __dirname + '/..', timeout: 60000 }
      );
      console.log(seedOutput);
      if (seedError) console.warn('Seed warnings:', seedError);
      outputs.seed = seedOutput;
    } catch (err) {
      console.log('⚠️ seedPricing.js skipped (služby již existují nebo chyba):', err.message);
      outputs.seed = 'Skipped - services may already exist';
    }
    
    setupCompleted = true;
    
    console.log('✅ All migrations completed successfully via API');
    
    res.json({
      success: true,
      message: 'All migrations completed successfully',
      steps: {
        '1_migrate': outputs.migrate,
        '2_columns': outputs.columns,
        '3_revenue_splits': outputs.revenue_splits,
        '4_invoice_splits': outputs.invoice_splits,
        '5_billing_users': outputs.billing_users,
        '6_seed': outputs.seed
      }
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      hint: 'Check server logs for details'
    });
  }
});

// Status check endpoint
router.get('/status', (req, res) => {
  res.json({
    setupCompleted,
    message: setupCompleted 
      ? 'Setup has been completed' 
      : 'Setup not yet run'
  });
});

// Reset endpoint (pro případ že chcete spustit migrace znovu)
router.post('/reset', (req, res) => {
  const authKey = req.body.auth_key || req.headers['x-auth-key'];
  const expectedKey = process.env.SETUP_KEY || 'nevymyslis-setup-2025';
  
  if (authKey !== expectedKey) {
    return res.status(403).json({ 
      error: 'Unauthorized',
      message: 'Invalid auth key' 
    });
  }

  setupCompleted = false;
  res.json({
    success: true,
    message: 'Setup flag reset - you can run migrations again'
  });
});

// Jednotlivé migrace (pro případ problémů s timeoutem)
const checkAuth = (req, res) => {
  const authKey = req.body.auth_key || req.headers['x-auth-key'];
  const expectedKey = process.env.SETUP_KEY || 'nevymyslis-setup-2025';
  
  if (authKey !== expectedKey) {
    res.status(403).json({ 
      error: 'Unauthorized',
      message: 'Invalid auth key' 
    });
    return false;
  }
  return true;
};

router.post('/step1-migrate', async (req, res) => {
  if (!checkAuth(req, res)) return;
  
  try {
    console.log('📊 Running migrateToV3.js...');
    const { stdout, stderr } = await execPromise(
      'node scripts/migrateToV3.js',
      { cwd: __dirname + '/..', timeout: 60000 }
    );
    console.log(stdout);
    if (stderr) console.warn(stderr);
    
    res.json({ success: true, output: stdout });
  } catch (error) {
    console.error('Error:', error.message);
    res.json({ success: false, error: error.message, hint: 'Tables may already exist - OK to skip' });
  }
});

router.post('/step2-columns', async (req, res) => {
  if (!checkAuth(req, res)) return;
  
  try {
    console.log('🔧 Running addMissingColumns.js...');
    const { stdout, stderr } = await execPromise(
      'node scripts/addMissingColumns.js',
      { cwd: __dirname + '/..', timeout: 60000 }
    );
    console.log(stdout);
    if (stderr) console.warn(stderr);
    
    res.json({ success: true, output: stdout });
  } catch (error) {
    console.error('Error:', error.message);
    res.json({ success: false, error: error.message });
  }
});

router.post('/step3-revenue', async (req, res) => {
  if (!checkAuth(req, res)) return;
  
  try {
    console.log('💰 Running addRevenueSplits.js...');
    const { stdout, stderr } = await execPromise(
      'node scripts/addRevenueSplits.js',
      { cwd: __dirname + '/..', timeout: 60000 }
    );
    console.log(stdout);
    if (stderr) console.warn(stderr);
    
    res.json({ success: true, output: stdout });
  } catch (error) {
    console.error('Error:', error.message);
    res.json({ success: false, error: error.message });
  }
});

router.post('/step4-invoice-splits', async (req, res) => {
  if (!checkAuth(req, res)) return;
  
  try {
    console.log('📄 Running addInvoiceSplits.js...');
    const { stdout, stderr } = await execPromise(
      'node scripts/addInvoiceSplits.js',
      { cwd: __dirname + '/..', timeout: 60000 }
    );
    console.log(stdout);
    if (stderr) console.warn(stderr);
    
    res.json({ success: true, output: stdout });
  } catch (error) {
    console.error('Error:', error.message);
    res.json({ success: false, error: error.message });
  }
});

router.post('/step5-billing', async (req, res) => {
  if (!checkAuth(req, res)) return;
  
  try {
    console.log('💼 Running addBillingToUsers.js...');
    const { stdout, stderr } = await execPromise(
      'node scripts/addBillingToUsers.js',
      { cwd: __dirname + '/..', timeout: 60000 }
    );
    console.log(stdout);
    if (stderr) console.warn(stderr);
    
    res.json({ success: true, output: stdout });
  } catch (error) {
    console.error('Error:', error.message);
    res.json({ success: false, error: error.message });
  }
});

router.post('/step6-seed', async (req, res) => {
  if (!checkAuth(req, res)) return;
  
  try {
    console.log('🌱 Running seedPricing.js...');
    const { stdout, stderr } = await execPromise(
      'node scripts/seedPricing.js',
      { cwd: __dirname + '/..', timeout: 60000 }
    );
    console.log(stdout);
    if (stderr) console.warn(stderr);
    
    res.json({ success: true, output: stdout });
  } catch (error) {
    console.error('Error:', error.message);
    res.json({ success: false, error: error.message, hint: 'Services may already exist - OK to skip' });
  }
});

module.exports = router;
