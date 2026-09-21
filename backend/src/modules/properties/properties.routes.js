import { Router } from 'express';
import { Property } from './properties.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const filter = req.tenant.isSuperAdmin && !req.tenant.hotelId ? {} : { hotelId: req.tenant.hotelId };
    const properties = await Property.find(filter).populate('hotelId', 'name code');
    return ApiResponse.success(res, 'Properties fetched', properties);
  } catch (err) {
    next(err);
  }
});

export default router;
