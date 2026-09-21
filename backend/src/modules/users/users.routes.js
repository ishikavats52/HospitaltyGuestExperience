import { Router } from 'express';
import { User } from './users.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';
import { requireHotelAdmin } from '../../middleware/role.middleware.js';

const router = Router();

router.get('/staff', authenticate, enforceTenantIsolation, requireHotelAdmin, async (req, res, next) => {
  try {
    const filter = req.tenant.isSuperAdmin && !req.tenant.hotelId ? {} : { hotelId: req.tenant.hotelId };
    const staff = await User.find(filter, '-passwordHash').populate('propertyId', 'name');
    return ApiResponse.success(res, 'Staff members fetched', staff);
  } catch (err) {
    next(err);
  }
});

export default router;
