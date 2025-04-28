const axios = require('axios');
const FormData = require('form-data');

exports.getFiles = async (req, res, next) => {
  try {
    const token = process.env.OPEN_WEB_UI_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'No está configurado OPEN_WEB_UI_TOKEN' });
    }

    const baseUrl = process.env.OPEN_WEB_UI_BASE_URL || 'http://localhost:3000/api/v1';
    const url     = `${baseUrl}/files/`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept'       : 'application/json'
      }
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res
        .status(err.response.status)
        .json(err.response.data);
    }
    next(err);
  }
};

exports.getFileById = async (req, res, next) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      return res.status(400).json({ error: 'Debe enviar fileId en el body' });
    }

    const token = process.env.OPEN_WEB_UI_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'No está configurado OPEN_WEB_UI_TOKEN' });
    }

    const baseUrl = process.env.OPEN_WEB_UI_BASE_URL || 'http://localhost:3000/api/v1';
    const url     = `${baseUrl}/files/${fileId}`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept'       : 'application/json'
      }
    });

    return res
      .status(response.status)
      .json(response.data);

  } catch (err) {
    if (err.response) {
      return res
        .status(err.response.status)
        .json(err.response.data);
    }
    // Otros errores
    return next(err);
  }
};

exports.uploadFile = async (req, res, next) => {
  try {
    // 1. Validar que Multer haya capturado un archivo en memoria
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    // 2. Leer token de .env
    const token = process.env.OPEN_WEB_UI_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'No está configurado OPEN_WEB_UI_TOKEN' });
    }

    // 3. Armar el FormData con el buffer
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename   : req.file.originalname,
      contentType: req.file.mimetype
    });

    // 4. URL CORRECTA de OWUI
    const baseUrl = process.env.OPEN_WEB_UI_BASE_URL || 'http://localhost:3000/api/v1';
    const owuUrl  = `${baseUrl}/files/`;          // ← aquí está la clave

    // 5. Enviar el POST
    const owuResponse = await axios.post(owuUrl, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`,
        'Accept'       : 'application/json'
      },
      maxContentLength: Infinity,
      maxBodyLength   : Infinity
    });

    // 6. Devolver la respuesta de OWUI
    return res
      .status(owuResponse.status)
      .json(owuResponse.data);

  } catch (err) {
    // Si OWUI devolvió un error, lo reenviamos
    if (err.response) {
      return res
        .status(err.response.status)
        .json(err.response.data);
    }
    // Otros errores (conexión, configuración, etc.)
    return next(err);
  }
};