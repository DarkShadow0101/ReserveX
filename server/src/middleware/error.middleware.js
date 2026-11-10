// Central Error Handling Middleware (MUST have 4 parameters: err, req, res, next)
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // 1. Mongoose invalid ObjectId error (e.g., /api/events/not-a-valid-id)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // 2. Mongoose duplicate key error (e.g., duplicate email if unique index is hit)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${duplicateField}. Please use another value.`;
  }

  // 3. Mongoose schema validation error (e.g., missing required field or invalid enum)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
    message = 'Validation failed';
    details = errors;
  }

  // 4. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Unauthorized: Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Unauthorized: Your session has expired, please log in again';
  }

  // 5. Zod validation error (ready for Step 3!)
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed';
    details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
  }

  // Log unexpected 500 bugs on the server terminal so we can debug them
  if (statusCode === 500) {
    console.error('UNHANDLED ERROR:', err);
    // In production, hide internal bug messages so we don't leak DB/code internals
    if (process.env.NODE_ENV === 'production') {
      message = 'Internal Server Error';
      details = null;
    }
  }

  const response = {
    success: false,
    message
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
}

module.exports = errorHandler;
