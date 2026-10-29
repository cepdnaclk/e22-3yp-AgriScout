const mongoose = require('mongoose');
const Greenhouse = require('../src/models/Greenhouse');
const Plant = require('../src/models/Plant');
const Inspection = require('../src/models/Inspection');
const Robot = require('../src/models/Robot');
const Alert = require('../src/models/Alert');
require('./setup');

describe('MongoDB Model Validations', () => {
  describe('Greenhouse Model', () => {
    it('should fail validation if greenhouseId is missing', async () => {
      const gh = new Greenhouse({ name: 'Alpha' });
      await expect(gh.validate()).rejects.toThrow(/Greenhouse ID is required/);
    });

    it('should fail validation on invalid status enum', async () => {
      const gh = new Greenhouse({ greenhouseId: 'GH-01', name: 'Alpha', status: 'broken_status' });
      await expect(gh.validate()).rejects.toThrow(/not a valid greenhouse status/);
    });
  });

  describe('Plant Model', () => {
    it('should reject duplicate position in the same greenhouse', async () => {
      await Plant.create({
        plantId: 'PLANT-1',
        greenhouseId: 'GH-01',
        species: 'Tomato',
        rowNumber: 1,
        positionNumber: 1
      });

      await expect(
        Plant.create({
          plantId: 'PLANT-2',
          greenhouseId: 'GH-01',
          species: 'Pepper',
          rowNumber: 1,
          positionNumber: 1
        })
      ).rejects.toThrow();
    });
  });

  describe('Inspection Model', () => {
    it('should distinguish null NPK sensor readings from 0', async () => {
      const insp = await Inspection.create({
        inspectionId: 'INSP-TEST-001',
        robotId: 'ROB-01',
        greenhouseId: 'GH-01',
        plantId: 'PLANT-1',
        npkValues: {
          nitrogen: null,
          phosphorus: 0,
          potassium: null,
          sensorStatus: 'unavailable'
        }
      });

      expect(insp.npkValues.nitrogen).toBeNull();
      expect(insp.npkValues.phosphorus).toBe(0);
      expect(insp.npkValues.potassium).toBeNull();
      expect(insp.npkValues.sensorStatus).toBe('unavailable');
    });

    it('should reject negative nutrient values', async () => {
      const insp = new Inspection({
        inspectionId: 'INSP-NEG',
        robotId: 'ROB-01',
        greenhouseId: 'GH-01',
        plantId: 'PLANT-1',
        npkValues: { nitrogen: -10 }
      });

      await expect(insp.validate()).rejects.toThrow(/cannot be negative/);
    });
  });

  describe('Robot Model', () => {
    it('should reject battery level exceeding 100', async () => {
      const robot = new Robot({
        robotId: 'ROB-01',
        apiKeyHash: 'hash123',
        greenhouseId: 'GH-01',
        batteryLevel: 105
      });

      await expect(robot.validate()).rejects.toThrow(/cannot exceed 100%/);
    });
  });

  describe('Alert Model', () => {
    it('should require valid alertType and severity', async () => {
      const alert = new Alert({
        alertId: 'ALT-1',
        greenhouseId: 'GH-01',
        alertType: 'invalid_type',
        severity: 'ultra_critical',
        message: 'Test'
      });

      await expect(alert.validate()).rejects.toThrow();
    });
  });
});
