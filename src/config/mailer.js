const nodemailer = require('nodemailer');
const env = require('./env');
const logger = require('../utils/logger');

let cachedTransporter = null;
let cachedMode = null;

/**
 * Checks whether explicit SMTP credentials are configured.
 */
const isSmtpConfigured = () =>
  Boolean(env.email.host && env.email.user && env.email.pass);

/**
 * Returns a configured Nodemailer transporter.
 * Priority:
 * 1. Explicit SMTP credentials from .env
 * 2. Ethereal test account in non-production (with JSON transport fallback if offline)
 * 3. JSON transport fallback in test environment
 */
const getTransporter = async () => {
  if (cachedTransporter) {
    return { transporter: cachedTransporter, mode: cachedMode };
  }

  if (env.isTest) {
    cachedTransporter = nodemailer.createTransport({ jsonTransport: true });
    cachedMode = 'json-test';
    return { transporter: cachedTransporter, mode: cachedMode };
  }

  if (isSmtpConfigured()) {
    cachedTransporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.secure,
      auth: {
        user: env.email.user,
        pass: env.email.pass,
      },
    });
    cachedMode = 'smtp';
    return { transporter: cachedTransporter, mode: cachedMode };
  }

  if (!env.isProd) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      cachedTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      cachedMode = 'ethereal';
      logger.info('Initialized Ethereal dev email transporter', { user: testAccount.user });
      return { transporter: cachedTransporter, mode: cachedMode };
    } catch (err) {
      logger.warn('Ethereal unavailable; falling back to JSON email transport', {
        reason: err.message,
      });
    }
  }

  cachedTransporter = nodemailer.createTransport({ jsonTransport: true });
  cachedMode = 'json-fallback';
  return { transporter: cachedTransporter, mode: cachedMode };
};

const resetTransporterCache = () => {
  cachedTransporter = null;
  cachedMode = null;
};

module.exports = {
  getTransporter,
  isSmtpConfigured,
  resetTransporterCache,
};
