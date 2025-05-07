const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TOKEN_PATH = path.join(__dirname, '../token.json');

const oAuth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  'http://localhost:3001/googleDrive/auth/google/callback'
);

// Carga tokens desde disco si existen
function loadTokens() {
  if (fs.existsSync(TOKEN_PATH)) {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(tokens);
  }
}

// Guarda tokens en disco
function saveTokens(tokens) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
}

// Inicializamos credenciales al arrancar
loadTokens();

const drive = google.drive({ version: 'v3', auth: oAuth2Client });

exports.googleAuthUrl = (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',      // para obtener refresh_token
    prompt: 'consent',           // fuerza a Google a pedir consentimiento y refresh_token
    scope: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  res.redirect(authUrl);
};

// Ruta de callback para manejar el código de autorización
exports.googleAuthCallback = async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    saveTokens(tokens);        // persistimos tokens
    res.send('Autenticación completada. Ahora puedes acceder a Google Drive.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el proceso de autenticación');
  }
};

exports.getGoogleDriveFiles = async (req, res) => {
  try {
    // 1) Listar todas las carpetas
    const folderResponse = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false and 'me' in owners and 'root' in parents",
      fields: 'nextPageToken, files(id, name)',
      spaces: 'drive',
      corpora: 'user',
    });
    const folders = folderResponse.data.files;

    // 2) Para cada carpeta, listar sus archivos
    const results = await Promise.all(folders.map(async folder => {
      const filesResponse = await drive.files.list({
        q: `'${folder.id}' in parents and mimeType='application/pdf' and trashed=false`,
        fields: 'nextPageToken, files(id, name, mimeType, modifiedTime)',
        spaces: 'drive',
      });
      return {
        folder: {
          id: folder.id,
          name: folder.name
        },
        files: filesResponse.data.files || []
      };
    }));

    res.json({ data: results });
  } catch (error) {
    console.error('Error listando carpetas y archivos:', error);
    res.status(500).json({ error: error.message });
  }
};

// Endpoint para desconectar (logout)
exports.googleLogout = async (req, res) => {
  try {
    // Revocamos el refresh_token y access_token
    await oAuth2Client.revokeCredentials();
  } catch (e) {
    console.warn('No se pudo revocar credenciales:', e.message);
  }
  // Borramos el archivo de tokens
  if (fs.existsSync(TOKEN_PATH)) {
    fs.unlinkSync(TOKEN_PATH);
  }
  // Limpiamos credenciales en memoria
  oAuth2Client.setCredentials({});
  res.send('Desconectado de Google Drive');
};