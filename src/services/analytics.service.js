const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const Content = require('../models/Content');
const ContentView = require('../models/ContentView');
const User = require('../models/User');

const getSubjectAnalytics = async () => {
  const viewStats = await ContentView.findAll({
    attributes: [
      'subject',
      [sequelize.fn('COUNT', sequelize.col('id')), 'total_views'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('content_id'))), 'unique_content_viewed'],
    ],
    group: ['subject'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    raw: true,
  });

  const contentStats = await Content.findAll({
    attributes: [
      'subject',
      [sequelize.fn('COUNT', sequelize.col('id')), 'total_approved'],
    ],
    where: { status: 'APPROVED' },
    group: ['subject'],
    raw: true,
  });

  const subjectMap = {};

  contentStats.forEach(row => {
    subjectMap[row.subject] = {
      subject: row.subject,
      total_approved_content: Number(row.total_approved),
      total_views: 0,
      unique_content_viewed: 0,
    };
  });

  viewStats.forEach(row => {
    if (!subjectMap[row.subject]) {
      subjectMap[row.subject] = {
        subject: row.subject,
        total_approved_content: 0,
        total_views: 0,
        unique_content_viewed: 0,
      };
    }
    subjectMap[row.subject].total_views = Number(row.total_views);
    subjectMap[row.subject].unique_content_viewed = Number(row.unique_content_viewed);
  });

  return Object.values(subjectMap).sort((a, b) => b.total_views - a.total_views);
};

const getContentUsage = async ({ page = 1, limit = 10, subject, teacher_id, status } = {}) => {
  const where = {};
  if (subject) where.subject = subject.toLowerCase();
  if (teacher_id) where.uploaded_by = teacher_id;
  if (status) where.status = status.toUpperCase();

  const offset = (Number(page) - 1) * Number(limit);

  const rows = await Content.findAll({
    attributes: [
      'id',
      'title',
      'subject',
      'status',
      'uploaded_by',
      [sequelize.fn('COUNT', sequelize.col('views.id')), 'view_count'],
    ],
    include: [
      {
        model: ContentView,
        as: 'views',
        attributes: [],
        required: false,
      },

      {
        model: User,
        as: 'uploader',
        attributes: ['name'],
      },
    ],
    where,
    group: ['Content.id', 'uploader.id'],
    order: [[sequelize.fn('COUNT', sequelize.col('views.id')), 'DESC']],
    limit: Number(limit),
    offset,
    subQuery: false,

  });
  const total = await Content.count({ where });

  return {
    rows: rows.map(r => ({
      id: r.id,
      title: r.title,
      subject: r.subject,
      status: r.status,
      uploaded_by: r.uploaded_by,
      teacher_name: r.uploader?.name || null,
      view_count: Number(r.dataValues.view_count),
    })),
    total,
  };
};

module.exports = { getSubjectAnalytics, getContentUsage };
