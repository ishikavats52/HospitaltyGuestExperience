import { Router } from 'express';
import { Stay } from './stays.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const filter = req.tenant.isSuperAdmin && !req.tenant.hotelId ? {} : { hotelId: req.tenant.hotelId };
    const stays = await Stay.find(filter)
      .populate('guestId', 'name phone email')
      .populate('roomId', 'roomNumber floor status')
      .populate('bookingId');
    return ApiResponse.success(res, 'Active stays fetched', stays);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const stay = await Stay.findById(req.params.id)
      .populate('guestId')
      .populate('roomId')
      .populate('hotelId')
      .populate('propertyId');
    if (!stay) return ApiResponse.error(res, 'Stay not found', 404);
    return ApiResponse.success(res, 'Stay details fetched', stay);
  } catch (err) {
    next(err);
  }
});

export default router;
