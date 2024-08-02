
const { expect } = require('chai');
const nock = require('nock');
const { parseScanData, determineTarget, findAvailableIonCannon, fireIonCannon } = require('../services/attackService.js');

describe('Attack service', () => {
  describe('parseScanData', () => {
    it('should correctly parse scan data', () => {
      const input = {
        protocols: ['closest-enemies'],
        scan: [
          { coordinates: { x: 10, y: 20 }, enemies: 10, allies: 5 },
          { coordinates: { x: 5, y: 5 }, enemies: 1 },
        ],
      };
      const expected = {
        protocols: ['closest-enemies'],
        parsedScan: [
          { x: 10, y: 20, enemies: 10, allies: 5 },
          { x: 5, y: 5, enemies: 1, allies: 0 },
        ],
      };
  
      const result = parseScanData(input);
      expect(result).to.deep.equal(expected);
    });
  });
  
  describe('determineTarget', () => {
    it('should return the closest enemy target', () => {
      const parsedScan = [
        { x: 10, y: 20, enemies: 10, allies: 5 },
        { x: 5, y: 5, enemies: 1, allies: 0 },
      ];
      const protocols = ['closest-enemies'];
      const expected = { x: 5, y: 5, enemies: 1, allies: 0 };
  
      const result = determineTarget(parsedScan, protocols);
      expect(result).to.deep.equal(expected);
    });
  
    // Additional test cases for other protocols
    it('should return the furthest enemy target', () => {
      const parsedScan = [
        { x: 10, y: 20, enemies: 10, allies: 5 },
        { x: 5, y: 5, enemies: 1, allies: 0 },
      ];
      const protocols = ['furthest-enemies'];
      const expected = { x: 10, y: 20, enemies: 10, allies: 5 };
  
      const result = determineTarget(parsedScan, protocols);
      expect(result).to.deep.equal(expected);
    });
  
    it('should return the target with the most allies', () => {
      const parsedScan = [
        { x: 10, y: 20, enemies: 10, allies: 5 },
        { x: 5, y: 5, enemies: 1, allies: 10 },
      ];
      const protocols = ['assist-allies'];
      const expected = { x: 5, y: 5, enemies: 1, allies: 10 };
  
      const result = determineTarget(parsedScan, protocols);
      expect(result).to.deep.equal(expected);
    });
  });
  
  describe('findAvailableIonCannon', () => {
    afterEach(() => {
      nock.cleanAll();
    });
  
    it('should return the ID of the available ion cannon', async () => {
      nock('http://localhost:3000')
        .get('/api/cannons')
        .reply(200, [{ id: 1, available: true, fire_time: 5 }]);
  
      const cannonId = await findAvailableIonCannon();
      expect(cannonId).to.equal(1);
    });
  
    it('should return an error if no cannons are available', async () => {
      nock('http://localhost:3000')
        .get('/api/cannons')
        .reply(200, [{ id: 1, available: false, fire_time: 5 }]);
  
      try {
        await findAvailableIonCannon();
      } catch (error) {
        expect(error.message).to.equal('No ion cannons available');
      }
    });
  
    it('should return an error if the request fails', async () => {
      nock('http://localhost:3000')
        .get('/api/cannons')
        .reply(500);
  
      try {
        await findAvailableIonCannon();
      } catch (error) {
        expect(error.message).to.equal('Request failed with status code 500');
      }
    });
  });
  
  describe('fireIonCannon', () => {
    afterEach(() => {
      nock.cleanAll();
    });
  
    it('should fire the ion cannon and return the result', async () => {
      const target = { x: 5, y: 5 };
      const cannonId = 1;
  
      nock('http://localhost:3000')
        .post(`/api/cannons/${cannonId}/fire`)
        .reply(200, { casualties: 5, generation: 1 });
  
      nock('http://localhost:3000')
        .get('/api/cannons')
        .reply(200, [{ id: 1, available: false, fire_time: 5 }]);
  
      const result = await fireIonCannon(target, cannonId);
      expect(result).to.deep.equal({ casualties: 5, generation: 1 });
    });
  
    it('should return an error if the cannon is not found', async () => {
      const target = { x: 5, y: 5 };
      const cannonId = 1;
  
      nock('http://localhost:3000')
        .post(`/api/cannons/${cannonId}/fire`)
        .reply(404);
  
      try {
        await fireIonCannon(target, cannonId);
      } catch (error) {
        expect(error.message).to.equal('Request failed with status code 404');
      }
    });
  });
});
