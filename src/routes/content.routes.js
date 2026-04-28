const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { validateUpload } = require('../middlewares/validate.middleware');

router.post('/upload', protect, authorize('TEACHER'), upload.single('file'), validateUpload, contentController.uploadContent);
router.get('/my', protect, authorize('TEACHER'), contentController.getTeacherContent);
router.get('/', protect, authorize('PRINCIPAL'), contentController.getAllContent);
router.get('/:id', protect, authorize('TEACHER', 'PRINCIPAL'), contentController.getContentById);
router.delete('/:id', protect, authorize('TEACHER', 'PRINCIPAL'), contentController.deleteContent);

module.exports = router;
