const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const safeStringEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Authenticates an admin user using email + password (bcrypt hash or env password)
 * and returns a signed JWT token.
 */
const loginAdmin = async (email, password) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!safeStringEqual(normalizedEmail, env.admin.email)) {
    throw new ApiError(401, 'Invalid admin credentials');
  }

  let passwordValid = false;
  if (env.admin.passwordHash) {
    passwordValid = await bcrypt.compare(String(password || ''), env.admin.passwordHash);
  } else if (env.admin.password) {
    passwordValid = safeStringEqual(String(password || ''), env.admin.password);
  }

  if (!passwordValid) {
    throw new ApiError(401, 'Invalid admin credentials');
  }

  const token = jwt.sign(
    { role: 'admin', email: env.admin.email },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

  return {
    token,
    expiresIn: env.jwt.expiresIn,
    admin: {
      email: env.admin.email,
      role: 'admin',
    },
  };
};

/**
 * Verifies a Bearer JWT token.
 */
const verifyJwtToken = (token) => {
  try {
    return jwt.verify(token, env.jwt.secret);
  } catch {
    throw new ApiError(401, 'Invalid or expired authentication token');
  }
};

/**
 * Verifies an x-api-key header against configured ADMIN_API_KEY.
 */
const verifyApiKey = (apiKey) => {
  if (!env.admin.apiKey || !apiKey) return false;
  return safeStringEqual(apiKey, env.admin.apiKey);
};

module.exports = {
  loginAdmin,
  verifyJwtToken,
  verifyApiKey,
};
