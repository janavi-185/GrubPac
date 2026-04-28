const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { getSubjectAnalytics, getContentUsage } = require('../controllers/analytics.controller');

// All analytics routes require PRINCIPAL role
router.use(authenticate, authorize('PRINCIPAL'));

/**
 * GET /api/analytics/subjects
 * Most active subjects ranked by view count
 */
router.get('/subjects', getSubjectAnalytics);

/**
 * GET /api/analytics/content-usage
 * Per-content view count with filters: subject, teacher_id, status, page, limit
 */
router.get('/content-usage', getContentUsage);

module.exports = router;
