const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const parseOrigins = (value) => {
  if (!value) return ['http://localhost:5000'];
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const getEnv = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = Number.parseInt(process.env.PORT || '5000', 10);

  const config = {
    nodeEnv,
    isProd: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
    port: Number.isNaN(port) ? 5000 : port,
    appName: process.env.APP_NAME || 'DevPortfolio',
    clientOrigins: parseOrigins(process.env.CLIENT_ORIGIN),
    mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio_db',
    admin: {
      email: (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase(),
      password: process.env.ADMIN_PASSWORD || '',
      passwordHash: process.env.ADMIN_PASSWORD_HASH || '',
      apiKey: process.env.ADMIN_API_KEY || '',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'dev-only-jwt-secret-change-me',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    email: {
      host: process.env.SMTP_HOST || '',
      port: Number.parseInt(process.env.SMTP_PORT || '587', 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.EMAIL_FROM || 'Portfolio Contact <no-reply@example.com>',
      receiver: process.env.CONTACT_RECEIVER_EMAIL || process.env.ADMIN_EMAIL || 'owner@example.com',
    },
  };

  if (config.isProd) {
    const missing = [];
    if (!process.env.MONGO_URI) missing.push('MONGO_URI');
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
      missing.push('JWT_SECRET (min 16 chars)');
    }
    if (!config.admin.password && !config.admin.passwordHash) {
      missing.push('ADMIN_PASSWORD or ADMIN_PASSWORD_HASH');
    }
    if (missing.length > 0) {
      throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
    }
  }

  return Object.freeze(config);
};

module.exports = getEnv();
