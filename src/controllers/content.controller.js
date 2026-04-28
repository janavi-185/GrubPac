const contentService = require('../services/content.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const uploadContent = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'File is required', 400);
    }
    const { title, subject, description, start_time, end_time, rotation_duration } = req.body;
    const content = await contentService.uploadContent({
      title,
      subject,
      description,
      file_url: req.file.path,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      start_time,
      end_time,
      rotation_duration,
      uploaderId: req.user.id,
    });
    return successResponse(res, content, 'Content uploaded and pending approval', 201);
  } catch (err) {
    contentService.deleteUploadedFile(req.file?.path);
    return errorResponse(res, err.message, err.status || 500);
  }
};

const getTeacherContent = async (req, res) => {
  try {
    const { page = 1, limit = 10, subject } = req.query;
    const { rows, total } = await contentService.getTeacherContent(req.user.id, { page, limit, subject });
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

const getAllContent = async (req, res) => {
  try {
    const { page = 1, limit = 10, subject, teacher_id, status } = req.query;
    const { rows, total } = await contentService.getAllContent({ page, limit, subject, teacher_id, status });
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};


const getContentById = async (req, res) => {
  try {
    const content = await contentService.getContentById(req.params.id);
    return successResponse(res, content);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

const deleteContent = async (req, res) => {
  try {
    await contentService.deleteContent(req.params.id, req.user);
    return successResponse(res, null, 'Content deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

module.exports = { uploadContent, getTeacherContent, getAllContent, getContentById, deleteContent };