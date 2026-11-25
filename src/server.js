const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const logger = require('./utils/logger');

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = http.createServer(app);
    server.listen(env.port, () => {
      logger.info(`Server running on http://localhost:${env.port}`, {
        env: env.nodeEnv,
      });
    });
  } catch (err) {
    logger.error('Failed to start server', { message: err.message });
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  logger.info(`Received ${signal}. Closing server gracefully...`);
  if (server) {
    server.close(async () => {
      await disconnectDB();
      logger.info('Shutdown complete');
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
