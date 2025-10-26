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
      status: 'ok'
    });
  }

  try {
    console.log('🚀 Starting migrations via API endpoint...');
    
    // Spustit bezpečné přidání sloupců
    console.log('🔧 Running addMissingColumns.js...');
    const { stdout: columnsOutput, stderr: columnsError } = await execPromise(
      'node scripts/addMissingColumns.js',
      { cwd: __dirname + '/..' }
    );
    console.log(columnsOutput);
    if (columnsError) console.error(columnsError);
    
    // Spustit seed
    console.log('🌱 Running seedPricing.js...');
    const { stdout: seedOutput, stderr: seedError } = await execPromise(
      'node scripts/seedPricing.js',
      { cwd: __dirname + '/..' }
    );
    console.log(seedOutput);
    if (seedError) console.error(seedError);
    
    setupCompleted = true;
    
    console.log('✅ Migrations completed successfully via API');
    
    res.json({
      success: true,
      message: 'Migrations completed successfully',
      output: {
        columns: columnsOutput,
        seed: seedOutput
      }
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
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

module.exports = router;
