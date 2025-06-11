const express = require('express');
const router  = express.Router();
const { getKnowledgeBases, addFileToKnowledge, deleteFileFromKnowledge }  = require('../controllers/basesConocimientoController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * @swagger
 * /basesConocimiento/all:
 *   get:
 *     summary: Obtiene todas las bases de conocimiento que existen en Open WebUI
 *     tags:
 *       - Knowledge
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array de colecciones de conocimiento
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/KnowledgeBase'
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
router.get('/all',authenticateToken, getKnowledgeBases);

/**
 * @swagger
 * /basesConocimiento/{id_knowledge}/file/add:
 *   post:
 *     summary: Añade un archivo a una base de conocimiento existente en Open WebUI
 *     tags:
 *       - Knowledge
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_knowledge
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID de la base de conocimiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - file_id
 *             properties:
 *               file_id:
 *                 type: string
 *                 description: UUID del archivo previamente subido
 *     responses:
 *       200:
 *         description: Respuesta de Open Web UI tras asociar el archivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Parámetros faltantes o inválidos
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
 *         description: Base de conocimiento o archivo no encontrado
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
router.post('/:id_knowledge/file/add', authenticateToken, addFileToKnowledge);

/**
 * @swagger
 * /basesConocimiento/{id_knowledge}/file/remove:
 *   post:
 *     summary: Elimina un archivo de una base de conocimiento existente en Open WebUI
 *     tags:
 *       - Knowledge
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_knowledge
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID de la base de conocimiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - file_id
 *             properties:
 *               file_id:
 *                 type: string
 *                 description: UUID del archivo previamente subido
 *     responses:
 *       200:
 *         description: Respuesta de Open Web UI tras eliminar el archivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Parámetros faltantes o inválidos
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
 *         description: Base de conocimiento o archivo no encontrado
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
router.post('/:id_knowledge/file/remove', authenticateToken, deleteFileFromKnowledge);

module.exports = router;
