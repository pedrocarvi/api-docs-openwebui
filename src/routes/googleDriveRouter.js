/**
 * @swagger
 * tags:
 *   - name: Google Drive
 *     description: Autenticación y listado de archivos de Google Drive
 */

const express = require('express');
const router = express.Router();
const {
  getGoogleDriveFiles,
  googleAuthUrl,
  googleAuthCallback
} = require('../controllers/googleDriveController');

/**
 * @swagger
 * /googleDrive/auth/google:
 *   get:
 *     tags:
 *       - Google Drive
 *     summary: Redirige al usuario al flujo OAuth2 de Google
 *     responses:
 *       '302':
 *         description: Redirección a Google para autorizar la app
 */
router.get('/auth/google', googleAuthUrl);

/**
 * @swagger
 * /googleDrive/auth/google/callback:
 *   get:
 *     tags:
 *       - Google Drive
 *     summary: Recibe el código de Google y obtiene tokens
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de autorización enviado por Google
 *     responses:
 *       '200':
 *         description: Autenticación completada
 *       '500':
 *         description: Error en el proceso de autenticación
 */
router.get('/auth/google/callback', googleAuthCallback);

/**
 * @swagger
 * /googleDrive/files:
 *   get:
 *     tags:
 *       - Google Drive
 *     summary: Lista los primeros 10 archivos del Drive
 *     responses:
 *       '200':
 *         description: Devuelve array de archivos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *       '500':
 *         description: Error al obtener archivos de Google Drive
 */
router.get('/files', getGoogleDriveFiles);

module.exports = router;
