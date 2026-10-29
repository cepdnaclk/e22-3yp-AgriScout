const express = require('express');
const router = express.Router();
const inspectionController = require('../controllers/inspectionController');
const { authenticateUser } = require('../middleware/auth');
const { authenticateRobotOrUser } = require('../middleware/robotAuth');
const { upload } = require('../middleware/upload');

// Ingestion endpoint (handles both Robot submissions and Operator uploads, multipart image support)
router.post(
  '/',
  authenticateRobotOrUser,
  upload.single('leafImage'),
  inspectionController.createInspection
);

// Read endpoints
router.get('/', authenticateUser, inspectionController.getAllInspections);
router.get('/:inspectionId', authenticateUser, inspectionController.getInspectionById);
router.get('/plant/:plantId', authenticateUser, inspectionController.getInspectionsByPlant);

module.exports = router;
