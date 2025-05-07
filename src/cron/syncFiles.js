const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();

const LOCAL_API_URL    = process.env.LOCAL_API_URL    || 'http://localhost:3001';
const OPEN_WEBUI_TOKEN = process.env.OPEN_WEB_UI_TOKEN;

// Mapeo DriveFolderID → KnowledgeBaseID
const folderToKbMap = {
  '15oghZ0RAII5RjCqZY3i2cfgoSiMZw06o': 'ece42a50-67c8-4cd3-a406-fa21a96311ad'
};

async function syncDriveToOpenWebUI() {
  // 1) Traer archivos de Drive
  const driveRes = await axios.get(`${LOCAL_API_URL}/googleDrive/files`);
  const driveData = driveRes.data.data;   // driveRes.data tiene { data: [ { folder, files: [...] }, … ] }

  // 2) Traer bases de conocimiento
  const kbRes = await axios.get(`
    ${LOCAL_API_URL}/basesConocimiento/all`,
    { headers: { Authorization: `Bearer ${OPEN_WEBUI_TOKEN}` } }
  );
  const knowledgeBases = kbRes.data;

  // Variable para controlar modificaciones en los archivos. (Tiene que ser igual al cron)
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;

  for (const [folderId, kbId] of Object.entries(folderToKbMap)) {
    const driveEntry = driveData.find(d => d.folder.id === folderId) || { folder: { name: folderId }, files: [] };
    const kb = knowledgeBases.find(k => k.id === kbId);

    if (!kb) {
      console.log(`⚠️  KB no encontrada: ${kbId}`); continue;
    }

    const driveFiles = driveEntry.files;
    const openFiles  = (kb.files||[]).map(f => ({
      name:      f.meta.name,
      updatedAt: f.updated_at * 1000
    }));

    const namesDrive = new Set(driveFiles.map(f => f.name));
    const namesOpen  = new Set(openFiles.map(f => f.name));

    const toAdd    = driveFiles.filter(f => !namesOpen.has(f.name));
    const toRemove = openFiles.filter(f => !namesDrive.has(f.name));
    const toUpdate = driveFiles.filter(f => {
      if (!namesOpen.has(f.name)) return false;
      return new Date(f.modifiedTime).getTime() > fiveMinAgo;
    });

    toAdd.forEach(f => {
      console.log(`ADD    → "${driveEntry.folder.name}" → "${kb.name}" → ${f.name}`);
    });
    toUpdate.forEach(f => {
      console.log(`UPDATE → "${driveEntry.folder.name}" → "${kb.name}" → ${f.name}`);
    });
    toRemove.forEach(f => {
      console.log(`REMOVE → "${driveEntry.folder.name}" → "${kb.name}" → ${f.name}`);
    });
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
