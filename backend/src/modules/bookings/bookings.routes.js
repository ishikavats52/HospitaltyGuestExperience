import { Router } from 'express';
import { Booking } from './bookings.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const filter = req.tenant.isSuperAdmin && !req.tenant.hotelId ? {} : { hotelId: req.tenant.hotelId };
    const bookings = await Booking.find(filter)
      .populate('guestId', 'name phone email')
      .populate('roomTypeId', 'name code')
      .populate('propertyId', 'name');
    return ApiResponse.success(res, 'Bookings fetched', bookings);
  } catch (err) {
    next(err);
  }
});

export default router;
