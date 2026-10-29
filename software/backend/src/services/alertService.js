const { v4: uuidv4 } = require('uuid');
const Alert = require('../models/Alert');
const Plant = require('../models/Plant');
const socketService = require('./socketService');
const logger = require('../utils/logger');

// Agricultural nutrient thresholds (in mg/kg)
const NUTRIENT_THRESHOLDS = {
  nitrogen: { minCritical: 50, minWarning: 80, maxWarning: 250 },
  phosphorus: { minCritical: 20, minWarning: 35, maxWarning: 120 },
  potassium: { minCritical: 80, minWarning: 120, maxWarning: 350 }
};

/**
 * Evaluate an inspection record for disease and nutrient conditions.
 * Creates alerts and updates the target Plant's health status.
 */
const evaluateInspection = async (inspection) => {
  try {
    const alertsToCreate = [];
    let calculatedHealth = 'healthy';

    // 1. Evaluate Disease Prediction
    const ai = inspection.aiPrediction;
    if (ai && ai.status === 'detected' && ai.disease && ai.disease.toLowerCase() !== 'healthy') {
      const severity = ai.confidence >= 0.85 ? 'critical' : 'warning';
      calculatedHealth = severity === 'critical' ? 'critical' : 'warning';

      alertsToCreate.push({
        alertId: `ALT-DIS-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`,
        greenhouseId: inspection.greenhouseId,
        plantId: inspection.plantId,
        inspectionId: inspection.inspectionId,
        alertType: 'disease_detected',
        severity,
        message: `Plant ${inspection.plantId}: Detected "${ai.disease}" with ${(ai.confidence * 100).toFixed(1)}% confidence.`
      });
    }

    // 2. Evaluate NPK Values (only if measured, distinguish from null/unavailable)
    const npk = inspection.npkValues;
    if (npk && npk.sensorStatus === 'measured') {
      // Nitrogen
      if (typeof npk.nitrogen === 'number') {
        if (npk.nitrogen < NUTRIENT_THRESHOLDS.nitrogen.minCritical) {
          calculatedHealth = 'critical';
          alertsToCreate.push({
            alertId: `ALT-NUT-N-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`,
            greenhouseId: inspection.greenhouseId,
            plantId: inspection.plantId,
            inspectionId: inspection.inspectionId,
            alertType: 'nutrient_deficiency',
            severity: 'critical',
            message: `Plant ${inspection.plantId}: Critical Nitrogen deficiency (${npk.nitrogen} mg/kg < ${NUTRIENT_THRESHOLDS.nitrogen.minCritical} mg/kg).`
          });
        } else if (npk.nitrogen < NUTRIENT_THRESHOLDS.nitrogen.minWarning) {
          if (calculatedHealth !== 'critical') calculatedHealth = 'warning';
          alertsToCreate.push({
            alertId: `ALT-NUT-N-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`,
            greenhouseId: inspection.greenhouseId,
            plantId: inspection.plantId,
            inspectionId: inspection.inspectionId,
            alertType: 'nutrient_deficiency',
            severity: 'warning',
            message: `Plant ${inspection.plantId}: Low Nitrogen level (${npk.nitrogen} mg/kg).`
          });
        }
      }

      // Phosphorus
      if (typeof npk.phosphorus === 'number') {
        if (npk.phosphorus < NUTRIENT_THRESHOLDS.phosphorus.minCritical) {
          calculatedHealth = 'critical';
          alertsToCreate.push({
            alertId: `ALT-NUT-P-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`,
            greenhouseId: inspection.greenhouseId,
            plantId: inspection.plantId,
            inspectionId: inspection.inspectionId,
            alertType: 'nutrient_deficiency',
            severity: 'critical',
            message: `Plant ${inspection.plantId}: Critical Phosphorus deficiency (${npk.phosphorus} mg/kg).`
          });
        } else if (npk.phosphorus < NUTRIENT_THRESHOLDS.phosphorus.minWarning) {
          if (calculatedHealth !== 'critical') calculatedHealth = 'warning';
          alertsToCreate.push({
            alertId: `ALT-NUT-P-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`,
            greenhouseId: inspection.greenhouseId,
            plantId: inspection.plantId,
            inspectionId: inspection.inspectionId,
            alertType: 'nutrient_deficiency',
            severity: 'warning',
            message: `Plant ${inspection.plantId}: Low Phosphorus level (${npk.phosphorus} mg/kg).`
          });
        }
      }

      // Potassium
      if (typeof npk.potassium === 'number') {
        if (npk.potassium < NUTRIENT_THRESHOLDS.potassium.minCritical) {
          calculatedHealth = 'critical';
          alertsToCreate.push({
            alertId: `ALT-NUT-K-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`,
            greenhouseId: inspection.greenhouseId,
            plantId: inspection.plantId,
            inspectionId: inspection.inspectionId,
            alertType: 'nutrient_deficiency',
            severity: 'critical',
            message: `Plant ${inspection.plantId}: Critical Potassium deficiency (${npk.potassium} mg/kg).`
          });
        } else if (npk.potassium < NUTRIENT_THRESHOLDS.potassium.minWarning) {
          if (calculatedHealth !== 'critical') calculatedHealth = 'warning';
          alertsToCreate.push({
            alertId: `ALT-NUT-K-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`,
            greenhouseId: inspection.greenhouseId,
            plantId: inspection.plantId,
            inspectionId: inspection.inspectionId,
            alertType: 'nutrient_deficiency',
            severity: 'warning',
            message: `Plant ${inspection.plantId}: Low Potassium level (${npk.potassium} mg/kg).`
          });
        }
      }
    }

    // Save alerts and broadcast via Socket.IO
    for (const alertData of alertsToCreate) {
      const createdAlert = await Alert.create(alertData);
      socketService.emitAlertCreated(createdAlert);
      logger.info(`Alert generated: ${createdAlert.alertId} - ${createdAlert.message}`);
    }

    // Update the Plant entity
    await Plant.findOneAndUpdate(
      { plantId: inspection.plantId },
      {
        healthStatus: calculatedHealth,
        lastInspectedAt: inspection.timestamp || new Date()
      }
    );

    return {
      alertsGenerated: alertsToCreate.length,
      updatedHealthStatus: calculatedHealth
    };
  } catch (error) {
    logger.error(`Error in evaluateInspection: ${error.message}`);
    return { alertsGenerated: 0, error: error.message };
  }
};

module.exports = {
  evaluateInspection,
  NUTRIENT_THRESHOLDS
};
