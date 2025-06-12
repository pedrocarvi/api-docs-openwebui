const express = require('express');
const router  = express.Router();
const { getFiles, getFileById, uploadFile, deleteFile }  = require('../controllers/archivosController');
const multer  = require('multer');
const storage = multer.memoryStorage();
const upload  = multer({ storage });
const { authenticateToken } = require('../middlewares/auth');

/**
 * @swagger
 * /archivos/all:
 *   get:
 *     summary: Trae todos los archivos subidos en Open WebUI
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de archivos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FileMetadata'
 *       401:
 *         description: Falta o es inválido el token
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
router.get('/all', authenticateToken, getFiles);

/**
 * @swagger
 * /archivos/{fileId}:
 *   post:
 *     summary: Obtiene la info de un archivo de Open WebUI por su ID
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del archivo
 *     responses:
 *       200:
 *         description: Contenido del archivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileMetadata'
 *       400:
 *         description: No se envió fileId en el body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Falta o es inválido el token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Archivo no encontrado
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
router.post('/:fileId', authenticateToken, getFileById);

/**
 * @swagger
 * /archivos/upload:
 *   post:
 *     summary: Sube un archivo a Open WebUI 
 *     description: Una vez subido, se puede agregar a una base de conocimiento.
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Falta o es inválido el token
 */
router.post('/upload', authenticateToken, upload.single('file'), uploadFile);

/**
 * @swagger
 * /archivos/{fileId}:
 *   delete:
 *     summary: Elimina un archivo de Open WebUI por su ID
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del archivo a eliminar
 *     responses:
 *       200:
 *         description: Archivo eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Falta o es inválido el token
 *       404:
 *         description: Archivo no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:fileId', authenticateToken, deleteFile);


module.exports = router;
