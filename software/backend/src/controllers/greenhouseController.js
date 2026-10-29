const Greenhouse = require('../models/Greenhouse');
const Plant = require('../models/Plant');
const Alert = require('../models/Alert');

/**
 * List all greenhouses with plant counts and active alert counts
 */
const getAllGreenhouses = async (req, res, next) => {
  try {
    const greenhouses = await Greenhouse.find().sort({ createdAt: -1 });

    // Enrich with plant and alert statistics
    const enriched = await Promise.all(
      greenhouses.map(async (gh) => {
        const plantCount = await Plant.countDocuments({ greenhouseId: gh.greenhouseId });
        const activeAlertCount = await Alert.countDocuments({
          greenhouseId: gh.greenhouseId,
          acknowledged: false
        });
        return {
          ...gh.toJSON(),
          plantCount,
          activeAlertCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new greenhouse
 */
const createGreenhouse = async (req, res, next) => {
  try {
    const { greenhouseId, name, location, description, status } = req.body;

    if (!greenhouseId || !name) {
      return res.status(400).json({
        success: false,
        error: 'greenhouseId and name are required'
      });
    }

    const existing = await Greenhouse.findOne({ greenhouseId: greenhouseId.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Greenhouse with ID '${greenhouseId}' already exists.`
      });
    }

    const greenhouse = await Greenhouse.create({
      greenhouseId: greenhouseId.toUpperCase(),
      name,
      location,
      description,
      status: status || 'active'
    });

    res.status(201).json({
      success: true,
      data: greenhouse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single greenhouse by ID
 */
const getGreenhouseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: id }, { greenhouseId: id.toUpperCase() }] }
      : { greenhouseId: id.toUpperCase() };

    const greenhouse = await Greenhouse.findOne(query);
    if (!greenhouse) {
      return res.status(404).json({
        success: false,
        error: `Greenhouse '${id}' not found.`
      });
    }

    const plantCount = await Plant.countDocuments({ greenhouseId: greenhouse.greenhouseId });
    const activeAlerts = await Alert.find({
      greenhouseId: greenhouse.greenhouseId,
      acknowledged: false
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...greenhouse.toJSON(),
        plantCount,
        activeAlertCount: activeAlerts.length,
        activeAlerts
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update greenhouse
 */
const updateGreenhouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: id }, { greenhouseId: id.toUpperCase() }] }
      : { greenhouseId: id.toUpperCase() };

    const greenhouse = await Greenhouse.findOneAndUpdate(query, updates, {
      new: true,
      runValidators: true
    });

    if (!greenhouse) {
      return res.status(404).json({
        success: false,
        error: `Greenhouse '${id}' not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: greenhouse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete greenhouse
 */
const deleteGreenhouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: id }, { greenhouseId: id.toUpperCase() }] }
      : { greenhouseId: id.toUpperCase() };

    const greenhouse = await Greenhouse.findOneAndDelete(query);
    if (!greenhouse) {
      return res.status(404).json({
        success: false,
        error: `Greenhouse '${id}' not found.`
      });
    }

    // Also delete or unlink related plants
    await Plant.deleteMany({ greenhouseId: greenhouse.greenhouseId });

    res.status(200).json({
      success: true,
      message: `Greenhouse '${greenhouse.greenhouseId}' and associated plants removed.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllGreenhouses,
  createGreenhouse,
  getGreenhouseById,
  updateGreenhouse,
  deleteGreenhouse
};
