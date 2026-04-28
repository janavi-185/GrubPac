const { Op } = require('sequelize');
const Content = require('../models/Content');
const ContentSchedule = require('../models/ContentSchedule');
const User = require('../models/User');

const getActiveContentForTeacher = async (teacherId, subjectFilter) => {
  const now = new Date();
  const where = {
    uploaded_by: teacherId,
    status: 'APPROVED',
    start_time: { [Op.lte]: now },
    end_time: { [Op.gte]: now },
  };
  if (subjectFilter) where.subject = subjectFilter.toLowerCase();

  return Content.findAll({
    where,
    include: [{ model: ContentSchedule, attributes: ['rotation_order', 'duration'] }],
    order: [['subject', 'ASC']],
  });
};

const computeActiveItem = (items) => {
  if (!items.length) return null;

  const epoch = items.reduce((min, item) => {
    const t = new Date(item.start_time).getTime();
    return t < min ? t : min;
  }, new Date(items[0].start_time).getTime());

  const totalCycleMs = items.reduce((sum, item) => sum + item.durationMs, 0);
  const positionInCycle = (Date.now() - epoch) % totalCycleMs;

  let accumulated = 0;
  for (const item of items) {
    if (positionInCycle < accumulated + item.durationMs) {
      const timeRemainingMs = accumulated + item.durationMs - positionInCycle;
      return {
        content: item.data,
        time_remaining_seconds: Math.floor(timeRemainingMs / 1000),
        active_until: new Date(Date.now() + timeRemainingMs).toISOString(),
        total_items_in_rotation: items.length,
      };
    }
    accumulated += item.durationMs;
  }
  return null;
};

const getLiveContent = async (teacherId, subjectFilter) => {
  const activeItems = await getActiveContentForTeacher(teacherId, subjectFilter);

  if (!activeItems.length) {
    return { available: false, message: 'No content available' };
  }

  const bySubject = {};
  for (const item of activeItems) {
    const key = item.subject;
    if (!bySubject[key]) bySubject[key] = [];

    const schedule = item.ContentSchedules?.[0];
    bySubject[key].push({
      data: item.toJSON(),
      rotation_order: schedule?.rotation_order ?? 1,
      durationMs: (schedule?.duration ?? 5) * 60 * 1000,
    });
  }

  const result = {};
  for (const [subject, items] of Object.entries(bySubject)) {
    const sorted = items.sort((a, b) => a.rotation_order - b.rotation_order);
    result[subject] = computeActiveItem(sorted);
  }

  return { available: true, subjects: result };
};

const getAllActiveTeachers = async () => {
  const now = new Date();
  const activeContent = await Content.findAll({
    where: {
      status: 'APPROVED',
      start_time: { [Op.lte]: now },
      end_time: { [Op.gte]: now },
    },
    attributes: ['uploaded_by'],
    group: ['uploaded_by', 'uploader.id', 'uploader.name', 'uploader.email'],
    include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }],
  });

  return activeContent.map((c) => c.uploader);
};

module.exports = { getLiveContent, getAllActiveTeachers };
