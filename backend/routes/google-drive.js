const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const googleDriveService = require('../services/googleDriveService');

// Multer pro upload (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Získat authorization URL
router.get('/auth-url', authMiddleware, (req, res) => {
  try {
    const authUrl = googleDriveService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Chyba při získávání auth URL:', error);
    res.status(500).json({ error: 'Chyba serveru' });
  }
});

// Callback po autorizaci
router.post('/callback', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code je povinný' });
    }

    const tokens = await googleDriveService.getTokensFromCode(code);
    
    res.json({ 
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    });
  } catch (error) {
    console.error('Chyba při zpracování callback:', error);
    res.status(500).json({ error: 'Chyba při autorizaci' });
  }
});

// Refresh access token
router.post('/refresh-token', authMiddleware, async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token je povinný' });
    }

    const newAccessToken = await googleDriveService.refreshAccessToken(refresh_token);
    
    res.json({ access_token: newAccessToken });
  } catch (error) {
    console.error('Chyba při refresh tokenu:', error);
    res.status(401).json({ error: 'Neplatný refresh token' });
  }
});

// Získat seznam souborů
router.get('/files', authMiddleware, async (req, res) => {
  try {
    const { folderId = 'root', accessToken } = req.query;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token je povinný' });
    }

    const files = await googleDriveService.listFiles(accessToken, folderId);
    
    res.json({ files });
  } catch (error) {
    console.error('Chyba při získávání souborů:', error);
    
    if (error.code === 401) {
      return res.status(401).json({ error: 'Token expired', needsRefresh: true });
    }
    
    res.status(500).json({ error: 'Chyba při načítání souborů' });
  }
});

// Získat detail souboru
router.get('/files/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { accessToken } = req.query;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token je povinný' });
    }

    const file = await googleDriveService.getFile(accessToken, id);
    
    res.json({ file });
  } catch (error) {
    console.error('Chyba při získávání souboru:', error);
    res.status(500).json({ error: 'Chyba při načítání souboru' });
  }
});

// Upload souboru
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { folderId = 'root', accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token je povinný' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Soubor je povinný' });
    }

    const uploadedFile = await googleDriveService.uploadFile(accessToken, req.file, folderId);
    
    res.json({ file: uploadedFile });
  } catch (error) {
    console.error('Chyba při uploadu souboru:', error);
    res.status(500).json({ error: 'Chyba při nahrávání souboru' });
  }
});

// Vytvořit složku
router.post('/create-folder', authMiddleware, async (req, res) => {
  try {
    const { name, parentId = 'root', accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token je povinný' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Název složky je povinný' });
    }

    const folder = await googleDriveService.createFolder(accessToken, name, parentId);
    
    res.json({ folder });
  } catch (error) {
    console.error('Chyba při vytváření složky:', error);
    res.status(500).json({ error: 'Chyba při vytváření složky' });
  }
});

// Stáhnout soubor
router.get('/download/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { accessToken } = req.query;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token je povinný' });
    }

    // Získat metadata souboru
    const file = await googleDriveService.getFile(accessToken, id);
    
    // Získat stream souboru
    const fileStream = await googleDriveService.downloadFile(accessToken, id);
    
    // Nastavit headers pro download
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.setHeader('Content-Type', file.mimeType);
    
    // Streamovat soubor
    fileStream.pipe(res);
  } catch (error) {
    console.error('Chyba při stahování souboru:', error);
    res.status(500).json({ error: 'Chyba při stahování souboru' });
  }
});

// Smazat soubor
router.delete('/files/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { accessToken } = req.query;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token je povinný' });
    }

    await googleDriveService.deleteFile(accessToken, id);
    
    res.json({ message: 'Soubor smazán' });
  } catch (error) {
    console.error('Chyba při mazání souboru:', error);
    res.status(500).json({ error: 'Chyba při mazání souboru' });
  }
});

// Vyhledat soubory
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { query, accessToken } = req.query;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token je povinný' });
    }

    if (!query) {
      return res.status(400).json({ error: 'Vyhledávací dotaz je povinný' });
    }

    const files = await googleDriveService.searchFiles(accessToken, query);
    
    res.json({ files });
  } catch (error) {
    console.error('Chyba při vyhledávání:', error);
    res.status(500).json({ error: 'Chyba při vyhledávání' });
  }
});

module.exports = router;
