const express = require('express');
const router = express.Router();
const plantController = require('../controllers/plantController');
const { authenticateUser, authorize } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', plantController.getAllPlants);
router.post('/', authorize('admin', 'operator'), plantController.createPlant);
router.get('/:plantId', plantController.getPlantById);
router.patch('/:plantId', authorize('admin', 'operator'), plantController.updatePlant);
router.get('/:plantId/history', plantController.getPlantHistory);

module.exports = router;
