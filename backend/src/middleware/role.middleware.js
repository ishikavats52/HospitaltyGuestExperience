import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Role-Based Access Control Middleware
 * Supports single role or array of permitted roles
 */
export const requireRoles = (...permittedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return ApiResponse.error(res, 'Unauthorized: No active role context', 401);
    }

    if (!permittedRoles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
        403
      );
    }

    next();
  };
};

export const requireSuperAdmin = requireRoles('SUPER_ADMIN');
export const requireHotelAdmin = requireRoles('SUPER_ADMIN', 'HOTEL_ADMIN');

export const requireStaff = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return ApiResponse.error(res, 'Unauthorized: No active role context', 401);
  }
  if (req.user.role === 'GUEST') {
    return ApiResponse.error(res, 'Forbidden: Guest accounts cannot access staff operations', 403);
  }
  const defaultStaffRoles = ['SUPER_ADMIN', 'HOTEL_ADMIN', 'RECEPTION', 'KITCHEN', 'HOUSEKEEPING', 'ACCOUNTS'];
  if (defaultStaffRoles.includes(req.user.role) || req.user.hotelId) {
    return next();
  }
  return ApiResponse.error(res, `Forbidden: Role '${req.user.role}' is not authorized`, 403);
};
