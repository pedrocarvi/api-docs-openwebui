const axios = require('axios');

exports.userSignIn = async (email, password) => {
  try {
    const baseUrl = process.env.OPEN_WEB_UI_BASE_URL || 'http://localhost:3001/api/v1';
    const url = `${baseUrl}/auths/signin`;

    const response = await axios.post(url, { email, password });

    return response.data;
  } catch (err) {
    console.error('[userSignIn] Error:', err);

    const errorDetail = err.response?.data?.detail || err.response?.data || err.message;
    throw new Error(errorDetail);
  }
};