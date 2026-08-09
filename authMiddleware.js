// Authentication Middleware
// Protects routes by verifying the JWT Bearer token in request headers

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check for Authorization header (Format: Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token string
      token = req.headers.authorization.split(' ')[1];

      // Verify JWT signature and expiration
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user account from SQLite database by Primary Key (id)
      req.user = await User.findByPk(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User account associated with token no longer exists',
        });
      }

      // Token is valid, proceed to controller handler
      return next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token invalid or expired',
      });
    }
  }

  // If no token is provided
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token provided',
    });
  }
};

module.exports = { protect };
