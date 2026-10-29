const logger = require('../utils/logger');

let io = null;

const initSocket = (socketIoInstance) => {
  io = socketIoInstance;

  io.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id} from ${socket.handshake.address}`);

    // Allow clients to subscribe to specific greenhouse rooms if needed
    socket.on('join:greenhouse', (greenhouseId) => {
      if (greenhouseId) {
        socket.join(`greenhouse_${greenhouseId}`);
        logger.debug(`Socket ${socket.id} joined room greenhouse_${greenhouseId}`);
      }
    });

    socket.on('leave:greenhouse', (greenhouseId) => {
      if (greenhouseId) {
        socket.leave(`greenhouse_${greenhouseId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket client disconnected: ${socket.id} (${reason})`);
    });
  });
};

const getIO = () => io;

/**
 * Emit inspection:completed event
 * Emits compact payload with only essential data
 */
const emitInspectionCompleted = (inspection) => {
  if (!io) return;
  const payload = {
    inspectionId: inspection.inspectionId,
    greenhouseId: inspection.greenhouseId,
    plantId: inspection.plantId,
    robotId: inspection.robotId,
    timestamp: inspection.timestamp,
    npkValues: inspection.npkValues,
    aiPrediction: {
      disease: inspection.aiPrediction?.disease,
      confidence: inspection.aiPrediction?.confidence,
      status: inspection.aiPrediction?.status
    },
    inspectionStatus: inspection.inspectionStatus,
    leafImageUrl: inspection.leafImageUrl
  };

  io.emit('inspection:completed', payload);
  if (inspection.greenhouseId) {
    io.to(`greenhouse_${inspection.greenhouseId}`).emit('greenhouse:inspection', payload);
  }
};

/**
 * Emit alert:created event
 */
const emitAlertCreated = (alert) => {
  if (!io) return;
  const payload = {
    alertId: alert.alertId,
    greenhouseId: alert.greenhouseId,
    plantId: alert.plantId,
    inspectionId: alert.inspectionId,
    alertType: alert.alertType,
    severity: alert.severity,
    message: alert.message,
    createdAt: alert.createdAt
  };

  io.emit('alert:created', payload);
  if (alert.greenhouseId) {
    io.to(`greenhouse_${alert.greenhouseId}`).emit('greenhouse:alert', payload);
  }
};

/**
 * Emit robot:status event
 */
const emitRobotStatus = (robot) => {
  if (!io) return;
  const payload = {
    robotId: robot.robotId,
    greenhouseId: robot.greenhouseId,
    connectionStatus: robot.connectionStatus,
    batteryLevel: robot.batteryLevel,
    currentPlantId: robot.currentPlantId,
    lastSeenAt: robot.lastSeenAt,
    lastInspectionTime: robot.lastInspectionTime,
    errorStatus: robot.errorStatus
  };

  io.emit('robot:status', payload);
};

/**
 * Emit robot:offline event
 */
const emitRobotOffline = (robotId, reason = 'Heartbeat timeout') => {
  if (!io) return;
  io.emit('robot:offline', {
    robotId,
    connectionStatus: 'offline',
    reason,
    timestamp: new Date()
  });
};

/**
 * Emit robot:online event
 */
const emitRobotOnline = (robot) => {
  if (!io) return;
  io.emit('robot:online', {
    robotId: robot.robotId,
    greenhouseId: robot.greenhouseId,
    connectionStatus: 'online',
    timestamp: new Date()
  });
};

module.exports = {
  initSocket,
  getIO,
  emitInspectionCompleted,
  emitAlertCreated,
  emitRobotStatus,
  emitRobotOffline,
  emitRobotOnline
};
