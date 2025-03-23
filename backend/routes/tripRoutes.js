const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// Get all trips
router.get('/', tripController.getTripDetailsController);

// Get trip by ID
router.get('/:id', tripController.getTripDetailsByIdController);

// Create new trip
router.post('/', tripController.tripAdditionController);

module.exports = router;