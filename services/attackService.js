const axios = require('axios');
const { updateCannonAvailability } = require('../controllers/cannonsController');


// Function to parse scan data
const parseScanData = (scanData) => {
  const { protocols, scan } = scanData;

  const parsedScan = scan.map(point => ({
    x: point.coordinates.x,
    y: point.coordinates.y,
    enemies: point.enemies,
    allies: point.allies || 0,
  }));

  return { protocols, parsedScan };
};

// Function to determine target based on protocols
const determineTarget = (parsedScan, protocols) => {
  const distanceCache = {};

  const calculateDistance = (point) => {
    const key = `${point.x}-${point.y}`;
    if (!distanceCache[key]) {
      distanceCache[key] = Math.sqrt(point.x * point.x + point.y * point.y);
    }
    return distanceCache[key];
  };

  const filteredScan = parsedScan.filter(point => {
    for (const protocol of protocols) {
      switch (protocol) {
        case 'assist-allies':
          if (point.allies === 0) return false;
          break;
        case 'avoid-crossfire':
          if (point.allies > 0) return false;
          break;
        case 'prioritize-mech':
          if (point.enemies.type !== 'mech') return false;
          break;
        case 'avoid-mech':
          if (point.enemies.type === 'mech') return false;
          break;
      }
    }
    return true;
  });

  const sortedScan = filteredScan.sort((a, b) => {
    switch (protocols[0]) {
      case 'closest-enemies':
        return calculateDistance(a) - calculateDistance(b);
      case 'furthest-enemies':
        return calculateDistance(b) - calculateDistance(a);
      case 'assist-allies':
        return b.allies - a.allies || calculateDistance(a) - calculateDistance(b);
      case 'avoid-crossfire':
        return a.allies - b.allies;
      case 'prioritize-mech':
        return (b.enemies.type === 'mech') - (a.enemies.type === 'mech');
      case 'avoid-mech':
        return (a.enemies.type !== 'mech') - (b.enemies.type !== 'mech');
      default:
        return 0;
    }
  });

  return sortedScan[0];
};

// Function to find available ion cannon
const findAvailableIonCannon = async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/api/cannons');
    const availableCannon = data.find(cannon => cannon.available);

    if (availableCannon) {
      updateCannonAvailability(availableCannon.id, availableCannon.fire_time);
      return availableCannon.id;
    }

    throw new Error('No ion cannons available');
  }
  catch (error) {
    console.error('Error finding available ion cannon:', error);
    throw error;
  }
}

// Function to fire ion cannon
const fireIonCannon = async (target, cannonId) => {
  try {
    // Fire the cannon
    const response = await axios.post(`http://localhost:3000/api/cannons/${cannonId}/fire`, { target });

    // Update the availability
    const { data: cannons } = await axios.get('http://localhost:3000/api/cannons');
    const cannon = cannons.find(c => c.id === cannonId);
    updateCannonAvailability(cannonId, cannon.fire_time);

    console.log('Firing ion cannon:', cannonId, 'at target:', target);

    return response.data;
  } catch (error) {
    console.error('Error firing ion cannon:', error);
    throw error;
  }
};


module.exports = {
  parseScanData,
  determineTarget,
  findAvailableIonCannon,
  fireIonCannon,
};
