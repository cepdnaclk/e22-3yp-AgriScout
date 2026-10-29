const Robot = require('../models/Robot');
const Alert = require('../models/Alert');
const socketService = require('./socketService');
const logger = require('../utils/logger');
const config = require('../config/environment');
const { v4: uuidv4 } = require('uuid');

let intervalId = null;

/**
 * Scan for robots that haven't sent a heartbeat within the threshold
 */
const checkOfflineRobots = async () => {
  try {
    const thresholdDate = new Date(Date.now() - config.robotOfflineThresholdSec * 1000);

    const timedOutRobots = await Robot.find({
      lastSeenAt: { $lt: thresholdDate },
      connectionStatus: { $ne: 'offline' }
    });

    for (const robot of timedOutRobots) {
      robot.connectionStatus = 'offline';
      await robot.save();

      logger.warn(`Robot ${robot.robotId} timed out. Marked offline.`);
      socketService.emitRobotOffline(robot.robotId, 'Heartbeat timeout');

      // Create an alert for robot going offline
      const alert = await Alert.create({
        alertId: `ALT-ROB-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`,
        greenhouseId: robot.greenhouseId,
        alertType: 'robot_offline',
        severity: 'warning',
        message: `Robot "${robot.name}" (${robot.robotId}) is offline. No heartbeat received in past ${config.robotOfflineThresholdSec}s.`
      });

      socketService.emitAlertCreated(alert);
    }
  } catch (error) {
    logger.error(`Error checking offline robots: ${error.message}`);
  }
};

const startRobotMonitor = () => {
  if (intervalId) return;
  const intervalMs = config.robotSweepIntervalSec * 1000;
  intervalId = setInterval(checkOfflineRobots, intervalMs);
  logger.info(`Robot offline monitor started (every ${config.robotSweepIntervalSec}s, timeout ${config.robotOfflineThresholdSec}s)`);
};

const stopRobotMonitor = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info('Robot offline monitor stopped');
  }
};

module.exports = {
  startRobotMonitor,
  stopRobotMonitor,
  checkOfflineRobots
};
