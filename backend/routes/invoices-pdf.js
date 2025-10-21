const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

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

    // Získat fakturační údaje dodavatele (uživatele který vytvořil fakturu)
    const settingsResult = await pool.query(
      'SELECT * FROM company_settings WHERE user_id = $1',
      [invoice.created_by || req.user.id]
    );

    const companySettings = settingsResult.rows[0] || {
      company_name: 'Nevymyslíš s.r.o.',
      ico: 'Neuvedeno',
      dic: 'Neuvedeno',
      address: 'Neuvedeno',
      bank_account: 'Neuvedeno',
      email: 'fakturace@nevymyslis.cz',
      phone: 'Neuvedeno'
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
            <div style="text-align: right;">
                <span class="status-badge ${invoice.paid ? 'status-paid' : 'status-unpaid'}">
                    ${invoice.paid ? 'ZAPLACENO' : 'NEZAPLACENO'}
                </span>
            </div>
        </div>

        <div class="parties">
            <div class="party">
                <h3>Dodavatel</h3>
                <p><strong>${companySettings.company_name}</strong></p>
                <p>${companySettings.address || ''}</p>
                <p>IČO: ${companySettings.ico || ''}</p>
                <p>DIČ: ${companySettings.dic || ''}</p>
                <p>Email: ${companySettings.email || ''}</p>
                <p>Tel: ${companySettings.phone || ''}</p>
            </div>
            <div class="party">
                <h3>Odběratel</h3>
                <p><strong>${invoice.billing_company_name || invoice.client_name}</strong></p>
                <p>${invoice.client_address || ''}</p>
                <p>IČO: ${invoice.client_ico || ''}</p>
                <p>DIČ: ${invoice.client_dic || ''}</p>
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

module.exports = router;
