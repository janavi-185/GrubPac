const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approval.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validateReview } = require('../middlewares/validate.middleware');

router.get('/pending', protect, authorize('PRINCIPAL'), approvalController.getPendingContent);
router.patch('/:id/review', protect, authorize('PRINCIPAL'), validateReview, approvalController.reviewContent);

module.exports = router;
