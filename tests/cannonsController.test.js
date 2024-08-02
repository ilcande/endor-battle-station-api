const chai = require('chai');
const expect = chai.expect;
const cannonsController = require('../controllers/cannonsController');

// Mock the cannons data and status
const cannons = require('../models/cannons');
let cannonStatuses = cannons.reduce((acc, cannon) => {
  acc[cannon.id] = { available: cannon.available, fire_time: cannon.fire_time };
  return acc;
}, {});

describe('cannonsController', () => {
  beforeEach(() => {
    // Reset cannonStatuses before each test
    cannonStatuses = cannons.reduce((acc, cannon) => {
      acc[cannon.id] = { available: cannon.available, fire_time: cannon.fire_time };
      return acc;
    }, {});
  });

  describe('getCannons', () => {
    it('should return all cannons', () => {
      const req = {};
      const res = {
        json: (cannonsResponse) => {
          expect(cannonsResponse).to.be.an('array');
          expect(cannonsResponse).to.have.lengthOf(3);
          expect(cannonsResponse).to.deep.equal(cannons);
        }
      };

      cannonsController.getCannons(req, res);
    });
  });

  describe('getStatus', () => {
    it('should return cannon status if it exists', () => {
      const req = { params: { cannonId: 'cannon1' } };
      const res = {
        json: (status) => {
          expect(status).to.deep.equal({ available: true, generation: 1 });
        }
      };

      cannonsController.getStatus(req, res);
    });

    it('should return a 404 error if the cannon does not exist', () => {
      const req = { params: { cannonId: 'cannon4' } };
      const res = {
        status: (statusCode) => {
          expect(statusCode).to.equal(404);
          return res;
        },
        json: (error) => {
          expect(error).to.deep.equal({ error: 'Cannon not found' });
        }
      };

      cannonsController.getStatus(req, res);
    });
  });

  describe('fireCannon', () => {
    it('should return casualties and generation if cannon exists', async () => {
      const req = { params: { cannonId: 'cannon1' }, body: { target: 'city1' } };
      const res = {
        json: (result) => {
          expect(result).to.have.property('casualties').that.is.a('number');
          expect(result).to.have.property('generation').that.equals(1);
        }
      };

      await cannonsController.fireCannon(req, res);
    });

    it('should not fire the cannon if it is not available', async () => {
      cannonStatuses['cannon1'].available = false; // Set cannon to unavailable
      const req = { params: { cannonId: 'cannon1' }, body: { target: 'city1' } };
      const res = {
        status: (statusCode) => {
          expect(statusCode).to.equal(500);
          return res;
        },
        json: (error) => {
          expect(error).to.have.property('error');
        }
      };

      await cannonsController.fireCannon(req, res);
    });

    it('should return a 404 error if the cannon does not exist', async () => {
      const req = { params: { cannonId: 'cannon4' }, body: { target: 'city1' } };
      const res = {
        status: (statusCode) => {
          expect(statusCode).to.equal(404);
          return res;
        },
        json: (error) => {
          expect(error).to.deep.equal({ error: 'Cannon not found' });
        }
      };

      await cannonsController.fireCannon(req, res);
    });

    it('should return a 500 error if an error occurs', async () => {
      const req = { params: { cannonId: 'cannon1' }, body: { target: 'city1' } };
      const res = {
        status: (statusCode) => {
          expect(statusCode).to.equal(500);
          return res;
        },
        json: (error) => {
          expect(error).to.have.property('error');
        }
      };

      // Simulate an error by passing an invalid cannonId type
      req.params.cannonId = undefined;

      await cannonsController.fireCannon(req, res);
    });
  });
});
