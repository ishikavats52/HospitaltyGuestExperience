import { Router } from 'express';
import { FoodOrder, ORDER_STATUS } from './orders.model.js';
import { Stay } from '../stays/stays.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const filter = req.tenant.isSuperAdmin && !req.tenant.hotelId ? {} : { hotelId: req.tenant.hotelId };
    if (req.query.stayId) filter.stayId = req.query.stayId;

    const orders = await FoodOrder.find(filter)
      .populate('roomId', 'roomNumber floor')
      .sort({ createdAt: -1 });
    return ApiResponse.success(res, 'Food orders fetched', orders);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { stayId, items, specialInstructions } = req.body;
    if (!stayId || stayId === 'undefined' || stayId === 'null') {
      return ApiResponse.error(res, 'Valid stayId parameter is required to place a food order', 400);
    }
    const stay = await Stay.findById(stayId);
    if (!stay) return ApiResponse.error(res, 'Stay not found', 404);

    const totalAmount = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    const order = await FoodOrder.create({
      hotelId: stay.hotelId,
      propertyId: stay.propertyId,
      stayId: stay._id,
      roomId: stay.roomId,
      orderNumber,
      items,
      totalAmount,
      specialInstructions,
    });

    // Update folio balance on stay
    stay.folioBalance = (stay.folioBalance || 0) + totalAmount;
    await stay.save();

    return ApiResponse.success(res, 'Food order placed successfully and added to folio', order, 201);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!Object.values(ORDER_STATUS).includes(status)) {
      return ApiResponse.error(res, 'Invalid order status transition', 400);
    }

    const order = await FoodOrder.findByIdAndUpdate(req.params.id, { status }, { new: true });
    return ApiResponse.success(res, `Order status updated to ${status}`, order);
  } catch (err) {
    next(err);
  }
});

export default router;
