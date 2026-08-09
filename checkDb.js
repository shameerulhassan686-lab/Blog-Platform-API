// Middleware to check if MongoDB is connected before running database operations
const mongoose = require('mongoose');

const checkDbConnection = (req, res, next) => {
  // readyState 1 means connected to MongoDB
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error:
        'Database Error: MongoDB is not connected. Please start your local MongoDB service (e.g. net start MongoDB in PowerShell) or update MONGO_URI in your .env file.',
    });
  }
  next();
};

module.exports = checkDbConnection;
