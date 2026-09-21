import { Router } from 'express';
import { Room, RoomType } from './rooms.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const filter = req.tenant.isSuperAdmin && !req.tenant.hotelId ? {} : { hotelId: req.tenant.hotelId };
    const rooms = await Room.find(filter).populate('roomTypeId').populate('propertyId', 'name');
    return ApiResponse.success(res, 'Rooms inventory fetched', rooms);
  } catch (err) {
    next(err);
  }
});

router.get('/types', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const filter = req.tenant.isSuperAdmin && !req.tenant.hotelId ? {} : { hotelId: req.tenant.hotelId };
    const types = await RoomType.find(filter);
    return ApiResponse.success(res, 'Room types fetched', types);
  } catch (err) {
    next(err);
  }
});

export default router;
