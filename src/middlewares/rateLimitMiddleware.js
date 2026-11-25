const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max: env.isTest ? 1000 : max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

const apiLimiter = createLimiter(
  15 * 60 * 1000,
  200,
  'Too many requests from this IP, please try again later.'
);

const contactLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Too many contact submissions. Please wait 15 minutes before trying again.'
);

const authLimiter = createLimiter(
  15 * 60 * 1000,
  20,
  'Too many login attempts. Please try again later.'
);

module.exports = {
  apiLimiter,
  contactLimiter,
  authLimiter,
};
