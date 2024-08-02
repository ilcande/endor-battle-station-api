// Dependencies
const express = require('express');
const bodyParser = require('body-parser');

// Controllers
const attacksController = require('./controllers/attacksController');
const cannonsController = require('./controllers/cannonsController');

const app = express();
app.use(bodyParser.json());

app.post('/api/attack', attacksController.attack);

app.post('/api/cannons/:cannonId/fire', cannonsController.fireCannon);

app.get('/api/cannons', cannonsController.getCannons);

app.get('/api/cannons/:cannonId/status', cannonsController.getStatus);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
