const express = require('express');
const router  = express.Router();
const { userSignIn } = require('../controllers/authOwuiController');

/**
 * @swagger
 * components:
 *   schemas:
 *     SignInRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         password:
 *           type: string
 *           description: Contraseña del usuario
 *       required:
 *         - email
 *         - password
 *     SignInResponse:
 *       type: object
 *       description: Respuesta de autenticación (token, datos de usuario, etc.)
 *       properties:
 *         token:
 *           type: string
 *           description: JWT generado por el servidor
 *         user:
 *           type: object
 *           description: Información del usuario autenticado
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensaje descriptivo del error
 *       required:
 *         - message
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación
 */

/**
 * @swagger
 * /authOwui/signin:
 *   post:
 *     summary: Inicia sesión de usuario y obtiene token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignInRequest'
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignInResponse'
 *       400:
 *         description: Solicitud incorrecta o credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const data = await userSignIn(email, password);
    return res.json(data);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

module.exports = router;
