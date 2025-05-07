const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();

const LOCAL_API_URL    = process.env.LOCAL_API_URL    || 'http://localhost:3001';
const OPEN_WEBUI_TOKEN = process.env.OPEN_WEB_UI_TOKEN;
const AUTH_HEADER      = { Authorization: `Bearer ${OPEN_WEBUI_TOKEN}` };

// Mapeo DriveFolderID → KnowledgeBaseID
const folderToKbMap = {
  '15oghZ0RAII5RjCqZY3i2cfgoSiMZw06o': 'ece42a50-67c8-4cd3-a406-fa21a96311ad'
};

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

  // Map nombre → ID en file store
  const nameToFileId = new Map(fileStore.map(f => [ f.meta.name, f.id ]));

  // Tiempo de corte para UPDATE (1 minuto atrás)
  const oneMinAgo = Date.now() - 5 * 60 * 1000;

  for (const [folderId, kbId] of Object.entries(folderToKbMap)) {
    const driveEntry = driveData.find(d => d.folder.id === folderId) || { folder: { name: folderId }, files: [] };
    const kb = knowledgeBases.find(k => k.id === kbId);

    if (!kb) {
      console.log(`⚠️  KB no encontrada: ${kbId}`); continue;
    }

    const driveFiles = driveEntry.files;
    const openFiles = (kb.files||[]).map(f => ({
      id:        f.id,               // <-- aquí preservas el ID
      name:      f.meta.name,
      updatedAt: f.updated_at * 1000
    }));

    const namesDrive = new Set(driveFiles.map(f => f.name));
    const namesOpen  = new Set(openFiles.map(f => f.name));

    const toAdd    = driveFiles.filter(f => !namesOpen.has(f.name));
    const toRemove = openFiles.filter(f => !namesDrive.has(f.name));
    const toUpdate = driveFiles.filter(f => {
      if (!namesOpen.has(f.name)) return false;
      return new Date(f.modifiedTime).getTime() > oneMinAgo;
    });

    // ADD: console.log
    toAdd.forEach(f => {
      console.log(`ADD    → "${driveEntry.folder.name}" → "${kb.name}" → ${f.name}`);
    });

    // — UPDATE: console.log
    toUpdate.forEach(f => {
      console.log(`UPDATE → "${driveEntry.folder.name}" → "${kb.name}" → ${f.name}`);
    });

    // — REMOVE: desasociar de la KB (acción real)
    for (const f of toRemove) {
      console.log(`REMOVE – → Carpeta "${driveEntry.folder.name}" → KB "${kb.name}" → ${f.name}`);
      try {
        await axios.post(
          `${LOCAL_API_URL}/basesConocimiento/${kbId}/file/remove`,
          { file_id: f.id },
          { headers: AUTH_HEADER }
        );
      } catch (err) {
        console.error(`------- REMOVE ERROR "${f.name}":`, err.response?.data || err.message);
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
