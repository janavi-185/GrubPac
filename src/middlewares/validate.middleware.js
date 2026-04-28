const { errorResponse } = require('../utils/response');

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return errorResponse(res, 'name, email, and password are required', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return errorResponse(res, 'Please provide a valid email address', 400);
  }

  if (password.length < 6) {
    return errorResponse(res, 'Password must be at least 6 characters long', 400);
  }

  const allowedRoles = ['TEACHER', 'PRINCIPAL'];
  if (role && !allowedRoles.includes(role.toUpperCase())) {
    return errorResponse(res, `Role must be one of: ${allowedRoles.join(', ')}`, 400);
  }

  next();
};


const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 'email and password are required', 400);
  }

  next();
};

const validateUpload = (req, res, next) => {
  const { title, subject } = req.body;

  if (!title || !subject) {
    return errorResponse(res, 'title and subject are required', 400);
  }

  if (title.trim().length < 3) {
    return errorResponse(res, 'Title must be at least 3 characters long', 400);
  }

  if (req.body.subject) {
    req.body.subject = req.body.subject.toLowerCase().trim();
  }

  next();
};

const validateReview = (req, res, next) => {
  const { action, rejection_reason } = req.body;

  const allowedActions = ['approve', 'reject'];
  if (!action || !allowedActions.includes(action.toLowerCase())) {
    return errorResponse(res, `action must be one of: ${allowedActions.join(', ')}`, 400);
  }

  if (action.toLowerCase() === 'reject' && !rejection_reason) {
    return errorResponse(res, 'rejection_reason is required when action is "reject"', 400);
  }

  req.body.action = action.toLowerCase();

  next();
};

module.exports = { validateRegister, validateLogin, validateUpload, validateReview };
