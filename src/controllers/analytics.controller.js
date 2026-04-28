const analyticsService = require('../services/analytics.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const getSubjectAnalytics = async (req, res) => {
  try {
    const data = await analyticsService.getSubjectAnalytics();
    return successResponse(res, data, 'Subject analytics fetched');
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

const getContentUsage = async (req, res) => {
  try {
    const { page = 1, limit = 10, subject, teacher_id, status } = req.query;
    const { rows, total } = await analyticsService.getContentUsage({ page, limit, subject, teacher_id, status });
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

module.exports = { getSubjectAnalytics, getContentUsage };
