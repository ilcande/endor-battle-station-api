const { attack } = require('../controllers/attacksController');
const sinon = require('sinon');
const attackService = require('../services/attackService');

describe('attack', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        protocols: ['closest-enemies'],
        scan: [
          { coordinates: { x: 10, y: 20 }, enemies: 10, allies: 5 },
          { coordinates: { x: 5, y: 5 }, enemies: 1 },
        ],
      },
    };
    res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis(),
    };
    sinon.stub(attackService, 'parseScanData').returns({
      protocols: req.body.protocols,
      parsedScan: req.body.scan.map(s => ({
        x: s.coordinates.x,
        y: s.coordinates.y,
        enemies: s.enemies,
        allies: s.allies || 0,
      })),
    });
    sinon.stub(attackService, 'determineTarget').returns({ x: 5, y: 5 });
    sinon.stub(attackService, 'findAvailableIonCannon').resolves(1);
    sinon.stub(attackService, 'fireIonCannon').resolves({ casualties: 5, generation: 1 });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return correct response data', async () => {
    await attack(req, res);

    sinon.assert.calledWith(res.json, {
      target: { x: 5, y: 5 },
      casualties: 5,
      generation: 1,
    });
  });
});
