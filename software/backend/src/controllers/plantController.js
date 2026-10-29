const Plant = require('../models/Plant');
const Inspection = require('../models/Inspection');
const Alert = require('../models/Alert');

/**
 * Get all plants with filtering, search, and pagination
 */
const getAllPlants = async (req, res, next) => {
  try {
    const { greenhouseId, healthStatus, search, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (greenhouseId) filter.greenhouseId = greenhouseId.toUpperCase();
    if (healthStatus) filter.healthStatus = healthStatus;
    if (search) {
      filter.$or = [
        { plantId: { $regex: search, $options: 'i' } },
        { species: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Plant.countDocuments(filter);
    const plants = await Plant.find(filter)
      .sort({ greenhouseId: 1, rowNumber: 1, positionNumber: 1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: plants.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: plants
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new plant
 */
const createPlant = async (req, res, next) => {
  try {
    const { plantId, greenhouseId, species, rowNumber, positionNumber, healthStatus, notes } = req.body;

    if (!plantId || !greenhouseId || rowNumber === undefined || positionNumber === undefined) {
      return res.status(400).json({
        success: false,
        error: 'plantId, greenhouseId, rowNumber, and positionNumber are required.'
      });
    }

    const existingId = await Plant.findOne({ plantId: plantId.toUpperCase() });
    if (existingId) {
      return res.status(409).json({
        success: false,
        error: `Plant with ID '${plantId}' already exists.`
      });
    }

    const existingPosition = await Plant.findOne({
      greenhouseId: greenhouseId.toUpperCase(),
      rowNumber,
      positionNumber
    });
    if (existingPosition) {
      return res.status(409).json({
        success: false,
        error: `A plant already exists at Greenhouse '${greenhouseId}', Row ${rowNumber}, Position ${positionNumber}.`
      });
    }

    const plant = await Plant.create({
      plantId: plantId.toUpperCase(),
      greenhouseId: greenhouseId.toUpperCase(),
      species: species || 'Solanum lycopersicum (Tomato)',
      rowNumber: parseInt(rowNumber, 10),
      positionNumber: parseInt(positionNumber, 10),
      healthStatus: healthStatus || 'unknown',
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      data: plant
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single plant by plantId
 */
const getPlantById = async (req, res, next) => {
  try {
    const { plantId } = req.params;
    const plant = await Plant.findOne({ plantId: plantId.toUpperCase() });

    if (!plant) {
      return res.status(404).json({
        success: false,
        error: `Plant '${plantId}' not found.`
      });
    }

    // Fetch latest inspection
    const latestInspection = await Inspection.findOne({ plantId: plant.plantId })
      .sort({ timestamp: -1 });

    // Fetch active alerts for this plant
    const activeAlerts = await Alert.find({
      plantId: plant.plantId,
      acknowledged: false
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...plant.toJSON(),
        latestInspection,
        activeAlerts
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update plant
 */
const updatePlant = async (req, res, next) => {
  try {
    const { plantId } = req.params;
    const updates = req.body;

    const plant = await Plant.findOneAndUpdate(
      { plantId: plantId.toUpperCase() },
      updates,
      { new: true, runValidators: true }
    );

    if (!plant) {
      return res.status(404).json({
        success: false,
        error: `Plant '${plantId}' not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: plant
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get plant inspection history with NPK trends and AI predictions
 */
const getPlantHistory = async (req, res, next) => {
  try {
    const { plantId } = req.params;
    const { limit = 50 } = req.query;

    const plant = await Plant.findOne({ plantId: plantId.toUpperCase() });
    if (!plant) {
      return res.status(404).json({
        success: false,
        error: `Plant '${plantId}' not found.`
      });
    }

    const inspections = await Inspection.find({ plantId: plant.plantId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10));

    // Calculate NPK trends (chronological order for charts)
    const chronological = [...inspections].reverse();
    const npkTimeline = chronological.map((insp) => ({
      timestamp: insp.timestamp,
      nitrogen: insp.npkValues?.nitrogen,
      phosphorus: insp.npkValues?.phosphorus,
      potassium: insp.npkValues?.potassium,
      soilTemperature: insp.soilTemperature,
      soilMoisture: insp.soilMoisture,
      disease: insp.aiPrediction?.disease,
      confidence: insp.aiPrediction?.confidence
    }));

    res.status(200).json({
      success: true,
      plantId: plant.plantId,
      count: inspections.length,
      inspections,
      npkTimeline
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPlants,
  createPlant,
  getPlantById,
  updatePlant,
  getPlantHistory
};
