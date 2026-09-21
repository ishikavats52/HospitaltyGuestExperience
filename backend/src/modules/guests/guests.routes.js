import { Router } from 'express';
import { Guest } from './guests.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const filter = req.tenant.isSuperAdmin && !req.tenant.hotelId ? {} : { hotelId: req.tenant.hotelId };
    const guests = await Guest.find(filter);
    return ApiResponse.success(res, 'Guests fetched', guests);
  } catch (err) {
    next(err);
  }
});

export default router;
