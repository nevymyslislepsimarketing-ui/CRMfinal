const { google } = require('googleapis');

// OAuth2 Client
const getOAuth2Client = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  return oauth2Client;
};

// Získat authorization URL
const getAuthUrl = () => {
  const oauth2Client = getOAuth2Client();
  
  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  return authUrl;
};

// Získat tokeny z kódu
const getTokensFromCode = async (code) => {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

// Získat Drive client s access tokenem
const getDriveClient = (accessToken) => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth: oauth2Client });
};

// Obnovit access token pomocí refresh tokenu
const refreshAccessToken = async (refreshToken) => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials.access_token;
};

// Získat seznam souborů
const listFiles = async (accessToken, folderId = 'root') => {
  const drive = getDriveClient(accessToken);
  
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, iconLink, webViewLink, thumbnailLink)',
    orderBy: 'folder,name'
  });

  return response.data.files;
};

// Získat detail souboru
const getFile = async (accessToken, fileId) => {
  const drive = getDriveClient(accessToken);
  
  const response = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size, createdTime, modifiedTime, iconLink, webViewLink, thumbnailLink, parents'
  });

  return response.data;
};

// Upload souboru
const uploadFile = async (accessToken, file, folderId = 'root') => {
  const drive = getDriveClient(accessToken);
  const { Readable } = require('stream');
  
  const fileMetadata = {
    name: file.originalname,
    parents: [folderId]
  };

  const media = {
    mimeType: file.mimetype,
    body: Readable.from(file.buffer)
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, name, mimeType, size, webViewLink'
  });

  return response.data;
};

// Vytvořit složku
const createFolder = async (accessToken, folderName, parentId = 'root') => {
  const drive = getDriveClient(accessToken);
  
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId]
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    fields: 'id, name, mimeType'
  });

  return response.data;
};

// Stáhnout soubor
const downloadFile = async (accessToken, fileId) => {
  const drive = getDriveClient(accessToken);
  
  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  return response.data;
};

// Smazat soubor
const deleteFile = async (accessToken, fileId) => {
  const drive = getDriveClient(accessToken);
  await drive.files.delete({ fileId });
};

// Vyhledat soubory
const searchFiles = async (accessToken, query) => {
  const drive = getDriveClient(accessToken);
  
  const response = await drive.files.list({
    q: `name contains '${query}' and trashed = false`,
    fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, iconLink, webViewLink, thumbnailLink)',
    orderBy: 'name'
  });

  return response.data.files;
};

module.exports = {
  getAuthUrl,
  getTokensFromCode,
  refreshAccessToken,
  listFiles,
  getFile,
  uploadFile,
  createFolder,
  downloadFile,
  deleteFile,
  searchFiles
};
