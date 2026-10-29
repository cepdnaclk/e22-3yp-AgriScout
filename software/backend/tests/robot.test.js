const request = require('supertest');
const app = require('../src/app');
const Robot = require('../src/models/Robot');
const bcrypt = require('bcryptjs');
require('./setup');

describe('Robot Telemetry & Heartbeat API', () => {
  let authToken;
  const robotId = 'ROB-DELTA-01';
  const robotApiKey = 'super_secret_robot_key_999';

  beforeEach(async () => {
    // User auth token
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Supervisor',
        email: 'supervisor@example.com',
        password: 'Password123!'
      });
    authToken = userRes.body.token;

    // Register Robot
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(robotApiKey, salt);
    await Robot.create({
      robotId,
      name: 'Rover Delta',
      greenhouseId: 'GH-01',
      apiKeyHash: hash,
      connectionStatus: 'offline',
      batteryLevel: 50
    });
  });

  it('should process heartbeat with valid credentials and mark online', async () => {
    const res = await request(app)
      .post('/api/robot/heartbeat')
      .set('X-Robot-Id', robotId)
      .set('X-Robot-Key', robotApiKey)
      .send({
        batteryLevel: 88,
        status: 'online',
        currentPlantId: 'PLANT-01'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const robot = await Robot.findOne({ robotId });
    expect(robot.batteryLevel).toBe(88);
    expect(robot.connectionStatus).toBe('online');
    expect(robot.currentPlantId).toBe('PLANT-01');
    expect(robot.lastSeenAt).not.toBeNull();
  });

  it('should reject heartbeat with invalid API key', async () => {
    const res = await request(app)
      .post('/api/robot/heartbeat')
      .set('X-Robot-Id', robotId)
      .set('X-Robot-Key', 'wrong_robot_key')
      .send({ batteryLevel: 80 });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject heartbeat without authentication headers', async () => {
    const res = await request(app)
      .post('/api/robot/heartbeat')
      .send({ batteryLevel: 80 });

    expect(res.statusCode).toBe(401);
  });

  it('should allow authenticated users to list all robots', async () => {
    const res = await request(app)
      .get('/api/robots')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].robotId).toBe(robotId);
  });
});
