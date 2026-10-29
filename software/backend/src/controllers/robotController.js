const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Robot = require('../models/Robot');
const socketService = require('../services/socketService');
const logger = require('../utils/logger');

/**
 * Robot heartbeat ping
 * Called periodically by the Raspberry Pi
 */
const heartbeat = async (req, res, next) => {
  try {
    const { robotId, batteryLevel, status, currentPlantId } = req.body;
    const targetId = (robotId || req.robot?.robotId || '').toUpperCase();

    if (!targetId) {
      return res.status(400).json({
        success: false,
        error: 'robotId is required'
      });
    }

    const wasOffline = req.robot ? req.robot.connectionStatus === 'offline' : true;

    const updates = {
      lastSeenAt: new Date(),
      connectionStatus: status || 'online'
    };
    if (typeof batteryLevel === 'number') updates.batteryLevel = batteryLevel;
    if (currentPlantId) updates.currentPlantId = currentPlantId.toUpperCase();

    const robot = await Robot.findOneAndUpdate(
      { robotId: targetId },
      { $set: updates },
      { new: true, upsert: false }
    );

    if (!robot) {
      return res.status(404).json({
        success: false,
        error: `Robot '${targetId}' is not registered.`
      });
    }

    // Broadcast status change
    socketService.emitRobotStatus(robot);
    if (wasOffline) {
      socketService.emitRobotOnline(robot);
      logger.info(`Robot ${robot.robotId} came back online.`);
    }

    res.status(200).json({
      success: true,
      message: 'Heartbeat acknowledged',
      serverTime: new Date(),
      data: {
        robotId: robot.robotId,
        connectionStatus: robot.connectionStatus,
        lastSeenAt: robot.lastSeenAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Detailed robot status report (errors, state changes)
 */
const updateStatus = async (req, res, next) => {
  try {
    const { robotId, connectionStatus, batteryLevel, currentPlantId, errorStatus, lastInspectionTime } = req.body;
    const targetId = (robotId || req.robot?.robotId || '').toUpperCase();

    if (!targetId) {
      return res.status(400).json({
        success: false,
        error: 'robotId is required'
      });
    }

    const updates = {
      lastSeenAt: new Date()
    };

    if (connectionStatus) updates.connectionStatus = connectionStatus;
    if (typeof batteryLevel === 'number') updates.batteryLevel = batteryLevel;
    if (currentPlantId) updates.currentPlantId = currentPlantId.toUpperCase();
    if (lastInspectionTime) updates.lastInspectionTime = new Date(lastInspectionTime);

    if (errorStatus) {
      updates.errorStatus = {
        hasError: Boolean(errorStatus.hasError),
        errorMessage: errorStatus.errorMessage || '',
        errorDetails: errorStatus.errorDetails || {},
        reportedAt: new Date()
      };
    }

    const robot = await Robot.findOneAndUpdate(
      { robotId: targetId },
      { $set: updates },
      { new: true }
    );

    if (!robot) {
      return res.status(404).json({
        success: false,
        error: `Robot '${targetId}' not found.`
      });
    }

    socketService.emitRobotStatus(robot);

    res.status(200).json({
      success: true,
      data: robot
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all robots
 */
const getAllRobots = async (req, res, next) => {
  try {
    const robots = await Robot.find().sort({ robotId: 1 });
    res.status(200).json({
      success: true,
      count: robots.length,
      data: robots
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get robot details
 */
const getRobotById = async (req, res, next) => {
  try {
    const { robotId } = req.params;
    const robot = await Robot.findOne({ robotId: robotId.toUpperCase() });

    if (!robot) {
      return res.status(404).json({
        success: false,
        error: `Robot '${robotId}' not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: robot
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register a new robot (Admin only)
 * Returns the raw API key once so it can be configured in the Raspberry Pi robot
 */
const registerRobot = async (req, res, next) => {
  try {
    const { robotId, name, greenhouseId } = req.body;

    if (!robotId || !greenhouseId) {
      return res.status(400).json({
        success: false,
        error: 'robotId and greenhouseId are required'
      });
    }

    const existing = await Robot.findOne({ robotId: robotId.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Robot '${robotId}' already registered.`
      });
    }

    // Generate secure API key
    const rawApiKey = `ghr_${uuidv4().replace(/-/g, '')}`;
    const salt = await bcrypt.genSalt(10);
    const apiKeyHash = await bcrypt.hash(rawApiKey, salt);

    const robot = await Robot.create({
      robotId: robotId.toUpperCase(),
      name: name || `Greenhouse Robot ${robotId.toUpperCase()}`,
      greenhouseId: greenhouseId.toUpperCase(),
      apiKeyHash,
      connectionStatus: 'offline'
    });

    res.status(201).json({
      success: true,
      message: 'Robot registered successfully. Store the apiKey safely; it will not be displayed again.',
      apiKey: rawApiKey,
      data: robot
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  heartbeat,
  updateStatus,
  getAllRobots,
  getRobotById,
  registerRobot
};
