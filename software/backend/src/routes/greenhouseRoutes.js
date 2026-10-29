const express = require('express');
const router = express.Router();
const greenhouseController = require('../controllers/greenhouseController');
const { authenticateUser, authorize } = require('../middleware/auth');

// All greenhouse routes require authentication
router.use(authenticateUser);

router.get('/', greenhouseController.getAllGreenhouses);
router.post('/', authorize('admin', 'operator'), greenhouseController.createGreenhouse);
router.get('/:id', greenhouseController.getGreenhouseById);
router.patch('/:id', authorize('admin', 'operator'), greenhouseController.updateGreenhouse);
router.delete('/:id', authorize('admin'), greenhouseController.deleteGreenhouse);

module.exports = router;
