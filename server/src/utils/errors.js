// src/utils/errors.js
// Custom error classes for clean and consistent error handling throughout the app

class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Operational errors are expected issues (e.g. invalid input, user not found)
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details = null) {
    super(message, 400, details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized: Authentication required', details = null) {
    super(message, 401, details);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden: You do not have permission to perform this action', details = null) {
    super(message, 403, details);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, 404, details);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists', details = null) {
    super(message, 409, details);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError
};
