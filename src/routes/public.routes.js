const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

router.get('/teachers', publicController.getActiveTeachers);
router.get('/:teacherId', publicController.getLiveContent);

module.exports = router;
