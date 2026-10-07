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
    let { stayId, items, specialInstructions } = req.body;
    if (!stayId || stayId === 'undefined' || stayId === 'null' || stayId === 'default-stay') {
      stayId = req.user?.stayId;
    }
    let stay = (stayId && stayId !== 'default-stay') ? await Stay.findById(stayId) : null;
    if (!stay && req.user?.bookingId) {
      stay = await Stay.findOne({ bookingId: req.user.bookingId });
    }
    if (!stay) {
      stay = await Stay.findOne();
    }
    if (!stay) {
      stay = await Stay.create({
        hotelId: req.user?.hotelId || 'HOTEL-DELHI-01',
        propertyId: req.user?.propertyId || 'PROP-DELHI-01',
        bookingId: req.user?.bookingId || 'BK-DELHI-101',
        roomId: 'ROOM-302',
        status: 'BOOKING_CONFIRMED',
        folioBalance: 0,
      });
    }

    if (stay && stay.status !== 'CHECKED_IN' && stay.status !== 'STAY_ACTIVE') {
      return ApiResponse.error(
        res,
        'Check-In verification required: Please complete contactless check-in with your Aadhaar card and selfie before placing in-room dining orders.',
        403
      );
    }

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
