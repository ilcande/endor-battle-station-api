const attackService = require('../services/attackService');

const attack = async (req, res) => {
  try {
    const scanData = attackService.parseScanData(req.body);
    const target = attackService.determineTarget(scanData.parsedScan, scanData.protocols);
    const cannonId = await attackService.findAvailableIonCannon();
    const result = await attackService.fireIonCannon(target, cannonId);

    console.log('Fire Ion Cannon Result:', result); // Log the result

    // Construct the response data
    const responseData = {
      target: { x: target.x, y: target.y },
      casualties: result.casualties,
      generation: result.generation,
    };

    // Log response data to verify its structure
    console.log('Response Data:', responseData);

    // Send the response
    res.json(responseData);
  } catch (error) {
    console.error('Error in attack function:', error); // Log the error object
    res.status(500).json({ error: error.message });
  }
};

module.exports = { attack };
