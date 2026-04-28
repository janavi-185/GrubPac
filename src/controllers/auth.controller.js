const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    return successResponse(res, user, 'User registered successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    return successResponse(res, result, 'Login successful');
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

const getMe = async (req, res) => {
  return successResponse(res, req.user, 'User profile fetched');
};

module.exports = { register, login, getMe };
