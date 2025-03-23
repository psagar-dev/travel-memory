const mongoose = require('mongoose')

async function connectDB(url = process.env.MONGO_URI) {
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        mongoose.Promise = global.Promise;
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'DB ERROR: '));
        return db;
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
}

module.exports = { connectDB, mongoose }