const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Cohere Chat API (nová verze)
const generateCaption = async (prompt, clientHistory = '') => {
  if (!process.env.COHERE_API_KEY) {
    throw new Error('COHERE_API_KEY není nastaven v .env');
  }

  // Vytvořit zprávy pro Chat API
  const messages = [];
  
  // Přidat historii jako systémovou zprávu pokud existuje
  if (clientHistory) {
    messages.push({
      role: 'SYSTEM',
      message: `Kontext předchozích příspěvků klienta:\n${clientHistory}`
    });
  }
  
  // Přidat hlavní prompt
  messages.push({
    role: 'USER',
    message: prompt
  });

  try {
    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-r7b-12-2024',
        message: prompt,
        chat_history: clientHistory ? [
          { role: 'SYSTEM', message: `Kontext: ${clientHistory}` }
        ] : [],
        temperature: 0.8,
        max_tokens: 300,
        preamble: 'Jsi expert na tvorbu poutavého obsahu pro sociální sítě. Píšeš v češtině, používáš emojis a vytváříš texty, které zaujmou a přesvědčí.'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cohere API chyba: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.text.trim();
  } catch (error) {
    console.error('Chyba při volání Cohere API:', error);
    throw error;
  }
};

// Generovat popisek pro sociální sítě
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { client_id, post_type, topic, platform, tone } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Téma příspěvku je povinné' });
    }

    // Získat historii AI generování pro tohoto klienta (pro učení)
    let clientHistory = '';
    if (client_id) {
      const historyResult = await pool.query(`
        SELECT prompt, generated_text 
        FROM ai_post_history 
        WHERE client_id = $1 
        ORDER BY created_at DESC 
        LIMIT 5
      `, [client_id]);

      if (historyResult.rows.length > 0) {
        clientHistory = historyResult.rows
          .map(h => `Téma: ${h.prompt}\nText: ${h.generated_text}`)
          .join('\n\n');
      }
    }

    // Vytvořit prompt pro Cohere
    const platformText = platform ? ` pro ${platform}` : '';
    const toneText = tone ? ` v ${tone} tónu` : '';
    const postTypeText = post_type ? ` (${post_type})` : '';

    const prompt = `Napiš poutavý a profesionální text${platformText}${toneText}${postTypeText} na téma: "${topic}".

Požadavky:
- Text by měl být zajímavý a přitahující pozornost
- Používej emojis kde to dává smysl
- Maximálně 2-3 krátké odstavce
- Call-to-action na konci
- Profesionální ale přátelský tón

Text:`;

    // Generovat s Cohere
    const generatedText = await generateCaption(prompt, clientHistory);

    // Uložit do historie
    if (client_id) {
      await pool.query(`
        INSERT INTO ai_post_history 
        (client_id, platform, post_type, prompt, generated_text, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        client_id,
        platform || 'general',
        post_type || 'post',
        topic,
        generatedText,
        req.user.userId
      ]);
    }

    res.json({
      success: true,
      text: generatedText,
      metadata: {
        platform,
        post_type,
        topic,
        tone
      }
    });

  } catch (error) {
    console.error('Chyba při generování popisku:', error);
    res.status(500).json({ 
      error: 'Nepodařilo se vygenerovat popisek',
      details: error.message 
    });
  }
});

// Získat historii AI generování pro klienta
router.get('/history/:clientId', authMiddleware, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { limit = 20 } = req.query;

    const result = await pool.query(`
      SELECT 
        h.*,
        c.name as client_name,
        u.name as created_by_name
      FROM ai_post_history h
      LEFT JOIN clients c ON h.client_id = c.id
      LEFT JOIN users u ON h.created_by = u.id
      WHERE h.client_id = $1
      ORDER BY h.created_at DESC
      LIMIT $2
    `, [clientId, limit]);

    res.json({ history: result.rows });

  } catch (error) {
    console.error('Chyba při načítání historie:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Získat všechnu historii AI generování
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const result = await pool.query(`
      SELECT 
        h.*,
        c.name as client_name,
        u.name as created_by_name
      FROM ai_post_history h
      LEFT JOIN clients c ON h.client_id = c.id
      LEFT JOIN users u ON h.created_by = u.id
      ORDER BY h.created_at DESC
      LIMIT $1
    `, [limit]);

    res.json({ history: result.rows });

  } catch (error) {
    console.error('Chyba při načítání historie:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Smazat položku z historie
router.delete('/history/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM ai_post_history WHERE id = $1', [id]);

    res.json({ message: 'Položka smazána' });

  } catch (error) {
    console.error('Chyba při mazání položky:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

module.exports = router;
