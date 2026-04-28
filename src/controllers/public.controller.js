const schedulingService = require('../services/scheduling.service');
const { successResponse, errorResponse } = require('../utils/response');

const getActiveTeachers = async (req, res) => {
  try {
    const teachers = await schedulingService.getAllActiveTeachers();
    return successResponse(res, teachers, 'Active teachers fetched');
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

const getLiveContent = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { subject } = req.query;
    const result = await schedulingService.getLiveContent(teacherId, subject);
    return successResponse(res, result, result.available ? 'Live content fetched' : 'No content available');
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

module.exports = { getActiveTeachers, getLiveContent };
