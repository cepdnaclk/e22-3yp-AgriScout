const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { authenticateUser, authorize } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', alertController.getAllAlerts);
router.patch('/:id/acknowledge', authorize('admin', 'operator'), alertController.acknowledgeAlert);

module.exports = router;
