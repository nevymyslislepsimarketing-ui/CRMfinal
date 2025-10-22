const sgMail = require('@sendgrid/mail');

// Inicializace SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid API inicializováno');
} else {
  console.warn('⚠️  SENDGRID_API_KEY není nastaveno!');
  console.warn('⚠️  Emaily nebudou odesílány.');
}

// Odeslat email pro reset hesla
const sendPasswordResetEmail = async (user, resetToken) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('⚠️  Email nebude odeslán (SendGrid API key není nastaven)');
    return { success: false, error: 'SendGrid API key není nastaven' };
  }

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  const msg = {
    from: {
      email: process.env.SMTP_USER || 'info@nevymyslis.cz',
      name: process.env.EMAIL_FROM_NAME || 'Nevymyslíš CRM'
    },
    to: user.email,
    subject: 'Reset hesla - Nevymyslíš CRM',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background: #5568d3;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
            margin-top: 20px;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
          .info {
            background: #e7f3ff;
            border: 1px solid #2196f3;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #0c5460;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">🔐 Reset hesla</h1>
        </div>
        
        <div class="content">
          <p>Ahoj <strong>${user.name}</strong>,</p>
          
          <p>Obdrželi jsme žádost o reset vašeho hesla pro přístup do <strong>Nevymyslíš CRM</strong>.</p>
          
          <p>Pro vytvoření nového hesla klikněte na tlačítko níže:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Resetovat heslo</a>
          </div>
          
          <div class="info">
            <strong>ℹ️ Důležité informace:</strong>
            <ul style="margin: 10px 0;">
              <li>Odkaz je platný <strong>1 hodinu</strong></li>
              <li>Odkaz lze použít pouze <strong>jednou</strong></li>
              <li>Po použití bude automaticky zneplatněn</li>
            </ul>
          </div>
          
          <div class="warning">
            <strong>⚠️ Bezpečnostní upozornění:</strong><br>
            Pokud jste o reset hesla <strong>nežádali</strong>, ignorujte tento email. 
            Vaše heslo zůstane beze změny a vaš účet je v bezpečí.
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Pokud tlačítko nefunguje, zkopírujte a vložte tento odkaz do prohlížeče:<br>
            <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        
        <div class="footer">
          <p>
            <strong>Nevymyslíš CRM</strong><br>
            © ${new Date().getFullYear()} Všechna práva vyhrazena<br>
            <a href="mailto:info@nevymyslis.cz" style="color: #667eea;">info@nevymyslis.cz</a>
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
      Reset hesla - Nevymyslíš CRM
      
      Ahoj ${user.name},
      
      Obdrželi jsme žádost o reset vašeho hesla pro přístup do Nevymyslíš CRM.
      
      Pro vytvoření nového hesla otevřete následující odkaz:
      ${resetUrl}
      
      Důležité informace:
      - Odkaz je platný 1 hodinu
      - Odkaz lze použít pouze jednou
      - Po použití bude automaticky zneplatněn
      
      Bezpečnostní upozornění:
      Pokud jste o reset hesla nežádali, ignorujte tento email. 
      Vaše heslo zůstane beze změny a váš účet je v bezpečí.
      
      S pozdravem,
      Tým Nevymyslíš
      
      © ${new Date().getFullYear()} Nevymyslíš CRM
      info@nevymyslis.cz
    `
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Reset email odeslán přes SendGrid na:', user.email);
    return { success: true };
  } catch (error) {
    console.error('❌ SendGrid error:', error.message);
    if (error.response) {
      console.error('❌ SendGrid response:', JSON.stringify(error.response.body));
    }
    return { success: false, error: error.message };
  }
};

// Odeslat uvítací email novému uživateli
const sendWelcomeEmail = async (user, temporaryPassword) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('⚠️  Email nebude odeslán (SendGrid API key není nastaven)');
    return { success: false, error: 'SendGrid API key není nastaven' };
  }

  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
  
  const msg = {
    from: {
      email: process.env.SMTP_USER || 'info@nevymyslis.cz',
      name: process.env.EMAIL_FROM_NAME || 'Nevymyslíš CRM'
    },
    to: user.email,
    subject: 'Vítejte v Nevymyslíš CRM',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
          }
          .credentials {
            background: #f8f9fa;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">👋 Vítejte v Nevymyslíš CRM</h1>
        </div>
        
        <div class="content">
          <p>Ahoj <strong>${user.name}</strong>,</p>
          
          <p>Byl vám vytvořen účet v systému <strong>Nevymyslíš CRM</strong>.</p>
          
          <div class="credentials">
            <h3 style="margin-top: 0; color: #667eea;">🔑 Vaše přihlašovací údaje:</h3>
            <p style="margin: 5px 0;">
              <strong>Email:</strong> ${user.email}<br>
              <strong>Dočasné heslo:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${temporaryPassword}</code>
            </p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Důležité - První přihlášení:</strong><br>
            Při prvním přihlášení budete <strong>vyzváni ke změně hesla</strong>. 
            Z bezpečnostních důvodů je toto povinné.
          </div>
          
          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Přihlásit se do CRM</a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <strong>Tipy pro bezpečné heslo:</strong>
          </p>
          <ul style="color: #666; font-size: 14px;">
            <li>Minimálně 8 znaků</li>
            <li>Kombinace velkých a malých písmen</li>
            <li>Přidejte čísla a speciální znaky</li>
            <li>Nepoužívejte osobní informace</li>
          </ul>
          
          <p>Pokud máte jakékoliv otázky, neváhejte nás kontaktovat.</p>
          
          <p>S pozdravem,<br>
          <strong>Tým Nevymyslíš</strong></p>
        </div>
        
        <div class="footer">
          <p>
            <strong>Nevymyslíš CRM</strong><br>
            © ${new Date().getFullYear()} Všechna práva vyhrazena<br>
            <a href="mailto:info@nevymyslis.cz" style="color: #667eea;">info@nevymyslis.cz</a>
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
      Vítejte v Nevymyslíš CRM
      
      Ahoj ${user.name},
      
      Byl vám vytvořen účet v systému Nevymyslíš CRM.
      
      Vaše přihlašovací údaje:
      Email: ${user.email}
      Dočasné heslo: ${temporaryPassword}
      
      DŮLEŽITÉ - První přihlášení:
      Při prvním přihlášení budete vyzváni ke změně hesla. 
      Z bezpečnostních důvodů je toto povinné.
      
      Přihlaste se zde: ${loginUrl}
      
      Tipy pro bezpečné heslo:
      - Minimálně 8 znaků
      - Kombinace velkých a malých písmen
      - Přidejte čísla a speciální znaky
      - Nepoužívejte osobní informace
      
      Pokud máte jakékoliv otázky, neváhejte nás kontaktovat.
      
      S pozdravem,
      Tým Nevymyslíš
      
      © ${new Date().getFullYear()} Nevymyslíš CRM
      info@nevymyslis.cz
    `
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Uvítací email odeslán přes SendGrid na:', user.email);
    return { success: true };
  } catch (error) {
    console.error('❌ SendGrid error:', error.message);
    if (error.response) {
      console.error('❌ SendGrid response:', JSON.stringify(error.response.body));
    }
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail
};
