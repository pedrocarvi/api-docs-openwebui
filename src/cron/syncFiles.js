const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();
const { google } = require('googleapis');
const fs       = require('fs');
const path     = require('path');
const FormData = require('form-data');

const LOCAL_API_URL    = process.env.LOCAL_API_URL    || 'http://localhost:3001';
const OPEN_WEBUI_TOKEN = process.env.OPEN_WEB_UI_TOKEN;
const AUTH_HEADER      = { Authorization: `Bearer ${OPEN_WEBUI_TOKEN}` };

// Configuración de Google Drive API - para la descarga de archivos y subida a OWUI.
const oAuth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  process.env.OAUTH_REDIRECT_URI
);
const tokenPath = path.join(__dirname, '../token.json');
const tokens    = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
oAuth2Client.setCredentials(tokens);

const drive = google.drive({ version: 'v3', auth: oAuth2Client });

// Mapeo DriveFolderID → KnowledgeBaseID
const folderToKbMap = {
  '15oghZ0RAII5RjCqZY3i2cfgoSiMZw06o': 'ece42a50-67c8-4cd3-a406-fa21a96311ad'
};

async function uploadToOpenWebUI(fileName, fileBuffer) {
  const form = new FormData();
  form.append('file', fileBuffer, fileName);
  const res = await axios.post(
    `${LOCAL_API_URL}/archivos/upload`,
    form,
    { headers: { ...AUTH_HEADER, ...form.getHeaders() } }
  );
  return res.data.id;
}

async function addFileToKB(kbId, fileId) {
  await axios.post(
    `${LOCAL_API_URL}/basesConocimiento/${kbId}/file/add`,
    { file_id: fileId },
    { headers: AUTH_HEADER }
  );
}

async function removeFileFromKB(kbId, fileId) {
  await axios.post(
    `${LOCAL_API_URL}/basesConocimiento/${kbId}/file/remove`,
    { file_id: fileId },
    { headers: AUTH_HEADER }
  );
}

async function syncDriveToOpenWebUI() {
  // 1) Traer listados
  const [ driveRes, fileStoreRes, kbRes ] = await Promise.all([
    axios.get(`${LOCAL_API_URL}/googleDrive/files`),
    axios.get(`${LOCAL_API_URL}/archivos/all`, { headers: AUTH_HEADER }),
    axios.get(`${LOCAL_API_URL}/basesConocimiento/all`, { headers: AUTH_HEADER })
  ]);

  const driveData = driveRes.data.data;
  const fileStore = fileStoreRes.data;
  const knowledgeBases = kbRes.data;

  // Mapa nombre → openWebUI file ID
  const nameToOpenId = new Map(fileStore.map(f => [ f.meta.name, f.id ]));

  // Tiempo de corte para UPDATE (1 minuto atrás)
  const oneMinAgo = Date.now() - 5 * 60 * 1000;

  for (const [folderId, kbId] of Object.entries(folderToKbMap)) {
    const driveEntry = driveData.find(d => d.folder.id === folderId) || { folder: { name: folderId }, files: [] };
    const kb = knowledgeBases.find(k => k.id === kbId);

    if (!kb) {
      console.log(`⚠️  KB no encontrada: ${kbId}`); continue;
    }

    // Armar lista de archivos existentes con ambos IDs
    const driveFiles = driveEntry.files;
    const openFiles = (kb.files||[]).map(f => ({
      driveId:   f.id,
      openId:    nameToOpenId.get(f.meta.name),
      name:      f.meta.name,
      updatedAt: f.updated_at * 1000
    }));

    const namesDrive = new Set(driveFiles.map(f => f.name));
    const namesOpen  = new Set(openFiles.map(f => f.name));

    const toAdd    = driveFiles.filter(f => !namesOpen.has(f.name));
    const toRemove = openFiles.filter(f => !namesDrive.has(f.name));
    const toUpdate = driveFiles.filter(f =>
      namesOpen.has(f.name) &&
      new Date(f.modifiedTime).getTime() > oneMinAgo
    );

    // — ADD
    for (const f of toAdd) {
      console.log(`ADD    → "${driveEntry.folder.name}" → "${kb.name}" → ${f.name}`);
      // Descargar desde Drive
      const streamRes = await drive.files.get(
        { fileId: f.id, alt: 'media' },
        { responseType: 'stream' }
      );
      const chunks = [];
      for await (const chunk of streamRes.data) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);

      // Subir y asociar
      const newFileId = await uploadToOpenWebUI(f.name, buffer);
      await addFileToKB(kbId, newFileId);
    }

    // — UPDATE (remove + re-upload + add)
    for (const df of toUpdate) {
      console.log(`UPDATE → "${driveEntry.folder.name}" → "${kb.name}" → ${df.name}`);
      const of = openFiles.find(o => o.name === df.name);

      if (!of?.openId) {
        console.warn(`⚠️ No existe openId para "${df.name}", saltando UPDATE`);
        continue;
      }

      // 1) Remove
      await removeFileFromKB(kbId, of.openId);

      // 2) Descargar nueva versión
      const streamRes = await drive.files.get(
        { fileId: df.id, alt: 'media' },
        { responseType: 'stream' }
      );
      const chunks = [];
      for await (const chunk of streamRes.data) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);

      // 3) Subir y volver a asociar
      const newOpenId = await uploadToOpenWebUI(df.name, buffer);
      await addFileToKB(kbId, newOpenId);
    }

    // — REMOVE
    for (const ofile of toRemove) {
      console.log(`REMOVE → "${driveEntry.folder.name}" → "${kb.name}" → ${ofile.name}`);
      if (!ofile.openId) {
        console.warn(`⚠️ No existe openId para "${ofile.name}", no se puede remover`);
        continue;
      }
      try {
        await removeFileFromKB(kbId, ofile.openId);
      } catch (err) {
        console.error(`------- REMOVE ERROR "${ofile.name}":`, err.response?.data || err.message);
      }
    }
  }
}

// Cron cada 1 minuto
cron.schedule('*/1 * * * *', async () => {
  console.log(`[${new Date().toISOString()}] Iniciando sincronización Drive ⇄ OpenWebUI`);
  try {
    await syncDriveToOpenWebUI();
    console.log('Sincronización completada correctamente');
  } catch (err) {
    console.error('Error durante la sincronización:', err);
  }
});

module.exports = cron;
