// Standardized HTTP error class. Controllers throw these (e.g. via the
// static helpers) and the global error handler in app.js reads `statusCode`
// to produce a consistent error response. Extends the built-in Error so
// `instanceof` and stack traces still work as expected.

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    // this.isOperational = true;
    // Capture the stack at construction so it points to where the error
    // was thrown, not to this constructor.
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request") {
    return new ApiError(400, message);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }

  static forbidden(message = "forbidden") {
    return new ApiError(403, message);
  }

  static notfound(message = "notfound") {
    return new ApiError(404, message);
  }
}

export default ApiError;
