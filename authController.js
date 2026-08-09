// Auth Controller
// Handles user registration and authentication logic using SQL / Sequelize

const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');

// Helper function to generate signed JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  });
};

// @desc    Register a new user
// @route   POST /register OR POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validate input fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide username, email, and password',
      });
    }

    // 2. Check if user already exists with matching email or username
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: email.toLowerCase() }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or username already exists',
      });
    }

    // 3. Create user in SQLite database (Password is hashed automatically via beforeCreate hook)
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
    });

    // 4. Generate JWT Token
    const token = generateToken(user.id);

    // 5. Send success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log in existing user
// @route   POST /login OR POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // 2. Find user by email in SQLite database
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials (User not found)',
      });
    }

    // 3. Compare entered plain-text password with stored hash
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials (Incorrect password)',
      });
    }

    // 4. Generate JWT token
    const token = generateToken(user.id);

    // 5. Send response
    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
