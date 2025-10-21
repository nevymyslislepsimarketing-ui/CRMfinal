const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

const router = express.Router();

// Registrace nového uživatele
router.post('/register', async (req, res) => {
  const { name, email, password, role = 'employee', position } = req.body;

  try {
    console.log('📝 Pokus o registraci uživatele:', email);
    
    // Validace
    if (!name || !email || !password) {
      console.log('❌ Validace selhala - chybí povinná pole');
      return res.status(400).json({ error: 'Všechna pole jsou povinná' });
    }

    // Kontrola JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET není nastavený v .env souboru!');
      return res.status(500).json({ error: 'Chyba konfigurace serveru - JWT_SECRET' });
    }

    // Kontrola existence uživatele
    console.log('🔍 Kontrola existence uživatele...');
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('❌ Uživatel již existuje');
      return res.status(400).json({ error: 'Uživatel s tímto emailem již existuje' });
    }

    // Hashování hesla
    console.log('🔐 Hashování hesla...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Vytvoření uživatele s vynucenou změnou hesla
    console.log('💾 Ukládání uživatele do databáze...');
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, position, force_password_change) VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING id, name, email, role, position',
      [name, email, hashedPassword, role, position || null]
    );

    const user = result.rows[0];
    console.log('✅ Uživatel vytvořen:', user.id);
    console.log('⚠️  Uživatel bude muset změnit heslo při prvním přihlášení');

    // Odeslat uvítací email s přihlašovacími údaji
    const emailResult = await sendWelcomeEmail(user, password);
    
    if (emailResult.success) {
      console.log('✅ Uvítací email odeslán na:', user.email);
    } else {
      console.error('⚠️  Email se nepodařilo odeslat:', emailResult.error);
    }

    res.status(201).json({
      message: 'Uživatel úspěšně vytvořen. Přihlašovací údaje byly odeslány na email.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        initialPassword: emailResult.success ? undefined : password // Zobrazit heslo pouze pokud email selhal
      },
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('❌ Chyba při registraci:', error.message);
    console.error('Stack:', error.stack);
    
    // Specifické chyby databáze
    if (error.code === '42P01') {
      return res.status(500).json({ 
        error: 'Databázová tabulka neexistuje. Spusťte: npm run init-db' 
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(500).json({ 
        error: 'Nelze se připojit k databázi. Zkontrolujte, zda běží PostgreSQL.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Chyba serveru při registraci',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Přihlášení uživatele
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('🔑 Pokus o přihlášení uživatele:', email);
    
    // Validace
    if (!email || !password) {
      console.log('❌ Validace selhala - chybí email nebo heslo');
      return res.status(400).json({ error: 'Email a heslo jsou povinné' });
    }

    // Kontrola JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET není nastavený v .env souboru!');
      return res.status(500).json({ error: 'Chyba konfigurace serveru - JWT_SECRET' });
    }

    // Nalezení uživatele
    console.log('🔍 Hledání uživatele v databázi...');
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ Uživatel nenalezen');
      return res.status(401).json({ error: 'Neplatné přihlašovací údaje' });
    }

    const user = result.rows[0];
    console.log('✅ Uživatel nalezen:', user.id);

    // Ověření hesla
    console.log('🔐 Ověřování hesla...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      console.log('❌ Neplatné heslo');
      return res.status(401).json({ error: 'Neplatné přihlašovací údaje' });
    }

    console.log('✅ Heslo ověřeno');

    // Kontrola force_password_change
    if (user.force_password_change) {
      console.log('⚠️  Nutná změna hesla');
      
      // Vytvoření dočasného tokenu pro změnu hesla (kratší platnost)
      const tempToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, temp: true },
        process.env.JWT_SECRET,
        { expiresIn: '30m' }
      );

      return res.json({
        requirePasswordChange: true,
        tempToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    }

    // Vytvoření JWT tokenu
    console.log('🎫 Generování JWT tokenu...');
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Přihlášení úspěšné');
    res.json({
      message: 'Přihlášení úspěšné',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Chyba při přihlášení:', error.message);
    console.error('Stack:', error.stack);
    
    // Specifické chyby databáze
    if (error.code === '42P01') {
      return res.status(500).json({ 
        error: 'Databázová tabulka neexistuje. Spusťte: npm run init-db' 
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(500).json({ 
        error: 'Nelze se připojit k databázi. Zkontrolujte, zda běží PostgreSQL.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Chyba serveru při přihlášení',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Změna hesla (první přihlášení nebo reset)
router.post('/change-password', async (req, res) => {
  const { newPassword } = req.body;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token není poskytnut' });
  }

  try {
    console.log('🔐 Změna hesla...');

    // Ověření tokenu
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validace nového hesla
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'Heslo musí mít alespoň 8 znaků' 
      });
    }

    // Hashování nového hesla
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Aktualizace hesla a odstranění force_password_change
    await pool.query(
      'UPDATE users SET password_hash = $1, force_password_change = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, decoded.id]
    );

    console.log('✅ Heslo změněno pro uživatele:', decoded.id);

    // Vytvoření nového plnohodnotného tokenu
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Získání aktuálních dat uživatele
    const userResult = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [decoded.id]
    );

    res.json({
      message: 'Heslo úspěšně změněno',
      token: newToken,
      user: userResult.rows[0]
    });
  } catch (error) {
    console.error('❌ Chyba při změně hesla:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Neplatný token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token vypršel. Přihlaste se znovu.' });
    }
    res.status(500).json({ error: 'Chyba serveru při změně hesla' });
  }
});

// Získání informací o aktuálním uživateli
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token není poskytnut' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Chyba při získávání uživatele:', error);
    res.status(401).json({ error: 'Neplatný token' });
  }
});

// Žádost o reset hesla
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    console.log('🔑 Žádost o reset hesla:', email);

    if (!email) {
      return res.status(400).json({ error: 'Email je povinný' });
    }

    // Najít uživatele
    const userResult = await pool.query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email]
    );

    // Z bezpečnostních důvodů vracíme stejnou zprávu i když uživatel neexistuje
    if (userResult.rows.length === 0) {
      console.log('⚠️  Uživatel nenalezen, ale vracíme success');
      return res.json({
        message: 'Pokud email existuje v systému, byl odeslán odkaz pro reset hesla.'
      });
    }

    const user = userResult.rows[0];

    // Generovat unikátní token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hodina

    // Uložit token do databáze
    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, expiresAt]
    );

    console.log('✅ Reset token vytvořen');

    // Odeslat email s reset odkazem
    const emailResult = await sendPasswordResetEmail(user, resetToken);
    
    if (emailResult.success) {
      console.log('✅ Reset email odeslán na:', user.email);
    } else {
      console.error('⚠️  Email se nepodařilo odeslat:', emailResult.error);
      
      // V případě chyby emailu v development režimu vrátit URL
      if (process.env.NODE_ENV === 'development') {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        return res.json({
          message: 'SMTP není nakonfigurováno - reset odkaz:',
          resetUrl,
          warning: 'Email nebyl odeslán. Nastavte SMTP v .env souboru.'
        });
      }
    }

    // Vždy vrátit stejnou zprávu z bezpečnostních důvodů
    res.json({
      message: 'Pokud email existuje v systému, byl odeslán odkaz pro reset hesla.'
    });
  } catch (error) {
    console.error('❌ Chyba při generování reset tokenu:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Reset hesla pomocí tokenu
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    console.log('🔐 Pokus o reset hesla s tokenem');

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token a nové heslo jsou povinné' });
    }

    // Validace hesla
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Heslo musí mít alespoň 8 znaků' });
    }

    // Najít platný token
    const tokenResult = await pool.query(
      `SELECT pr.*, u.id as user_id, u.email 
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.token = $1 AND pr.used = FALSE AND pr.expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      console.log('❌ Token neplatný nebo expirovaný');
      return res.status(400).json({ error: 'Neplatný nebo expirovaný token' });
    }

    const resetRecord = tokenResult.rows[0];

    // Hashovat nové heslo
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Aktualizovat heslo a zrušit force_password_change
    await pool.query(
      'UPDATE users SET password_hash = $1, force_password_change = FALSE, updated_at = NOW() WHERE id = $2',
      [hashedPassword, resetRecord.user_id]
    );

    // Označit token jako použitý
    await pool.query(
      'UPDATE password_resets SET used = TRUE WHERE id = $1',
      [resetRecord.id]
    );

    console.log('✅ Heslo úspěšně resetováno pro:', resetRecord.email);

    res.json({
      message: 'Heslo bylo úspěšně změněno. Nyní se můžete přihlásit.'
    });
  } catch (error) {
    console.error('❌ Chyba při resetu hesla:', error);
    res.status(500).json({ error: 'Chyba serveru při resetu hesla' });
  }
});

module.exports = router;
