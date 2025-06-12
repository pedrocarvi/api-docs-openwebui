const axios = require('axios');
const FormData = require('form-data');

exports.getFiles = async (req, res, next) => {
  try {
    const token = req.owuiToken;
    if (!token) {
      return res.status(401).json({ error: 'No hay token en la petición' });
    }

    const baseUrl = process.env.OPEN_WEB_UI_BASE_URL || 'http://localhost:3000/api/v1';
    const url = `${baseUrl}/files/`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    next(err);
  }
};

exports.getFileById = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    if (!fileId) {
      return res.status(400).json({ error: 'Debe enviar fileId en la URL' });
    }

    const token = req.owuiToken;
    if (!token) {
      return res.status(500).json({ error: 'No está configurado OPEN_WEB_UI_TOKEN' });
    }

    const baseUrl = process.env.OPEN_WEB_UI_BASE_URL || 'http://localhost:3000/api/v1';
    const url = `${baseUrl}/files/${fileId}`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    return res.status(response.status).json(response.data);

  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    // Otros errores
    return next(err);
  }
};

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    const token = req.owuiToken;
    if (!token) {
      return res.status(500).json({ error: 'No está configurado OPEN_WEB_UI_TOKEN' });
    }

    // Armar el FormData con el buffer
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const baseUrl = process.env.OPEN_WEB_UI_BASE_URL || 'http://localhost:3000/api/v1';
    const owuUrl = `${baseUrl}/files/`;

    const owuResponse = await axios.post(owuUrl, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    return res.status(owuResponse.status).json(owuResponse.data);

  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return next(err);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    if (!fileId) {
      return res.status(400).json({ error: 'Debe enviar fileId en la ruta' });
    }

    const token = req.owuiToken;
    if (!token) {
      return res.status(500).json({ error: 'No está configurado OPEN_WEB_UI_TOKEN' });
    }

    const baseUrl = process.env.OPEN_WEB_UI_BASE_URL || 'http://localhost:3000/api/v1';
    const url = `${baseUrl}/files/${fileId}`;

    const response = await axios.delete(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    return res.status(200).json({ message: 'Archivo eliminado correctamente' });

  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    next(err);
  }
};
