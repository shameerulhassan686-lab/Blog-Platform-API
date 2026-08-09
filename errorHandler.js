// Centralized Error Handling Middleware
// Formats backend and database errors into clean JSON responses

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details to console for debugging
  console.error('Server Error:', err);

  // Sequelize Unique Constraint Error (e.g. email or username already registered)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    const message = `A user with that ${field} already exists. Please choose another.`;
    return res.status(400).json({
      success: false,
      error: message,
    });
  }

  // Sequelize Validation Error (e.g. invalid email format)
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: messages.join(', '),
    });
  }

  // Fallback default error response
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: error.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
