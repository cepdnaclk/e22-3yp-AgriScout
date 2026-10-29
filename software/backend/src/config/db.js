const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('./environment');

let isConnected = false;

/**
 * Connect to MongoDB with retry logic and event listeners
 */
const connectDB = async (uri = config.mongoUri) => {
  if (isConnected) {
    logger.info('Using existing database connection');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connections[0].readyState === 1;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    if (config.env === 'development' && (uri.includes('127.0.0.1') || uri.includes('localhost'))) {
      try {
        logger.info('Local MongoDB service not found. Initializing built-in in-memory MongoDB for local development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        const conn = await mongoose.connect(memUri);
        isConnected = conn.connections[0].readyState === 1;
        logger.info(`In-memory MongoDB started successfully at ${memUri}`);
        const seed = require('../utils/seedData');
        await seed(false);
        return;
      } catch (memErr) {
        logger.error(`Failed to start in-memory MongoDB: ${memErr.message}`);
      }
    }

    if (config.env !== 'test') {
      logger.warn('Retrying database connection in 5 seconds...');
      setTimeout(() => connectDB(uri), 5000);
    } else {
      throw error;
    }
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('MongoDB connection lost. Waiting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  logger.info('MongoDB reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB error: ${err.message}`);
});

/**
 * Disconnect from MongoDB (useful for tests and graceful shutdown)
 */
const disconnectDB = async () => {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected cleanly');
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  mongoose,
  getConnectionStatus: () => {
    const isConn = mongoose.connection.readyState === 1;
    return {
      isConnected: isConn,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  }
};
