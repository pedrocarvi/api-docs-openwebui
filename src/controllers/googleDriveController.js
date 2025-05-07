const { google } = require('googleapis');
require('dotenv').config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  'http://localhost:3001/googleDrive/auth/google/callback'
);
const drive = google.drive({ version: 'v3', auth: oAuth2Client });

exports.googleAuthUrl = (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
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
    res.send('Autenticación completada. Ahora puedes acceder a Google Drive.');
  } catch (error) {
    res.status(500).send('Error en el proceso de autenticación');
  }
};

exports.getGoogleDriveFiles = async (req, res) => {
  try {
    // 1) Listar todas las carpetas
    const folderResponse = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed = false",
      fields: 'nextPageToken, files(id, name)',
      spaces: 'drive',
    });
    const folders = folderResponse.data.files;

    // 2) Para cada carpeta, listar sus archivos
    const results = await Promise.all(folders.map(async folder => {
      const filesResponse = await drive.files.list({
        q: `'${folder.id}' in parents and mimeType='application/pdf' and trashed = false`,
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
