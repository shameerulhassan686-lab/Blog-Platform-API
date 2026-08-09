// Database Configuration File
// Connects our Express server to SQLite database using Sequelize ORM

const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize instance with SQLite dialect
// SQLite stores all tables in a single local file ('blog_platform.sqlite')
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_STORAGE || path.join(__dirname, '../blog_platform.sqlite'),
  logging: false, // Turn off SQL query logging in console to keep terminal clean
});

// Function to test and initialize database tables
const connectDB = async () => {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('✅ SQLite SQL Database Connected Successfully');

    // Automatically sync models with database tables
    await sequelize.sync();
    console.log('✅ Database Tables Synchronized Successfully');
  } catch (error) {
    console.error('❌ SQLite Connection Error:', error.message);
  }
};

module.exports = { sequelize, connectDB };
