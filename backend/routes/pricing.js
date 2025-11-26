const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Získat všechny služby z ceníku
router.get('/services', authMiddleware, async (req, res) => {
  try {
    const { category, price_type } = req.query;
    
    let query = 'SELECT * FROM service_pricing WHERE active = true';
    const params = [];
    let paramCount = 1;
    
    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }
    
    if (price_type) {
      query += ` AND price_type = $${paramCount}`;
      params.push(price_type);
      paramCount++;
    }
    
    query += ' ORDER BY category, base_price';
    
    const result = await pool.query(query, params);
    
    // Seskupit podle kategorií
    const servicesByCategory = result.rows.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {});
    
    res.json({ 
      services: result.rows,
      servicesByCategory 
    });
  } catch (error) {
    console.error('Chyba při získávání služeb:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Vytvořit nabídku pro klienta nebo leada
router.post('/quotes', authMiddleware, async (req, res) => {
  try {
    const { client_id, lead_data, quote_name, services, custom_adjustments, create_lead } = req.body;
    
    if (!services || !Array.isArray(services)) {
      return res.status(400).json({ error: 'Služby jsou povinné' });
    }

    let finalClientId = client_id;
    let leadId = null;
    
    // Pokud nemáme client_id, ale máme lead_data, vytvoříme nový lead v pipeline
    if (!client_id && lead_data && create_lead) {
      const { company_name, contact_person, email, phone, notes } = lead_data;
      
      if (!company_name) {
        return res.status(400).json({ error: 'Název firmy je povinný pro vytvoření leadu' });
      }
      
      // Vytvoříme lead v pipeline
      const leadResult = await pool.query(
        `INSERT INTO pipeline (company_name, contact_person, email, phone, stage, notes, assigned_to) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [company_name, contact_person, email, phone, 'lead', notes || 'Vytvořeno z nabídky', req.user.userId]
      );
      
      leadId = leadResult.rows[0].id;
    } else if (!client_id && !create_lead) {
      return res.status(400).json({ error: 'Vyberte klienta nebo vytvořte nový lead' });
    }
    
    // Vypočítat celkové ceny
    let monthly_total = 0;
    let one_time_total = 0;
    
    for (const service of services) {
      if (service.price_type === 'monthly') {
        monthly_total += parseFloat(service.price || service.base_price || 0);
      } else if (service.price_type === 'one_time') {
        one_time_total += parseFloat(service.price || service.base_price || 0);
      }
    }
    
    const result = await pool.query(`
      INSERT INTO client_quotes 
      (client_id, pipeline_id, quote_name, services, monthly_total, one_time_total, custom_adjustments, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      finalClientId || null,
      leadId,
      quote_name || 'Nabídka služeb',
      JSON.stringify(services),
      monthly_total,
      one_time_total,
      custom_adjustments,
      req.user.userId
    ]);
    
    // Aktualizovat monthly_recurring_amount u klienta pokud je to schváleno a máme klienta
    if (req.body.apply_to_client && finalClientId) {
      await pool.query(`
        UPDATE clients 
        SET monthly_recurring_amount = $1 
        WHERE id = $2
      `, [monthly_total, finalClientId]);
    }
    
    res.status(201).json({ 
      quote: result.rows[0],
      lead_created: leadId ? true : false,
      lead_id: leadId
    });
  } catch (error) {
    console.error('Chyba při vytváření nabídky:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat všechny nabídky
router.get('/quotes', authMiddleware, async (req, res) => {
  try {
    const { client_id, status } = req.query;
    
    let query = `
      SELECT q.*, c.name as client_name, u.name as created_by_name
      FROM client_quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (client_id) {
      query += ` AND q.client_id = $${paramCount}`;
      params.push(client_id);
      paramCount++;
    }
    
    if (status) {
      query += ` AND q.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    query += ' ORDER BY q.created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({ quotes: result.rows });
  } catch (error) {
    console.error('Chyba při získávání nabídek:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat detail nabídky
router.get('/quotes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT q.*, c.name as client_name, u.name as created_by_name
      FROM client_quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nabídka nenalezena' });
    }
    
    res.json({ quote: result.rows[0] });
  } catch (error) {
    console.error('Chyba při získávání nabídky:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Aktualizovat nabídku
router.put('/quotes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { quote_name, services, monthly_total, one_time_total, custom_adjustments, status } = req.body;
    
    const result = await pool.query(`
      UPDATE client_quotes 
      SET quote_name = COALESCE($1, quote_name),
          services = COALESCE($2, services),
          monthly_total = COALESCE($3, monthly_total),
          one_time_total = COALESCE($4, one_time_total),
          custom_adjustments = COALESCE($5, custom_adjustments),
          status = COALESCE($6, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [quote_name, services ? JSON.stringify(services) : null, monthly_total, one_time_total, custom_adjustments, status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nabídka nenalezena' });
    }
    
    res.json({ quote: result.rows[0] });
  } catch (error) {
    console.error('Chyba při aktualizaci nabídky:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Schválit nabídku a aplikovat na klienta
router.post('/quotes/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Získat nabídku
    const quoteResult = await pool.query(
      'SELECT * FROM client_quotes WHERE id = $1',
      [id]
    );
    
    if (quoteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Nabídka nenalezena' });
    }
    
    const quote = quoteResult.rows[0];
    
    // Aktualizovat status nabídky
    await pool.query(
      'UPDATE client_quotes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['approved', id]
    );
    
    // Aplikovat na klienta
    await pool.query(`
      UPDATE clients 
      SET monthly_recurring_amount = $1 
      WHERE id = $2
    `, [quote.monthly_total, quote.client_id]);
    
    res.json({ message: 'Nabídka schválena a aplikována na klienta' });
  } catch (error) {
    console.error('Chyba při schvalování nabídky:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Smazat nabídku
router.delete('/quotes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM client_quotes WHERE id = $1', [id]);
    
    res.json({ message: 'Nabídka smazána' });
  } catch (error) {
    console.error('Chyba při mazání nabídky:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Generovat PDF nabídku
router.get('/quotes/:id/pdf', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Získat nabídku s detaily
    const result = await pool.query(`
      SELECT 
        q.*, 
        c.name as client_name, 
        c.email as client_email,
        c.phone as client_phone,
        p.company_name as lead_company_name,
        p.contact_person as lead_contact_person,
        p.email as lead_email,
        p.phone as lead_phone,
        u.name as created_by_name
      FROM client_quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      LEFT JOIN pipeline p ON q.pipeline_id = p.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nabídka nenalezena' });
    }
    
    const quote = result.rows[0];
    const services = typeof quote.services === 'string' ? JSON.parse(quote.services) : quote.services;
    
    // Vytvořit PDF dokument
    const doc = new PDFDocument({ 
      size: 'A4', 
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: quote.quote_name,
        Author: 'Nevymyslíš'
      }
    });
    
    // Nastavit response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="nabidka-${id}.pdf"`);
    
    // Stream PDF do response
    doc.pipe(res);
    
    // === HEADER S LOGEM A BRANDING ===
    // Gradient header background
    doc.rect(0, 0, 595, 150).fill('#A794E8');
    
    // Logo text (můžete nahradit obrázkem loga)
    doc.fontSize(32)
       .fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .text('Nevymyslíš', 50, 40);
    
    doc.fontSize(12)
       .fillColor('#FFFFFF')
       .font('Helvetica')
       .text('Lepší marketing', 50, 80);
    
    // Kontaktní info v pravém rohu
    doc.fontSize(10)
       .text('info@nevymyslis.cz', 400, 50, { align: 'right', width: 145 })
       .text('+420 735 823 160', 400, 65, { align: 'right', width: 145 });
    
    // === NADPIS NABÍDKY ===
    doc.fillColor('#333333')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text(quote.quote_name || 'Nabídka služeb', 50, 180);
    
    // Datum vytvoření
    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text(`Vytvořeno: ${new Date(quote.created_at).toLocaleDateString('cs-CZ')}`, 50, 215);
    
    // === INFO O KLIENTOVI/LEADOVI ===
    let yPos = 250;
    doc.fontSize(14)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text('Pro:', 50, yPos);
    
    yPos += 25;
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#333333');
    
    const recipientName = quote.client_name || quote.lead_company_name || 'N/A';
    const recipientContact = quote.lead_contact_person || '';
    const recipientEmail = quote.client_email || quote.lead_email || '';
    const recipientPhone = quote.client_phone || quote.lead_phone || '';
    
    doc.text(recipientName, 50, yPos);
    if (recipientContact) {
      yPos += 18;
      doc.text(recipientContact, 50, yPos);
    }
    if (recipientEmail) {
      yPos += 18;
      doc.text(recipientEmail, 50, yPos);
    }
    if (recipientPhone) {
      yPos += 18;
      doc.text(recipientPhone, 50, yPos);
    }
    
    // === TABULKA SLUŽEB ===
    yPos += 40;
    
    // Tabulka header
    doc.rect(50, yPos, 495, 30).fill('#FFD6BA');
    
    doc.fontSize(11)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text('Služba', 60, yPos + 10)
       .text('Typ', 350, yPos + 10)
       .text('Cena', 450, yPos + 10);
    
    yPos += 30;
    
    // Služby
    doc.font('Helvetica').fontSize(10);
    
    services.forEach((service, index) => {
      // Kontrola, zda máme dost místa, jinak nová stránka
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }
      
      // Alternující barvy řádků
      if (index % 2 === 0) {
        doc.rect(50, yPos, 495, 25).fill('#F9F9F9');
      }
      
      doc.fillColor('#333333')
         .text(service.service_name, 60, yPos + 8, { width: 280 })
         .text(service.price_type === 'monthly' ? 'Měsíční' : 'Jednorázová', 350, yPos + 8)
         .text(`${service.price.toLocaleString()} Kč`, 450, yPos + 8);
      
      yPos += 25;
    });
    
    // Oddělovač
    yPos += 10;
    doc.moveTo(50, yPos).lineTo(545, yPos).stroke('#CCCCCC');
    yPos += 20;
    
    // === CELKOVÁ CENA ===
    if (quote.monthly_total > 0) {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#A794E8')
         .text('Měsíční náklady celkem:', 320, yPos)
         .text(`${quote.monthly_total.toLocaleString()} Kč`, 450, yPos);
      yPos += 25;
    }
    
    if (quote.one_time_total > 0) {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#FFBD98')
         .text('Jednorázové náklady:', 320, yPos)
         .text(`${quote.one_time_total.toLocaleString()} Kč`, 450, yPos);
      yPos += 25;
    }
    
    // Celková investice
    const totalInvestment = quote.monthly_total + quote.one_time_total;
    yPos += 10;
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text('Celková počáteční investice:', 320, yPos)
       .text(`${totalInvestment.toLocaleString()} Kč`, 450, yPos);
    
    // === POZNÁMKY / ÚPRAVY ===
    if (quote.custom_adjustments) {
      yPos += 40;
      
      if (yPos > 650) {
        doc.addPage();
        yPos = 50;
      }
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text('Poznámky:', 50, yPos);
      
      yPos += 20;
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666666')
         .text(quote.custom_adjustments, 50, yPos, { width: 495 });
    }
    
    // === FOOTER ===
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      // Footer čára
      doc.moveTo(50, 780).lineTo(545, 780).stroke('#CCCCCC');
      
      // Footer text
      doc.fontSize(9)
         .fillColor('#999999')
         .text(
           'Nevymyslíš | Hornická 914, Havířov 736 01 | IČO: 12345678 | info@nevymyslis.cz | +420 735 823 160',
           50,
           790,
           { align: 'center', width: 495 }
         );
      
      // Číslo stránky
      doc.text(
         `Strana ${i + 1} z ${pageCount}`,
         50,
         805,
         { align: 'center', width: 495 }
       );
    }
    
    // Dokončit PDF
    doc.end();
    
  } catch (error) {
    console.error('Chyba při generování PDF:', error);
    res.status(500).json({ error: 'Chyba při generování PDF' });
  }
});

module.exports = router;
