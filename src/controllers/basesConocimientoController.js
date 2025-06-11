const axios = require('axios');

exports.getKnowledgeBases = async (req, res, next) => {
  try {
    const token = req.owuiToken;
    if (!token) {
      return res.status(500).json({ error: 'No está configurado OPEN_WEB_UI_TOKEN' });
    }

    const baseUrl = process.env.OPEN_WEB_UI_BASE_URL || 'http://localhost:3000/api/v1';
    const url     = `${baseUrl}/knowledge/`;

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

exports.addFileToKnowledge = async (req, res, next) => {
  try {
    const { id_knowledge } = req.params;
    const { file_id }      = req.body;

    if (!id_knowledge || !file_id) {
      return res.status(400).json({ error: 'Debe enviar id_knowledge en la ruta y file_id en el body' });
    }

    const token = req.owuiToken;
    if (!token) {
      return res.status(500).json({ error: 'No está configurado OPEN_WEB_UI_TOKEN' });
    }

    const baseUrl = process.env.OPEN_WEB_UI_BASE_URL || 'http://localhost:3000/api/v1';
    const url     = `${baseUrl}/knowledge/${id_knowledge}/file/add`;

    const response = await axios.post(
      url,
      { file_id },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept'       : 'application/json'
        }
      }
    );

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

exports.deleteFileFromKnowledge = async (req, res, next) => {
  try {
    const { id_knowledge } = req.params;
    const { file_id }      = req.body;

    if (!id_knowledge || !file_id) {
      return res.status(400).json({ error: 'Debe enviar id_knowledge en la ruta y file_id en el body' });
    }

    const token = req.owuiToken;
    if (!token) {
      return res.status(500).json({ error: 'No está configurado OPEN_WEB_UI_TOKEN' });
    }

    const baseUrl = process.env.OPEN_WEB_UI_BASE_URL || 'http://localhost:3000/api/v1';
    const url     = `${baseUrl}/knowledge/${id_knowledge}/file/remove`;

    const response = await axios.post(
      url,
      { file_id },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept'       : 'application/json'
        }
      }
    );

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
