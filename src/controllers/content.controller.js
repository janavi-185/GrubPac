const Content = require('../models/Content');
const User = require('../models/User');

// --- Teacher Flow ---

const uploadContent = async (req, res) => {
  try {
    const { title, subject, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const content = await Content.create({
      title,
      description,
      subject,
      file_url: req.file.path,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      uploaded_by: req.user.id,
      status: 'PENDING'
    });

    res.status(201).json({
      message: 'Content uploaded successfully and is pending approval',
      content
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeacherContent = async (req, res) => {
  try {
    const content = await Content.findAll({
      where: { uploaded_by: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Principal Flow ---

const getAllContent = async (req, res) => {
  try {
    const content = await Content.findAll({
      include: [{ model: User, as: 'uploader', attributes: ['name', 'email'] }],
      order: [['created_at', 'DESC']]
    });
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPendingContent = async (req, res) => {
  try {
    const content = await Content.findAll({
      where: { status: 'PENDING' },
      include: [{ model: User, as: 'uploader', attributes: ['name', 'email'] }],
      order: [['created_at', 'ASC']]
    });
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findByPk(id);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    content.status = 'APPROVED';
    content.approved_by = req.user.id;
    content.approved_at = new Date();
    content.rejection_reason = null;
    await content.save();

    res.status(200).json({ message: 'Content approved successfully', content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const content = await Content.findByPk(id);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    content.status = 'REJECTED';
    content.rejection_reason = reason;
    await content.save();

    res.status(200).json({ message: 'Content rejected', content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  uploadContent,
  getTeacherContent,
  getAllContent,
  getPendingContent,
  approveContent,
  rejectContent,
};