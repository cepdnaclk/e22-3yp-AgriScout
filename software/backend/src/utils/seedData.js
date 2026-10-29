const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Greenhouse = require('../models/Greenhouse');
const Plant = require('../models/Plant');
const Robot = require('../models/Robot');
const Inspection = require('../models/Inspection');
const Alert = require('../models/Alert');
const logger = require('./logger');

const seed = async (disconnect = true) => {
  logger.info('--- Starting Greenhouse Database Seeding (Demo Data) ---');

  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  // Clean collections
  await Promise.all([
    User.deleteMany({}),
    Greenhouse.deleteMany({}),
    Plant.deleteMany({}),
    Robot.deleteMany({}),
    Inspection.deleteMany({}),
    Alert.deleteMany({})
  ]);

  logger.info('Purged existing test records.');

  // 1. Create Users
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('AdminPass123!', salt);
  const operatorHash = await bcrypt.hash('OperatorPass123!', salt);
  const viewerHash = await bcrypt.hash('ViewerPass123!', salt);

  const [adminUser, operatorUser] = await User.create([
    {
      name: 'Dr. Sarah Connor (Admin)',
      email: 'admin@greenhouse.local',
      passwordHash: adminHash,
      role: 'admin'
    },
    {
      name: 'John Doe (Agronomist)',
      email: 'operator@greenhouse.local',
      passwordHash: operatorHash,
      role: 'operator'
    },
    {
      name: 'Field Observer (Viewer)',
      email: 'viewer@greenhouse.local',
      passwordHash: viewerHash,
      role: 'viewer'
    }
  ]);

  logger.info('Users created: admin@greenhouse.local, operator@greenhouse.local, viewer@greenhouse.local (Password: AdminPass123! / OperatorPass123!)');

  // 2. Create Greenhouses
  const [gh1, gh2] = await Greenhouse.create([
    {
      greenhouseId: 'GH-NORTH-01',
      name: 'North Greenhouse Alpha (Tomatoes & Peppers)',
      location: 'Section A - North Wing',
      description: 'Controlled environment greenhouse with automated drip irrigation.',
      status: 'active'
    },
    {
      greenhouseId: 'GH-SOUTH-02',
      name: 'South Greenhouse Beta (Cucumber & Herbs)',
      location: 'Section B - South Wing',
      description: 'Secondary greenhouse facility for hydroponics and testing.',
      status: 'active'
    }
  ]);

  logger.info('Greenhouses created: GH-NORTH-01, GH-SOUTH-02');

  // 3. Create Plants for GH-NORTH-01
  const plantsData = [
    { plantId: 'PLANT-N1-R01-P01', greenhouseId: 'GH-NORTH-01', species: 'Solanum lycopersicum (Beefsteak Tomato)', rowNumber: 1, positionNumber: 1, healthStatus: 'healthy', notes: 'Demo Data: High vigor' },
    { plantId: 'PLANT-N1-R01-P02', greenhouseId: 'GH-NORTH-01', species: 'Solanum lycopersicum (Beefsteak Tomato)', rowNumber: 1, positionNumber: 2, healthStatus: 'warning', notes: 'Demo Data: Slight nitrogen chlorosis' },
    { plantId: 'PLANT-N1-R01-P03', greenhouseId: 'GH-NORTH-01', species: 'Solanum lycopersicum (Beefsteak Tomato)', rowNumber: 1, positionNumber: 3, healthStatus: 'critical', notes: 'Demo Data: Early blight symptoms detected' },
    { plantId: 'PLANT-N1-R01-P04', greenhouseId: 'GH-NORTH-01', species: 'Solanum lycopersicum (Cherry Tomato)', rowNumber: 1, positionNumber: 4, healthStatus: 'healthy', notes: 'Demo Data: Normal canopy' },
    { plantId: 'PLANT-N1-R02-P01', greenhouseId: 'GH-NORTH-01', species: 'Solanum lycopersicum (Roma Tomato)', rowNumber: 2, positionNumber: 1, healthStatus: 'healthy', notes: 'Demo Data: Flowering stage' },
    { plantId: 'PLANT-N1-R02-P02', greenhouseId: 'GH-NORTH-01', species: 'Capsicum annuum (Bell Pepper)', rowNumber: 2, positionNumber: 2, healthStatus: 'healthy', notes: 'Demo Data: Optimal growth' },
    { plantId: 'PLANT-S2-R01-P01', greenhouseId: 'GH-SOUTH-02', species: 'Cucumis sativus (Cucumber)', rowNumber: 1, positionNumber: 1, healthStatus: 'healthy', notes: 'Demo Data: Vegetative phase' },
    { plantId: 'PLANT-S2-R01-P02', greenhouseId: 'GH-SOUTH-02', species: 'Ocimum basilicum (Sweet Basil)', rowNumber: 1, positionNumber: 2, healthStatus: 'healthy', notes: 'Demo Data: Hydroponic table' }
  ];

  await Plant.create(plantsData);
  logger.info(`Plants created: ${plantsData.length} plants`);

  // 4. Create Robot
  const robotApiKey = 'ghr_secret_alpha_key_2026';
  const robotApiKeyHash = await bcrypt.hash(robotApiKey, salt);

  await Robot.create({
    robotId: 'ROBOT-ALPHA-01',
    name: 'Autonomous Scout Rover #1 (Pi 5)',
    greenhouseId: 'GH-NORTH-01',
    apiKeyHash: robotApiKeyHash,
    connectionStatus: 'online',
    batteryLevel: 94,
    currentPlantId: 'PLANT-N1-R01-P03',
    lastSeenAt: new Date(),
    lastInspectionTime: new Date(Date.now() - 5 * 60 * 1000)
  });

  logger.info(`Robot created: ROBOT-ALPHA-01 with API Key: "${robotApiKey}"`);

  // 5. Create Sample Historical Inspections (Demo Data)
  const now = Date.now();
  const pastHours = (h) => new Date(now - h * 3600 * 1000);

  const inspectionsData = [
    {
      inspectionId: 'INSP-DEMO-001',
      robotId: 'ROBOT-ALPHA-01',
      greenhouseId: 'GH-NORTH-01',
      plantId: 'PLANT-N1-R01-P01',
      timestamp: pastHours(6),
      npkValues: { nitrogen: 145, phosphorus: 52, potassium: 180, unit: 'mg/kg', sensorStatus: 'measured' },
      soilTemperature: 22.4,
      soilMoisture: 68.2,
      leafImageUrl: null,
      aiPrediction: { disease: 'Healthy', confidence: 0.96, modelVersion: 'mobilenetv2-plant-v1.0', status: 'detected' },
      inspectionStatus: 'completed'
    },
    {
      inspectionId: 'INSP-DEMO-002',
      robotId: 'ROBOT-ALPHA-01',
      greenhouseId: 'GH-NORTH-01',
      plantId: 'PLANT-N1-R01-P02',
      timestamp: pastHours(4),
      npkValues: { nitrogen: 68, phosphorus: 45, potassium: 160, unit: 'mg/kg', sensorStatus: 'measured' },
      soilTemperature: 23.1,
      soilMoisture: 55.4,
      leafImageUrl: null,
      aiPrediction: { disease: 'Healthy', confidence: 0.88, modelVersion: 'mobilenetv2-plant-v1.0', status: 'detected' },
      inspectionStatus: 'completed'
    },
    {
      inspectionId: 'INSP-DEMO-003',
      robotId: 'ROBOT-ALPHA-01',
      greenhouseId: 'GH-NORTH-01',
      plantId: 'PLANT-N1-R01-P03',
      timestamp: pastHours(1),
      npkValues: { nitrogen: 110, phosphorus: 40, potassium: 140, unit: 'mg/kg', sensorStatus: 'measured' },
      soilTemperature: 22.8,
      soilMoisture: 62.0,
      leafImageUrl: null,
      aiPrediction: { disease: 'Tomato Early Blight', confidence: 0.91, modelVersion: 'mobilenetv2-plant-v1.0', status: 'detected' },
      inspectionStatus: 'flagged'
    }
  ];

  await Inspection.create(inspectionsData);
  logger.info(`Inspections created: ${inspectionsData.length} records`);

  // 6. Create Sample Alerts
  await Alert.create([
    {
      alertId: 'ALT-DEMO-001',
      greenhouseId: 'GH-NORTH-01',
      plantId: 'PLANT-N1-R01-P03',
      inspectionId: 'INSP-DEMO-003',
      alertType: 'disease_detected',
      severity: 'critical',
      message: 'Plant PLANT-N1-R01-P03: Detected "Tomato Early Blight" with 91.0% confidence.',
      acknowledged: false
    },
    {
      alertId: 'ALT-DEMO-002',
      greenhouseId: 'GH-NORTH-01',
      plantId: 'PLANT-N1-R01-P02',
      inspectionId: 'INSP-DEMO-002',
      alertType: 'nutrient_deficiency',
      severity: 'warning',
      message: 'Plant PLANT-N1-R01-P02: Low Nitrogen level (68 mg/kg < 80 mg/kg threshold).',
      acknowledged: false
    }
  ]);

  logger.info('Demo Alerts created: 2 active alerts');
  logger.info('--- Seeding Completed Successfully ---');

  if (disconnect) {
    await disconnectDB();
  }
};

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(`Seed error: ${err.message}`);
      process.exit(1);
    });
}

module.exports = seed;
