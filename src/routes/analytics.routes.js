const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { getSubjectAnalytics, getContentUsage } = require('../controllers/analytics.controller');

router.use(authenticate, authorize('PRINCIPAL'));

router.get('/subjects', getSubjectAnalytics);
router.get('/content-usage', getContentUsage);

module.exports = router;
