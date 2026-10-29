const bcrypt = require('bcryptjs');
const Robot = require('../models/Robot');
const config = require('../config/environment');

/**
 * Authenticate robot using X-Robot-Id and X-Robot-Key headers
 */
const authenticateRobot = async (req, res, next) => {
  const robotId = req.headers['x-robot-id'] || req.headers['x-robot-identifier'];
  const apiKey = req.headers['x-robot-key'] || req.headers['x-robot-api-key'];

  if (!robotId || !apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Robot authentication failed: Missing X-Robot-Id or X-Robot-Key headers.'
    });
  }

  try {
    const robot = await Robot.findOne({ robotId: robotId.toUpperCase() });

    if (!robot) {
      return res.status(401).json({
        success: false,
        error: `Robot with ID '${robotId}' is not registered.`
      });
    }

    const isMatch = await bcrypt.compare(apiKey, robot.apiKeyHash);
    if (!isMatch) {
      // Also check fallback server secret if configured for initial setup
      if (apiKey === config.robotApiKeySecret) {
        req.robot = robot;
        return next();
      }

      return res.status(401).json({
        success: false,
        error: 'Robot authentication failed: Invalid API key.'
      });
    }

    req.robot = robot;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Robot authentication internal error: ${error.message}`
    });
  }
};

/**
 * Permissive authentication allowing either a valid Robot credential
 * OR an authenticated human User (admin / operator)
 */
const authenticateRobotOrUser = async (req, res, next) => {
  const robotId = req.headers['x-robot-id'] || req.headers['x-robot-identifier'];
  const apiKey = req.headers['x-robot-key'] || req.headers['x-robot-api-key'];

  if (robotId && apiKey) {
    return authenticateRobot(req, res, next);
  }

  // Fallback to User JWT auth
  const { authenticateUser } = require('./auth');
  return authenticateUser(req, res, next);
};

module.exports = {
  authenticateRobot,
  authenticateRobotOrUser
};
