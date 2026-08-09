// Main Application Server
// Configures Express server, middleware, routes, and SQLite SQL database connection

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db.js');
const errorHandler = require('./middleware/errorHandler.js');

// Load environment variables from .env file
dotenv.config();

// Connect and Sync SQLite Database
connectDB();

// Initialize Express App
const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Enable Body Parser for JSON payloads
app.use(express.json());

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

// Mount API Routes (Standard REST endpoints)
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Direct Route Aliases (To satisfy requirement: POST /register, POST /login, GET/POST/PUT/DELETE /posts)
app.use('/', authRoutes);
app.use('/posts', postRoutes);

// Catch 404 for any unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found on this server`,
  });
});

// Centralized Error Handling Middleware (Must be defined last)
app.use(errorHandler);

// Define Server Port
const PORT = process.env.PORT || 5000;

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Blog Platform API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 Local URL: http://localhost:${PORT}`);
  console.log(`💻 Interactive Web Dashboard available at http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`⚠️ Unhandled Promise Rejection: ${err.message}`);
});
