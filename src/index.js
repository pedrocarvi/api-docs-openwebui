const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { swaggerUi, specs } = require('./swagger');
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta
const archivosRouter = require('./routes/archivosRouter');
const basesConocimientoRouter = require('./routes/basesConocimientoRouter');
const googleDriveRouter = require('./routes/googleDriveRouter');

// Swagger
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

// Rutas
app.get('/', (req, res) => {
  res.send('API Archivos - Base conocimientos con Open WebUI. Revisar /api-docs para ver el SwaggerUI.');
});
app.use('/archivos', archivosRouter);
app.use('/basesConocimiento', basesConocimientoRouter)
app.use('/googleDrive', googleDriveRouter)

require('./cron/syncFiles');

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
