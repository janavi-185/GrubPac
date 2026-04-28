const Content = require('../models/Content');
const User = require('../models/User');

const getPendingContent = async ({ page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await Content.findAndCountAll({
    where: { status: 'PENDING' },
    include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }],
    order: [['created_at', 'ASC']],
    limit: Number(limit),
    offset,
  });

  return { rows, total: count };
};

const reviewContent = async (id, principalId, { action, rejection_reason }) => {
  const content = await Content.findByPk(id);

  if (!content) {
    const err = new Error('Content not found');
    err.status = 404;
    throw err;
  }

  if (content.status !== 'PENDING') {
    const err = new Error(`Content has already been reviewed. Current status: ${content.status}`);
    err.status = 400;
    throw err;
  }

  if (action === 'approve') {
    content.status = 'APPROVED';
    content.approved_by = principalId;
    content.approved_at = new Date();
    content.rejection_reason = null;
  } else {
    content.status = 'REJECTED';
    content.rejection_reason = rejection_reason;
  }

  await content.save();
  return content;
};

module.exports = { getPendingContent, reviewContent };
