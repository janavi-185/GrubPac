const schedulingService = require('../services/scheduling.service');
const ContentView = require('../models/ContentView');
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

    if (result.available && result.subjects) {
      const entries = Object.values(result.subjects)
        .filter(s => s.current)
        .map(s => ({
          content_id: s.current.id,
          teacher_id: teacherId,
          subject: s.current.subject,
          viewed_at: new Date(),
        }));

      if (entries.length > 0) {
        ContentView.bulkCreate(entries).catch(() => {});
      }
    }

    return successResponse(res, result, result.available ? 'Live content fetched' : 'No content available');
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

module.exports = { getActiveTeachers, getLiveContent };
