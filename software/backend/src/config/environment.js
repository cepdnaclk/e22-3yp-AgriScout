const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/greenhouse_robot',
  jwtSecret: process.env.JWT_SECRET || 'fallback_development_secret_not_for_prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  robotApiKeySecret: process.env.ROBOT_API_KEY_SECRET || 'robot_default_dev_secret',
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173')
    .split(',')
    .map(origin => origin.trim()),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  robotOfflineThresholdSec: parseInt(process.env.ROBOT_OFFLINE_THRESHOLD_SEC || '60', 10),
  robotSweepIntervalSec: parseInt(process.env.ROBOT_SWEEP_INTERVAL_SEC || '30', 10),
};

module.exports = config;
