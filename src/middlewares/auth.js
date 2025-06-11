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

  // Si quisieras verificar la firma del JWT
  // const jwt = require('jsonwebtoken');
  // try {
  //   req.user = jwt.verify(token, process.env.OPEN_WEB_UI_TOKEN);
  // } catch (e) {
  //   return res.status(403).json({ error: 'Token inválido' });
  // }

  // Guardamos el token para que los controllers lo usen
  req.owuiToken = token;
  next();
};
