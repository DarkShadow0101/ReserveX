// Custom error class that attaches an HTTP statusCode to JavaScript's Error
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Known, expected error (not a code crash)
    this.details = details;

    // Keeps the stack trace pointing to where the error actually happened
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
