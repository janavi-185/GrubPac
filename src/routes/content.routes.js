const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Content management for Teachers and Principals
 */

/**
 * @swagger
 * /api/content/upload:
 *   post:
 *     summary: Upload new content (Teacher only)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - subject
 *               - file
 *             properties:
 *               title:
 *                 type: string
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Content uploaded successfully
 *       403:
 *         description: Forbidden
 */
router.post('/upload', protect, authorize('TEACHER'), upload.single('file'), contentController.uploadContent);

/**
 * @swagger
 * /api/content/my-content:
 *   get:
 *     summary: Get all content uploaded by the current teacher
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of teacher's content
 */
router.get('/my-content', protect, authorize('TEACHER'), contentController.getTeacherContent);

/**
 * @swagger
 * /api/content/all:
 *   get:
 *     summary: Get all uploaded content (Principal only)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all content
 */
router.get('/all', protect, authorize('PRINCIPAL'), contentController.getAllContent);

/**
 * @swagger
 * /api/content/pending:
 *   get:
 *     summary: Get all pending content (Principal only)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending content
 */
router.get('/pending', protect, authorize('PRINCIPAL'), contentController.getPendingContent);

/**
 * @swagger
 * /api/content/approve/{id}:
 *   patch:
 *     summary: Approve content (Principal only)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Content approved
 */
router.patch('/approve/:id', protect, authorize('PRINCIPAL'), contentController.approveContent);

/**
 * @swagger
 * /api/content/reject/{id}:
 *   patch:
 *     summary: Reject content (Principal only)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Content rejected
 */
router.patch('/reject/:id', protect, authorize('PRINCIPAL'), contentController.rejectContent);

module.exports = router;
