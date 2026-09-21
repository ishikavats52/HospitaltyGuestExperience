import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

  if (err.name === 'ValidationError') {
    return ApiResponse.error(res, 'Database Validation Error', 400, err.errors);
  }

  if (err.name === 'CastError') {
    return ApiResponse.error(res, `Invalid ID format provided: ${err.value}`, 400);
  }

  if (err.code === 11000) {
    return ApiResponse.error(res, 'Duplicate key conflict error', 409, err.keyValue);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return ApiResponse.error(res, message, statusCode);
};
