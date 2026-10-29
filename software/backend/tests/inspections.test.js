const request = require('supertest');
const app = require('../src/app');
const Inspection = require('../src/models/Inspection');
const Alert = require('../src/models/Alert');
const Plant = require('../src/models/Plant');
const Robot = require('../src/models/Robot');
const bcrypt = require('bcryptjs');
require('./setup');

describe('Inspection Ingestion & Idempotency', () => {
  let authToken;
  const robotId = 'ROB-ALPHA';
  const robotApiKey = 'test_robot_secret_123';

  beforeEach(async () => {
    // Create admin user for token
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin Test',
        email: 'admintest@example.com',
        password: 'Password123!'
      });
    authToken = userRes.body.token;

    // Register Robot
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(robotApiKey, salt);
    await Robot.create({
      robotId,
      name: 'Rover Test',
      greenhouseId: 'GH-01',
      apiKeyHash: hash,
      connectionStatus: 'online'
    });

    // Create target plant
    await Plant.create({
      plantId: 'PLANT-ALPHA-1',
      greenhouseId: 'GH-01',
      species: 'Tomato',
      rowNumber: 1,
      positionNumber: 1,
      healthStatus: 'healthy'
    });
  });

  it('should accept inspection from authenticated robot', async () => {
    const inspectionPayload = {
      inspectionId: 'INSP-UNIQUE-001',
      robotId,
      greenhouseId: 'GH-01',
      plantId: 'PLANT-ALPHA-1',
      timestamp: new Date().toISOString(),
      npkValues: {
        nitrogen: 120,
        phosphorus: 45,
        potassium: 180,
        sensorStatus: 'measured'
      },
      aiPrediction: {
        disease: 'Healthy',
        confidence: 0.95,
        status: 'detected'
      }
    };

    const res = await request(app)
      .post('/api/inspections')
      .set('X-Robot-Id', robotId)
      .set('X-Robot-Key', robotApiKey)
      .send(inspectionPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.isDuplicate).toBe(false);
    expect(res.body.data.inspectionId).toBe('INSP-UNIQUE-001');

    const inDb = await Inspection.findOne({ inspectionId: 'INSP-UNIQUE-001' });
    expect(inDb).not.toBeNull();
  });

  it('should handle duplicate uploads IDEMPOTENTLY without creating duplicates', async () => {
    const payload = {
      inspectionId: 'INSP-IDEMPOTENT-001',
      robotId,
      greenhouseId: 'GH-01',
      plantId: 'PLANT-ALPHA-1',
      npkValues: { nitrogen: 110, phosphorus: 40, potassium: 150, sensorStatus: 'measured' }
    };

    // First submission
    const res1 = await request(app)
      .post('/api/inspections')
      .set('X-Robot-Id', robotId)
      .set('X-Robot-Key', robotApiKey)
      .send(payload);

    expect(res1.statusCode).toBe(201);
    expect(res1.body.isDuplicate).toBe(false);

    // Duplicate submission (e.g. after network retry)
    const res2 = await request(app)
      .post('/api/inspections')
      .set('X-Robot-Id', robotId)
      .set('X-Robot-Key', robotApiKey)
      .send(payload);

    expect(res2.statusCode).toBe(200);
    expect(res2.body.isDuplicate).toBe(true);

    const count = await Inspection.countDocuments({ inspectionId: 'INSP-IDEMPOTENT-001' });
    expect(count).toBe(1);
  });

  it('should auto-create Alert and update Plant health on disease detection', async () => {
    const payload = {
      inspectionId: 'INSP-DISEASE-001',
      robotId,
      greenhouseId: 'GH-01',
      plantId: 'PLANT-ALPHA-1',
      npkValues: { nitrogen: 100, phosphorus: 50, potassium: 150, sensorStatus: 'measured' },
      aiPrediction: {
        disease: 'Tomato Late Blight',
        confidence: 0.92,
        status: 'detected'
      }
    };

    const res = await request(app)
      .post('/api/inspections')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    expect(res.statusCode).toBe(201);

    // Verify alert created
    const alert = await Alert.findOne({ inspectionId: 'INSP-DISEASE-001' });
    expect(alert).not.toBeNull();
    expect(alert.alertType).toBe('disease_detected');
    expect(alert.severity).toBe('critical');

    // Verify plant health status updated
    const plant = await Plant.findOne({ plantId: 'PLANT-ALPHA-1' });
    expect(plant.healthStatus).toBe('critical');
  });

  it('should auto-create Alert on critical Nitrogen deficiency', async () => {
    const payload = {
      inspectionId: 'INSP-LOW-NITROGEN-001',
      robotId,
      greenhouseId: 'GH-01',
      plantId: 'PLANT-ALPHA-1',
      npkValues: {
        nitrogen: 35, // Below critical threshold of 50
        phosphorus: 60,
        potassium: 150,
        sensorStatus: 'measured'
      }
    };

    await request(app)
      .post('/api/inspections')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    const alert = await Alert.findOne({
      inspectionId: 'INSP-LOW-NITROGEN-001',
      alertType: 'nutrient_deficiency'
    });

    expect(alert).not.toBeNull();
    expect(alert.severity).toBe('critical');
  });
});
