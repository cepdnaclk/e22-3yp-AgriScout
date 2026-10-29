const Inspection = require('../models/Inspection');
const Plant = require('../models/Plant');
const socketService = require('../services/socketService');
const alertService = require('../services/alertService');
const logger = require('../utils/logger');

/**
 * Submit an inspection record (from Robot or authorized user)
 * Implements IDEMPOTENCY: If inspectionId already exists, returns existing record with 200 OK.
 */
const createInspection = async (req, res, next) => {
  try {
    let bodyData = req.body;

    // If incoming request is multipart/form-data, parse nested JSON objects if serialized
    if (typeof bodyData.npkValues === 'string') {
      try { bodyData.npkValues = JSON.parse(bodyData.npkValues); } catch (e) {}
    }
    if (typeof bodyData.aiPrediction === 'string') {
      try { bodyData.aiPrediction = JSON.parse(bodyData.aiPrediction); } catch (e) {}
    }
    if (typeof bodyData.uploadMetadata === 'string') {
      try { bodyData.uploadMetadata = JSON.parse(bodyData.uploadMetadata); } catch (e) {}
    }

    const {
      inspectionId,
      robotId,
      greenhouseId,
      plantId,
      timestamp,
      npkValues,
      soilTemperature,
      soilMoisture,
      aiPrediction,
      inspectionStatus,
      uploadMetadata
    } = bodyData;

    if (!inspectionId || !robotId || !greenhouseId || !plantId) {
      return res.status(400).json({
        success: false,
        error: 'inspectionId, robotId, greenhouseId, and plantId are required fields.'
      });
    }

    // IDEMPOTENCY CHECK: Prevent duplicate MongoDB records
    const existing = await Inspection.findOne({ inspectionId });
    if (existing) {
      logger.info(`Idempotent request received: Inspection ${inspectionId} already exists. Returning existing.`);
      return res.status(200).json({
        success: true,
        message: 'Inspection record already processed (idempotent response)',
        isDuplicate: true,
        data: existing
      });
    }

    // Verify plant exists or create record if needed
    let plant = await Plant.findOne({ plantId: plantId.toUpperCase() });
    if (!plant) {
      // Auto-register plant stub if first inspection
      plant = await Plant.create({
        plantId: plantId.toUpperCase(),
        greenhouseId: greenhouseId.toUpperCase(),
        rowNumber: 1,
        positionNumber: 1,
        healthStatus: 'unknown'
      });
      logger.info(`Auto-registered plant record for '${plantId}' in greenhouse '${greenhouseId}'`);
    }

    // If image file was uploaded via Multer
    let leafImageUrl = bodyData.leafImageUrl || null;
    if (req.file) {
      leafImageUrl = `/uploads/${req.file.filename}`;
    }

    // Sanitize and structure NPK values
    // Ensure missing values are explicitly recorded as null, not converted to 0
    const parsedNpk = {
      nitrogen: npkValues && typeof npkValues.nitrogen === 'number' ? npkValues.nitrogen : null,
      phosphorus: npkValues && typeof npkValues.phosphorus === 'number' ? npkValues.phosphorus : null,
      potassium: npkValues && typeof npkValues.potassium === 'number' ? npkValues.potassium : null,
      unit: npkValues?.unit || 'mg/kg',
      sensorStatus: npkValues?.sensorStatus || (npkValues && (npkValues.nitrogen !== null || npkValues.phosphorus !== null) ? 'measured' : 'unavailable')
    };

    // Sanitize AI Prediction
    const parsedAi = {
      disease: aiPrediction?.disease || 'Unknown',
      confidence: typeof aiPrediction?.confidence === 'number' ? aiPrediction.confidence : 0,
      modelVersion: aiPrediction?.modelVersion || 'none',
      status: aiPrediction?.status || 'not_configured',
      rawProbabilities: aiPrediction?.rawProbabilities || {}
    };

    const newInspection = await Inspection.create({
      inspectionId,
      robotId: robotId.toUpperCase(),
      greenhouseId: greenhouseId.toUpperCase(),
      plantId: plantId.toUpperCase(),
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      npkValues: parsedNpk,
      soilTemperature: soilTemperature !== undefined && soilTemperature !== null ? Number(soilTemperature) : null,
      soilMoisture: soilMoisture !== undefined && soilMoisture !== null ? Number(soilMoisture) : null,
      leafImageUrl,
      aiPrediction: parsedAi,
      inspectionStatus: inspectionStatus || 'completed',
      uploadMetadata: {
        uploadedAt: new Date(),
        clientTimestamp: uploadMetadata?.clientTimestamp ? new Date(uploadMetadata.clientTimestamp) : null,
        isOfflineQueued: uploadMetadata?.isOfflineQueued === true || uploadMetadata?.isOfflineQueued === 'true',
        retryCount: uploadMetadata?.retryCount ? parseInt(uploadMetadata.retryCount, 10) : 0
      }
    });

    // Run automated threshold checks, generate alerts, update Plant health
    const evaluation = await alertService.evaluateInspection(newInspection);

    // Emit Socket.IO event for real-time dashboard and mobile updates
    socketService.emitInspectionCompleted(newInspection);

    logger.info(`Inspection ${inspectionId} stored successfully for Plant ${plantId}. Alerts: ${evaluation.alertsGenerated}`);

    res.status(201).json({
      success: true,
      message: 'Inspection recorded successfully',
      isDuplicate: false,
      data: newInspection,
      evaluation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List inspections with filtering & pagination
 */
const getAllInspections = async (req, res, next) => {
  try {
    const {
      greenhouseId,
      plantId,
      robotId,
      disease,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};

    if (greenhouseId) filter.greenhouseId = greenhouseId.toUpperCase();
    if (plantId) filter.plantId = plantId.toUpperCase();
    if (robotId) filter.robotId = robotId.toUpperCase();

    if (disease) {
      filter['aiPrediction.disease'] = { $regex: disease, $options: 'i' };
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Inspection.countDocuments(filter);
    const inspections = await Inspection.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: inspections.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: inspections
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get inspection by inspectionId
 */
const getInspectionById = async (req, res, next) => {
  try {
    const { inspectionId } = req.params;
    const inspection = await Inspection.findOne({ inspectionId });

    if (!inspection) {
      return res.status(404).json({
        success: false,
        error: `Inspection '${inspectionId}' not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: inspection
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all inspections for a specific plant
 */
const getInspectionsByPlant = async (req, res, next) => {
  try {
    const { plantId } = req.params;
    const { limit = 30 } = req.query;

    const inspections = await Inspection.find({ plantId: plantId.toUpperCase() })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: inspections.length,
      data: inspections
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInspection,
  getAllInspections,
  getInspectionById,
  getInspectionsByPlant
};
