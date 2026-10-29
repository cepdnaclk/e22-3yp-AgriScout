const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./config/environment');
const { connectDB, disconnectDB } = require('./config/db');
const { initSocket } = require('./services/socketService');
const { startRobotMonitor, stopRobotMonitor } = require('./services/robotMonitorService');
const logger = require('./utils/logger');

const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize socket service
initSocket(io);

// Server startup sequence
const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start Robot Offline Sweeper
    startRobotMonitor();

    // 3. Listen on designated port
    server.listen(config.port, () => {
      logger.info(`=======================================================`);
      logger.info(`  GREENHOUSE MONITORING ROBOT API SERVER RUNNING`);
      logger.info(`  Port:    ${config.port}`);
      logger.info(`  Env:     ${config.env}`);
      logger.info(`  Health:  http://localhost:${config.port}/api/health`);
      logger.info(`=======================================================`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  stopRobotMonitor();

  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await disconnectDB();
      logger.info('Database connection closed cleanly.');
      process.exit(0);
    } catch (err) {
      logger.error(`Error during DB disconnect: ${err.message}`);
      process.exit(1);
    }
  });

  // Force close after 10s if stuck
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcefully terminating.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

if (require.main === module) {
  startServer();
}

module.exports = { server, app };
