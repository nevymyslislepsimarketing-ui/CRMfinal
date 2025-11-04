const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');
const QRCode = require('qrcode');

const router = express.Router();

// Všechny routes jsou chráněny autentizací
router.use(authenticateToken);

// Získat přehled pravidelných faktur (klienti s monthly_recurring)
router.get('/recurring', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.monthly_recurring_amount,
        c.invoice_day,
        c.invoice_due_days,
        c.manager_id,
        u.name as manager_name,
        COUNT(i.id) as total_invoices,
        SUM(CASE WHEN i.paid = true THEN 1 ELSE 0 END) as paid_invoices
      FROM clients c
      LEFT JOIN invoices i ON c.id = i.client_id
      LEFT JOIN users u ON c.manager_id = u.id
      WHERE c.monthly_recurring_amount > 0
      GROUP BY c.id, c.name, c.email, c.monthly_recurring_amount, c.invoice_day, c.invoice_due_days, c.manager_id, u.name
      ORDER BY c.monthly_recurring_amount DESC
    `);
    res.json({ recurring: result.rows });
  } catch (error) {
    console.error('Chyba při získávání pravidelných faktur:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat všechny faktury s informacemi o klientovi
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.*,
        c.name as client_name
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      ORDER BY i.created_at DESC
    `);
    res.json({ invoices: result.rows });
  } catch (error) {
    console.error('Chyba při získávání faktur:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat jednu fakturu podle ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        i.*,
        c.name as client_name
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Faktura nenalezena' });
    }

    res.json({ invoice: result.rows[0] });
  } catch (error) {
    console.error('Chyba při získávání faktury:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Vytvořit novou fakturu
router.post('/', async (req, res) => {
  const { client_id, amount, description, issued_at, due_date, paid = false, manager_id } = req.body;

  try {
    if (!client_id || !amount || !description || !issued_at || !due_date) {
      return res.status(400).json({ error: 'Všechna povinná pole musí být vyplněna (včetně popisu služeb)' });
    }

    // Generovat číslo faktury ve formátu RRRRMMXXXXX
    const issuedDate = new Date(issued_at);
    const year = issuedDate.getFullYear();
    const month = String(issuedDate.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}${month}`;
    
    // Najít poslední fakturu s tímto prefixem
    const lastInvoice = await pool.query(
      `SELECT invoice_number FROM invoices 
       WHERE invoice_number LIKE $1 
       ORDER BY invoice_number DESC LIMIT 1`,
      [`${prefix}%`]
    );
    
    let sequenceNumber = 1;
    if (lastInvoice.rows.length > 0) {
      const lastNumber = lastInvoice.rows[0].invoice_number;
      const lastSequence = parseInt(lastNumber.substring(6));
      sequenceNumber = lastSequence + 1;
    }
    
    const invoice_number = `${prefix}${String(sequenceNumber).padStart(5, '0')}`;

    const result = await pool.query(
      'INSERT INTO invoices (invoice_number, client_id, amount, description, issued_at, due_date, paid, created_by, manager_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [invoice_number, client_id, amount, description, issued_at, due_date, paid, req.user.id, manager_id || null]
    );

    res.status(201).json({
      message: 'Faktura úspěšně vytvořena',
      invoice: result.rows[0]
    });
  } catch (error) {
    console.error('Chyba při vytváření faktury:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Faktura s tímto číslem již existuje' });
    }
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Aktualizovat fakturu
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { client_id, amount, description, due_date, paid, manager_id } = req.body;

  try {
    if (!description) {
      return res.status(400).json({ error: 'Popis služeb je povinný' });
    }

    // Číslo faktury a datum vystavení se nemění po vytvoření
    const result = await pool.query(
      'UPDATE invoices SET client_id = $1, amount = $2, description = $3, due_date = $4, paid = $5, manager_id = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [client_id, amount, description, due_date, paid, manager_id || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Faktura nenalezena' });
    }

    res.json({
      message: 'Faktura úspěšně aktualizována',
      invoice: result.rows[0]
    });
  } catch (error) {
    console.error('Chyba při aktualizaci faktury:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Označit fakturu jako zaplacenou
router.patch('/:id/pay', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'UPDATE invoices SET paid = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Faktura nenalezena' });
    }

    res.json({
      message: 'Faktura označena jako zaplacená',
      invoice: result.rows[0]
    });
  } catch (error) {
    console.error('Chyba při označování faktury:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Smazat fakturu
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM invoices WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Faktura nenalezena' });
    }

    res.json({ message: 'Faktura úspěšně smazána' });
  } catch (error) {
    console.error('Chyba při mazání faktury:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat fakturu jako HTML pro tisk do PDF
router.get('/:id/html', async (req, res) => {
  const { id } = req.params;

  try {
    // Získat fakturu s daty klienta
    const invoiceResult = await pool.query(`
      SELECT 
        i.*,
        c.name as client_name,
        c.billing_company_name,
        c.ico as client_ico,
        c.dic as client_dic,
        c.billing_address as client_address,
        c.manager_id as client_manager_id,
        u.name as created_by_name
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE i.id = $1
    `, [id]);

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Faktura nenalezena' });
    }

    const invoice = invoiceResult.rows[0];

    // Získat fakturační údaje dodavatele
    // Priorita: 1. manager_id z invoices, 2. manager_id z clients, 3. created_by, 4. aktuální user
    const managerId = invoice.manager_id || invoice.client_manager_id || invoice.created_by || req.user.id;
    
    console.log('🔍 DEBUG - Generování PDF faktury:');
    console.log('  Invoice ID:', invoice.id);
    console.log('  Invoice manager_id:', invoice.manager_id);
    console.log('  Client manager_id:', invoice.client_manager_id);
    console.log('  Created by:', invoice.created_by);
    console.log('  Selected manager_id:', managerId);
    
    const settingsResult = await pool.query(
      'SELECT id, name, billing_name, billing_ico, billing_dic, billing_address, billing_email, billing_phone, billing_bank_account FROM users WHERE id = $1',
      [managerId]
    );

    const managerBilling = settingsResult.rows[0];
    
    console.log('  Manager billing data:', {
      user_id: managerBilling?.id,
      user_name: managerBilling?.name,
      billing_name: managerBilling?.billing_name,
      has_ico: !!managerBilling?.billing_ico,
      has_account: !!managerBilling?.billing_bank_account
    });
    
    const companySettings = {
      company_name: managerBilling?.billing_name || 'Nevymyslíš s.r.o.',
      ico: managerBilling?.billing_ico || 'Neuvedeno',
      dic: managerBilling?.billing_dic && managerBilling.billing_dic.trim() !== '' ? managerBilling.billing_dic : null,
      address: managerBilling?.billing_address || 'Neuvedeno',
      bank_account: managerBilling?.billing_bank_account || 'Neuvedeno',
      email: managerBilling?.billing_email || 'fakturace@nevymyslis.cz',
      phone: managerBilling?.billing_phone || 'Neuvedeno'
    };

    // Formátování dat
    const formatDate = (date) => {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('cs-CZ');
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: 'CZK',
      }).format(amount);
    };

    // Helper funkce pro získání názvu banky podle kódu
    const getBankName = (code) => {
      const banks = {
        '0100': 'Komerční banka',
        '0300': 'ČSOB',
        '0600': 'MONETA Money Bank',
        '0710': 'Česká národní banka',
        '0800': 'Česká spořitelna',
        '2010': 'Fio banka',
        '2020': 'MUFG Bank',
        '2060': 'Citfin',
        '2070': 'Moravský Peněžní Ústav',
        '2100': 'Hypoteční banka',
        '2220': 'Peněžní dům',
        '2240': 'Poštovní spořitelna',
        '2250': 'Banka CREDITAS',
        '2260': 'NEY spořitelní družstvo',
        '2275': 'Podnikatelská družstevní záložna',
        '2600': 'Citibank',
        '2700': 'UniCredit Bank',
        '3030': 'Air Bank',
        '3050': 'BNP Paribas',
        '3060': 'PKO BP',
        '3500': 'ING Bank',
        '4000': 'Expobank',
        '4300': 'Českomoravská záruční a rozvojová banka',
        '5500': 'Raiffeisenbank',
        '5800': 'J&T Banka',
        '6000': 'PPF banka',
        '6100': 'Equa bank',
        '6200': 'COMMERZBANK',
        '6210': 'mBank',
        '6300': 'BNP Paribas Personal Finance',
        '6363': 'Partners Banka',
        '6700': 'Všeobecná úverová banka',
        '6800': 'Sberbank',
        '7910': 'Deutsche Bank',
        '7950': 'Raiffeisen stavební spořitelna',
        '7960': 'ČMSS',
        '7970': 'Wüstenrot stavební spořitelna',
        '7980': 'Wüstenrot hypoteční banka',
        '7990': 'Modrá pyramida stavební spořitelna',
        '8030': 'Volksbank',
        '8040': 'Oberbank',
        '8060': 'Stavební spořitelna České spořitelny',
        '8090': 'Česká exportní banka',
        '8150': 'HSBC Bank',
        '8200': 'PRIVAT BANK der Raiffeisenlandesbank',
        '8220': 'Payment Execution',
        '8230': 'Eepay',
        '8240': 'Družstevní záložna Kredit'
      };
      return banks[code] || 'Neznámá banka';
    };

    // Generovat QR kód pro platbu (SPAYD formát pro české platby)
    const generatePaymentQR = async () => {
      try {
        const bankAccount = companySettings.bank_account || '';
        
        // Pokud není číslo účtu, vrátit null
        if (!bankAccount || bankAccount === 'Neuvedeno') {
          console.log('⚠️  Číslo účtu není nastaveno, QR kód nebude vygenerován');
          return null;
        }
        
        // Parsovat číslo účtu ve formátu: [předčíslí-]číslo/kódbanky
        const accountMatch = bankAccount.match(/^(?:(\d+)-)?(\d+)\/(\d{4})$/);
        
        if (!accountMatch) {
          console.error('❌ Nevalidní formát čísla účtu:', bankAccount);
          console.log('   Očekávaný formát: 123456789/0100 nebo 123456-987654321/0100');
          return null;
        }
        
        const [, prefix = '', accountNumber, bankCode] = accountMatch;
        
        // Převést na IBAN s kontrolním součtem (pro SPAYD je IBAN preferovaný)
        // Formát: CZ + kontrolní součet (2 číslice) + kód banky (4) + předčíslí (6) + číslo účtu (10)
        const paddedPrefix = (prefix || '0').padStart(6, '0');
        const paddedAccount = accountNumber.padStart(10, '0');
        
        // Sestavit BBAN (Basic Bank Account Number)
        const bban = `${bankCode}${paddedPrefix}${paddedAccount}`;
        
        // Vypočítat kontrolní součet pro IBAN
        // 1. CZ na konec: bban + 'CZ00'
        // 2. Převést písmena na čísla (C=12, Z=35)
        // 3. Mod 97
        // 4. 98 - výsledek
        const tempIban = bban + '1235' + '00'; // CZ = 12,35
        let remainder = 0;
        for (let i = 0; i < tempIban.length; i++) {
          remainder = (remainder * 10 + parseInt(tempIban[i])) % 97;
        }
        const checksum = (98 - remainder).toString().padStart(2, '0');
        const iban = `CZ${checksum}${bban}`;
        
        console.log('🔍 QR kód - Převod čísla účtu:');
        console.log('   Vstup:', bankAccount);
        console.log('   Kód banky:', bankCode, '(', getBankName(bankCode), ')');
        console.log('   IBAN:', iban);
        
        const amount = parseFloat(invoice.amount).toFixed(2);
        
        // SPAYD formát s IBAN (podle oficiální specifikace)
        const spayd = `SPD*1.0*ACC:${iban}*AM:${amount}*CC:CZK*MSG:Faktura ${invoice.invoice_number}`;
        
        console.log('   SPAYD:', spayd);
        
        // Generovat QR kód jako base64
        const qrCodeDataURL = await QRCode.toDataURL(spayd, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        return qrCodeDataURL;
      } catch (error) {
        console.error('❌ Chyba při generování QR kódu:', error);
        return null;
      }
    };

    const qrCodeDataURL = await generatePaymentQR();

    // HTML šablona faktury
    const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Faktura ${invoice.invoice_number}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
            line-height: 1.6;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            border-bottom: 3px solid #C8B6FF;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #7C3AED;
            font-size: 32px;
        }
        .invoice-number {
            font-size: 18px;
            color: #666;
        }
        .parties {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        .party {
            width: 48%;
        }
        .party h3 {
            color: #7C3AED;
            margin-bottom: 10px;
            font-size: 16px;
            text-transform: uppercase;
        }
        .party p {
            margin-bottom: 5px;
            font-size: 14px;
        }
        .details {
            margin-bottom: 40px;
        }
        .details table {
            width: 100%;
            border-collapse: collapse;
        }
        .details th, .details td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .details th {
            background: #F3F4F6;
            font-weight: 600;
        }
        .items {
            margin-bottom: 40px;
        }
        .items table {
            width: 100%;
            border-collapse: collapse;
        }
        .items th, .items td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .items th {
            background: #7C3AED;
            color: white;
            font-weight: 600;
        }
        .total {
            text-align: right;
            margin-top: 20px;
        }
        .total-row {
            font-size: 24px;
            font-weight: bold;
            color: #7C3AED;
            margin-top: 10px;
        }
        .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
        }
        .status-paid {
            background: #D1FAE5;
            color: #065F46;
        }
        .status-unpaid {
            background: #FEE2E2;
            color: #991B1B;
        }
        @media print {
            body { padding: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div>
                <h1>FAKTURA</h1>
                <p class="invoice-number">Číslo: ${invoice.invoice_number}</p>
            </div>
        </div>

        <div class="parties">
            <div class="party">
                <h3>Dodavatel</h3>
                <p><strong>${companySettings.company_name}</strong></p>
                <p>${companySettings.address || ''}</p>
                <p>IČO: ${companySettings.ico || ''}</p>
                <p>DIČ: ${companySettings.dic && companySettings.dic.trim() !== '' && companySettings.dic !== 'Neuvedeno' ? companySettings.dic : 'Není plátce DPH'}</p>
                <p>Email: ${companySettings.email || ''}</p>
                <p>Tel: ${companySettings.phone || ''}</p>
            </div>
            <div class="party">
                <h3>Odběratel</h3>
                <p><strong>${invoice.billing_company_name || invoice.client_name}</strong></p>
                <p>${invoice.client_address || ''}</p>
                <p>IČO: ${invoice.client_ico || ''}</p>
                <p>DIČ: ${invoice.client_dic && invoice.client_dic.trim() !== '' && invoice.client_dic !== 'Neuvedeno' ? invoice.client_dic : 'Není plátce DPH'}</p>
            </div>
        </div>

        <div class="details">
            <table>
                <tr>
                    <th>Datum vystavení</th>
                    <td>${formatDate(invoice.issued_at)}</td>
                    <th>Datum splatnosti</th>
                    <td>${formatDate(invoice.due_date)}</td>
                </tr>
                <tr>
                    <th>Číslo účtu</th>
                    <td colspan="3">${companySettings.bank_account || 'Neuvedeno'}</td>
                </tr>
            </table>
        </div>

        <div class="items">
            <table>
                <thead>
                    <tr>
                        <th>Popis</th>
                        <th style="text-align: right;">Částka</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${invoice.description || 'Služby dle smlouvy'}</td>
                        <td style="text-align: right;">${formatCurrency(invoice.amount)}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="total">
                <div class="total-row">
                    Celkem k úhradě: ${formatCurrency(invoice.amount)}
                </div>
            </div>
        </div>

        ${invoice.paid && invoice.payment_date ? `
        <div style="background: #D1FAE5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #065F46; font-weight: 600;">
                ✓ Faktura byla uhrazena dne ${formatDate(invoice.payment_date)}
            </p>
        </div>
        ` : qrCodeDataURL ? `
        <div style="border: 2px solid #7C3AED; border-radius: 12px; padding: 20px; margin-bottom: 30px; background: #F9FAFB;">
            <h3 style="color: #7C3AED; margin-bottom: 15px; font-size: 18px;">💳 QR Platba</h3>
            <div style="display: flex; align-items: center; gap: 30px;">
                <div style="flex-shrink: 0;">
                    <img src="${qrCodeDataURL}" alt="QR kód pro platbu" style="width: 180px; height: 180px; border: 3px solid #7C3AED; border-radius: 8px; padding: 5px; background: white;" />
                </div>
                <div style="flex-grow: 1;">
                    <p style="margin-bottom: 10px; font-size: 14px; color: #666;">
                        <strong>Naskenujte QR kód</strong> bankovní aplikací pro okamžitou platbu
                    </p>
                    <div style="background: white; padding: 12px; border-radius: 6px; font-size: 13px; color: #333;">
                        <div style="margin-bottom: 5px;">
                            <strong>Číslo účtu:</strong> ${companySettings.bank_account || 'Neuvedeno'}
                        </div>
                        <div>
                            <strong>Částka:</strong> ${formatCurrency(invoice.amount)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ` : ''}

        <div class="footer">
            <p>Vygenerováno systémem Nevymyslíš CRM | ${new Date().toLocaleDateString('cs-CZ')}</p>
        </div>
    </div>

    <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 12px 24px; background: #7C3AED; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
            Stáhnout jako PDF
        </button>
        <button onclick="window.close()" style="padding: 12px 24px; background: #6B7280; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-left: 10px;">
            Zavřít
        </button>
    </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);

  } catch (error) {
    console.error('Chyba při generování HTML faktury:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat přehled zisků pro manažera
router.get('/profit-overview/:managerId', async (req, res) => {
  try {
    const { managerId } = req.params;
    
    // Získat všechny faktury pro klienty tohoto manažera
    const invoicesQuery = `
      SELECT 
        i.id,
        i.amount,
        i.paid,
        i.issued_at,
        DATE_TRUNC('month', i.issued_at) as month
      FROM invoices i
      INNER JOIN clients c ON i.client_id = c.id
      WHERE c.manager_id = $1
      ORDER BY i.issued_at DESC
    `;
    
    const result = await pool.query(invoicesQuery, [managerId]);
    const invoices = result.rows;
    
    // Seskupit data po měsících
    const monthlyMap = {};
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Inicializovat posledních 12 měsíců
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      const monthName = date.toLocaleDateString('cs-CZ', { year: 'numeric', month: 'long' });
      
      monthlyMap[monthKey] = {
        month: monthName,
        paid: 0,
        unpaid: 0
      };
    }
    
    // Seskupit faktury
    invoices.forEach(invoice => {
      const monthKey = new Date(invoice.issued_at).toISOString().slice(0, 7);
      
      if (monthlyMap[monthKey]) {
        const amount = parseFloat(invoice.amount);
        if (invoice.paid) {
          monthlyMap[monthKey].paid += amount;
        } else {
          monthlyMap[monthKey].unpaid += amount;
        }
      }
    });
    
    // Převést na pole
    const monthlyData = Object.values(monthlyMap);
    
    // Vypočítat souhrn
    const summary = {
      paid: invoices.filter(i => i.paid).reduce((sum, i) => sum + parseFloat(i.amount), 0),
      unpaid: invoices.filter(i => !i.paid).reduce((sum, i) => sum + parseFloat(i.amount), 0),
      total: invoices.reduce((sum, i) => sum + parseFloat(i.amount), 0)
    };
    
    res.json({
      monthlyData,
      summary
    });
    
  } catch (error) {
    console.error('Chyba při získávání přehledu zisků:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

module.exports = router;
