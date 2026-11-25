const ApiError = require('../utils/ApiError');
const authService = require('../services/authService');

/**
 * Protects admin endpoints via either:
 * - Authorization: Bearer <JWT>
 * - x-api-key: <ADMIN_API_KEY>
 */
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const apiKey = req.headers['x-api-key'];

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const decoded = authService.verifyJwtToken(token);
    if (decoded.role !== 'admin') {
      return next(new ApiError(403, 'Forbidden: admin access required'));
    }
    req.admin = decoded;
    return next();
  }

  if (apiKey && authService.verifyApiKey(String(apiKey))) {
    req.admin = { role: 'admin', via: 'api-key' };
    return next();
  }

  return next(new ApiError(401, 'Authentication required'));
};

module.exports = { requireAdmin };
