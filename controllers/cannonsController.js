// Controller for handling ion cannon operations
const cannons = require('../models/cannons');

// Get cannons
const getCannons = (req, res) => {
  res.json(cannons);
}

let cannonStatuses = cannons.reduce((acc, cannon) => {
  acc[cannon.id] = { available: cannon.available, fire_time: cannon.fire_time };
  return acc;
}, {});

// Simulate the passage of time and cannon availability
const updateCannonAvailability = (cannonId, fireTime) => {
  if (!cannonStatuses[cannonId]) {
    cannonStatuses[cannonId] = { available: true };
  }

  // Set the cannon to unavailable immediately
  cannonStatuses[cannonId].available = false;

  // Set a timeout to mark the cannon as available after the fireTime
  setTimeout(() => {
    cannonStatuses[cannonId].available = true;
  }, fireTime * 1000);
};


const getStatus = (req, res) => {
  const { cannonId } = req.params;
  const status = cannonStatuses[cannonId];
  const generation = cannons.find(cannon => cannon.id === cannonId)?.generation;
  // Return the cannon status if it exists along with the generation
  if (status) {
    res.json({ available: status.available, generation });
  } else {
    res.status(404).json({ error: 'Cannon not found' });
  }
};

// Fire cannon
const fireCannon = async (req, res) => {
  try {
    const { cannonId } = req.params;
    const { target } = req.body;

    const casualties = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    if (cannonStatuses[cannonId]) {
      res.json({ casualties: casualties[Math.floor(Math.random() * casualties.length)], generation: cannons.find(cannon => cannon.id === cannonId).generation });
      updateCannonAvailability(cannonId, cannons.find(cannon => cannon.id === cannonId).fire_time);
    } else {
      res.status(404).json({ error: 'Cannon not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCannons, getStatus, updateCannonAvailability, fireCannon };
