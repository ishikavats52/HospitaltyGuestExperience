import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Multi-Tenant Isolation Middleware
 * Derives tenant context (hotelId, propertyId) from authenticated session.
 * Rejects any client-supplied spoofing attempts.
 */
export const enforceTenantIsolation = (req, res, next) => {
  // Super Admins have global visibility across all tenants
  if (req.user && req.user.role === 'SUPER_ADMIN') {
    req.tenant = {
      isSuperAdmin: true,
      hotelId: req.headers['x-target-hotel-id'] || req.query.hotelId || null,
      propertyId: req.headers['x-target-property-id'] || req.query.propertyId || null,
    };
    return next();
  }

  // For Hotel Staff & Guests: Tenant MUST be derived strictly from JWT
  const hotelId = req.user?.hotelId || req.guest?.hotelId;
  const propertyId = req.user?.propertyId || req.guest?.propertyId;

  if (!hotelId) {
    return ApiResponse.error(res, 'Tenant context missing from authenticated session', 403);
  }

  req.tenant = {
    isSuperAdmin: false,
    hotelId,
    propertyId: propertyId || null,
  };

  next();
};
