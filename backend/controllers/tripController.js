const tripModel = require('../models/tripModel');

async function tripAdditionController(req, res) {
    try {
        const tripDetail = new tripModel.Trip({
            tripName: req.body.tripName,
            startDateOfJourney: req.body.startDateOfJourney,
            endDateOfJourney: req.body.endDateOfJourney,
            nameOfHotels: req.body.nameOfHotels,
            placesVisited: req.body.placesVisited,
            totalCost: req.body.totalCost,
            tripType: req.body.tripType,
            experience: req.body.experience,
            image: req.body.image,
            shortDescription: req.body.shortDescription,
            featured: req.body.featured
        });

        await tripDetail.save();
        return res.status(201).json({
            success: true,
            message: 'Trip added successfully',
            data: tripDetail
        });
    } catch (error) {
        console.error('Error adding trip:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add trip',
            error: error.message
        });
    }
}

async function getTripDetailsController(req, res) {
    try {
        const trips = await tripModel.Trip.find({});
        return res.status(200).json({
            success: true,
            data: trips
        });
    } catch (error) {
        console.error('Error fetching trips:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch trips',
            error: error.message
        });
    }
}

async function getTripDetailsByIdController(req, res) {
    try {
        const trip = await tripModel.Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: trip
        });
    } catch (error) {
        console.error('Error fetching trip by ID:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch trip',
            error: error.message
        });
    }
}

module.exports = { 
    tripAdditionController, 
    getTripDetailsController, 
    getTripDetailsByIdController 
};