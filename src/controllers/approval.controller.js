const approvalService = require('../services/approval.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const getPendingContent = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { rows, total } = await approvalService.getPendingContent({ page, limit });
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

const reviewContent = async (req, res) => {
  try {
    const content = await approvalService.reviewContent(req.params.id, req.user.id, req.body);
    const message = req.body.action === 'approve' ? 'Content approved successfully' : 'Content rejected';
    return successResponse(res, content, message);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

module.exports = { getPendingContent, reviewContent };
