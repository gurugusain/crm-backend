import AppError from "../utils/AppError.js";

export function errorHandler(err, req, res, next) {
  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    err = new AppError("Invalid ID format", 400, "INVALID_ID");
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    err = new AppError(err.message, 400, "VALIDATION_ERROR");
  }

  const status = err.statusCode || 500;

  const response = {
    message: err.message || "Internal Server Error",
    code: err.code || "INTERNAL_ERROR",
  };

  // Stack only in dev (never in production)
  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  return res.status(status).json(response);
}
