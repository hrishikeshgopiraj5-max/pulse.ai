/**
 * Pulse AI — Custom Error Classes
 *
 * Typed errors that carry HTTP status codes and operational flags.
 * Operational errors → safe to send to client.
 * Programming errors → logged, generic message sent to client.
 */

class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed.") {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Authentication required.") {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = "The requested resource was not found.") {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = "Resource already exists.") {
    super(message, 409);
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, 429);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
};
