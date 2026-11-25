const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Checks express-validator results and throws a 400 ApiError with field-level details.
 */
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array({ onlyFirstError: true }).map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  return next(new ApiError(400, errors[0]?.message || 'Validation failed', errors));
};

module.exports = validate;
