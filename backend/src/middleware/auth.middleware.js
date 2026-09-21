import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Authenticate JWT token and attach user / guest context to req
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error(res, 'Authentication token missing or invalid format', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Token has expired', 401);
    }
    return ApiResponse.error(res, 'Invalid token signature', 401);
  }
};

/**
 * Guest Session Authenticator (Supports Guest Token or Active Stay Token)
 */
export const authenticateGuest = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error(res, 'Guest access token required', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded.isGuest && decoded.role !== 'GUEST') {
      return ApiResponse.error(res, 'Invalid guest session credentials', 403);
    }
    req.guest = decoded;
    req.tenant = {
      hotelId: decoded.hotelId,
      propertyId: decoded.propertyId,
    };
    next();
  } catch (err) {
    return ApiResponse.error(res, 'Guest session expired or invalid', 401);
  }
};
