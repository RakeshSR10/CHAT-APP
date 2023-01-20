const mongoose = require('mongoose');

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;

db.on('connected', () => {
    console.log('MongoDB connected successfully....!');
})

db.on('error', (err) => {
    console.log('MongoDB Connection failed.....!');
})

module.exports = db;