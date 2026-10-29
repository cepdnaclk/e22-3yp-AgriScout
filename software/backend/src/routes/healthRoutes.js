const express = require('express');
const router = express.Router();
const { getConnectionStatus } = require('../config/db');

/**
 * @route   GET /api/health
 * @desc    System health check and database connectivity
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStatus = getConnectionStatus();

  const isHealthy = dbStatus.readyState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'greenhouse-robot-backend',
    version: '1.0.0',
    database: {
      connected: dbStatus.isConnected,
      state: dbStatus.readyState === 1 ? 'connected' : 'disconnected',
      host: dbStatus.host || 'unknown',
      name: dbStatus.name || 'unknown'
    }
  });
});

module.exports = router;
