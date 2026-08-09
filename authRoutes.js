// Auth Routes
// Routes for user registration and login

const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Public authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
