const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const logger = require('../utils/logger');

const notFoundHandler = (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next(new ApiError(404, `API endpoint not found: ${req.method} ${req.originalUrl}`));
  }
  return next(new ApiError(404, 'Resource not found'));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyPattern || {});
    message = `Duplicate value for ${fields.join(', ') || 'unique field'}`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = details[0]?.message || 'Validation failed';
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path || 'identifier'}`;
  }

  if (statusCode >= 500) {
    logger.error('Unhandled server error', {
      statusCode,
      message: err.message,
      path: req.originalUrl,
    });
  }

  const payload = {
    success: false,
    message,
  };

  if (details) {
    payload.errors = details;
  }

  if (!env.isProd && err.stack && statusCode >= 500) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
