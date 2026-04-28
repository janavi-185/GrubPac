const fs = require('fs');
const { Op } = require('sequelize');
const Content = require('../models/Content');
const ContentSlot = require('../models/ContentSlot');
const ContentSchedule = require('../models/ContentSchedule');
const User = require('../models/User');

const uploadContent = async ({ title, subject, description, file_url, file_type, file_size, start_time, end_time, rotation_duration, uploaderId }) => {
  const normalizedSubject = subject.toLowerCase().trim();

  const [slot] = await ContentSlot.findOrCreate({
    where: { subject: normalizedSubject },
    defaults: { subject: normalizedSubject },
  });

  const lastSchedule = await ContentSchedule.findOne({
    where: { slot_id: slot.id },
    order: [['rotation_order', 'DESC']],
  });

  const nextRotationOrder = lastSchedule ? lastSchedule.rotation_order + 1 : 1;

  const content = await Content.create({
    title,
    subject: normalizedSubject,
    description,
    file_url,
    file_type,
    file_size,
    start_time: start_time || null,
    end_time: end_time || null,
    uploaded_by: uploaderId,
    status: 'PENDING',
  });

  await ContentSchedule.create({
    content_id: content.id,
    slot_id: slot.id,
    rotation_order: nextRotationOrder,
    duration: rotation_duration || 5,
  });

  return content;
};

const deleteUploadedFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, () => {});
  }
};

const getTeacherContent = async (uploaderId, { page = 1, limit = 10, subject } = {}) => {
  const where = { uploaded_by: uploaderId };
  if (subject) where.subject = subject.toLowerCase();

  const offset = (page - 1) * limit;

  const { count, rows } = await Content.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: Number(limit),
    offset,
  });

  return { rows, total: count };
};

const getAllContent = async ({ page = 1, limit = 10, subject, teacher_id } = {}) => {
  const where = {};
  if (subject) where.subject = subject.toLowerCase();
  if (teacher_id) where.uploaded_by = teacher_id;

  const offset = (page - 1) * limit;

  const { count, rows } = await Content.findAndCountAll({
    where,
    include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }],
    order: [['created_at', 'DESC']],
    limit: Number(limit),
    offset,
  });

  return { rows, total: count };
};

const getContentById = async (id) => {
  const content = await Content.findByPk(id, {
    include: [
      { model: User, as: 'uploader', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'approver', attributes: ['id', 'name', 'email'] },
    ],
  });

  if (!content) {
    const err = new Error('Content not found');
    err.status = 404;
    throw err;
  }

  return content;
};

const deleteContent = async (id, requestingUser) => {
  const content = await Content.findByPk(id);

  if (!content) {
    const err = new Error('Content not found');
    err.status = 404;
    throw err;
  }

  const isOwner = content.uploaded_by === requestingUser.id;
  const isPrincipal = requestingUser.role === 'PRINCIPAL';

  if (!isOwner && !isPrincipal) {
    const err = new Error('You are not authorized to delete this content');
    err.status = 403;
    throw err;
  }

  await ContentSchedule.destroy({ where: { content_id: id } });
  deleteUploadedFile(content.file_url);
  await content.destroy();
};

module.exports = {
  uploadContent,
  deleteUploadedFile,
  getTeacherContent,
  getAllContent,
  getContentById,
  deleteContent,
};
