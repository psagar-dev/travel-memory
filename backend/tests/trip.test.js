const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../index');
const Trip = require('../models/tripModel').Trip;

let mongoServer;
let server;

beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Disconnect from any existing connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
  
  // Create HTTP server for testing
  return new Promise((resolve) => {
    server = app.listen(0, () => resolve());
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await server.close();
});

beforeEach(async () => {
  await Trip.deleteMany({});
});

describe('Trip API Tests', () => {
  const sampleTrip = {
    tripName: 'Test Trip',
    shortDescription: 'A test trip description',
    image: 'test-image.jpg',
    startDateOfJourney: '2025-03-23',
    endDateOfJourney: '2025-03-24',
    tripType: 'leisure',
    nameOfHotels: 'Test Hotel',
    placesVisited: 'Test Location',
    totalCost: 1000,
    experience: 'Great experience'
  };

  it('POST /trips - Create a new trip', async () => {
    const response = await request(app)
      .post('/api/trips')
      .send(sampleTrip);
    
    expect(response.status).toBe(201);
    expect(response.body.data.tripName).toBe(sampleTrip.tripName);
    expect(response.body.data.shortDescription).toBe(sampleTrip.shortDescription);
  });

  it('GET /trips - Get all trips', async () => {
    await Trip.create(sampleTrip);
    
    const response = await request(app).get('/api/trips');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBeTruthy();
    expect(response.body.data.length).toBe(1);
  });

  it('GET /trips/:id - Get single trip', async () => {
    const createdTrip = await Trip.create(sampleTrip);
    
    const response = await request(app)
      .get(`/api/trips/${createdTrip._id}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data.tripName).toBe(sampleTrip.tripName);
  });
});