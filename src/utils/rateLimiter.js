const rateLimit = require('express-rate-limit');

const broadcastLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again after a minute.' },
});

module.exports = { broadcastLimiter };
