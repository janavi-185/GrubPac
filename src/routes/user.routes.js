const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { successResponse, errorResponse } = require('../utils/response');

router.get('/teachers', protect, authorize('PRINCIPAL'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const { count, rows } = await User.findAndCountAll({
      where: { role: 'TEACHER' },
      attributes: ['id', 'name', 'email', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
    });
    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        perPage: Number(limit),
      },
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

router.get('/:id', protect, authorize('PRINCIPAL'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'role', 'created_at'],
    });
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, user);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
