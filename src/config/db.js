const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

let isListenersAttached = false;

const attachConnectionListeners = () => {
  if (isListenersAttached) return;
  isListenersAttached = true;

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { message: err.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
};

const connectDB = async (uri = env.mongoUri) => {
  attachConnectionListeners();
  mongoose.set('strictQuery', true);
  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

module.exports = { connectDB, disconnectDB };
