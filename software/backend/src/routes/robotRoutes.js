const express = require('express');
const router = express.Router();
const robotController = require('../controllers/robotController');
const { authenticateUser, authorize } = require('../middleware/auth');
const { authenticateRobot } = require('../middleware/robotAuth');

// Robot client endpoints (protected by Robot API Key)
router.post('/heartbeat', authenticateRobot, robotController.heartbeat);
router.post('/status', authenticateRobot, robotController.updateStatus);

// Management endpoints (protected by user JWT)
router.get('/', authenticateUser, robotController.getAllRobots);
router.get('/:robotId', authenticateUser, robotController.getRobotById);
router.post('/register', authenticateUser, authorize('admin'), robotController.registerRobot);

module.exports = router;
