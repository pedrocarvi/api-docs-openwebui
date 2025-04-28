// Middlware opcional - por si las llamadas a esta api tienen que ser con token también
// Por defecto no se utiliza en los endpoints - revisar archivosRouter para un ejemplo de como se podría usar :)
require('dotenv').config();

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Falta Authorization header' });
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Formato de Authorization inválido' });
  }

  const validToken = process.env.OPEN_WEB_UI_TOKEN;
  if (token !== validToken) {
    return res.status(403).json({ error: 'Token no autorizado' });
  }

  next();
};
