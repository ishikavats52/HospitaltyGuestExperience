import { Router } from 'express';
import { FoodOrder, ORDER_STATUS } from './orders.model.js';
import { Stay } from '../stays/stays.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const isSuper = req.user?.role === 'SUPER_ADMIN' || req.tenant?.isSuperAdmin;
    const hotelId = req.tenant?.hotelId || req.user?.hotelId;
    const stayId = req.query.stayId;

    const allOrders = await FoodOrder.find();
    let orders = allOrders.filter((o) => {
      if (stayId && String(o.stayId) !== String(stayId)) return false;
      if (!isSuper && hotelId) {
        const oHotelId = String(o.hotelId?._id || o.hotelId || '');
        const targetHotelId = String(hotelId?._id || hotelId);
        if (oHotelId && targetHotelId && oHotelId !== targetHotelId && oHotelId !== 'DEFAULT') {
          return false;
        }
      }
      return true;
    });

    orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
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
    if (!stay && req.user?.guestId) {
      stay = await Stay.findOne({ guestId: req.user.guestId });
    }
    if (!stay && req.user?.roomNumber) {
      stay = await Stay.findOne({ roomNumber: String(req.user.roomNumber) });
    }

    let finalRoomNumber = stay?.roomNumber || req.user?.roomNumber;
    if (!finalRoomNumber && stay?.roomId) {
      try {
        const { Room } = await import('../rooms/rooms.model.js');
        const rm = await Room.findById(stay.roomId);
        if (rm && rm.roomNumber) finalRoomNumber = rm.roomNumber;
      } catch (_) {}
    }
    if (!finalRoomNumber && stay?.bookingId) {
      try {
        const { Booking } = await import('../bookings/bookings.model.js');
        const bk = await Booking.findById(stay.bookingId);
        if (bk && bk.roomNumber) finalRoomNumber = bk.roomNumber;
      } catch (_) {}
    }
    if (!finalRoomNumber) finalRoomNumber = 'Assigned Room';

    let guestName = req.user?.guestName || req.user?.name;
    if (!guestName && stay?.guestId) {
      try {
        const { Guest } = await import('../guests/guests.model.js');
        const g = await Guest.findById(stay.guestId);
        if (g && g.name) guestName = g.name;
      } catch (_) {}
    }
    if (!guestName && stay?.bookingId) {
      try {
        const { Booking } = await import('../bookings/bookings.model.js');
        const b = await Booking.findById(stay.bookingId);
        if (b && b.guestName) guestName = b.guestName;
      } catch (_) {}
    }
    if (!guestName) guestName = 'In-Stay Guest';

    const totalAmount = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    const order = await FoodOrder.create({
      hotelId: String(stay?.hotelId?._id || stay?.hotelId || req.user?.hotelId || 'DEFAULT'),
      propertyId: String(stay?.propertyId?._id || stay?.propertyId || req.user?.propertyId || 'DEFAULT'),
      stayId: String(stay?._id || stayId || req.user?.stayId || ''),
      bookingId: stay?.bookingId ? String(stay.bookingId) : (req.user?.bookingId ? String(req.user.bookingId) : null),
      roomId: stay?.roomId ? String(stay.roomId) : (req.user?.roomId ? String(req.user.roomId) : null),
      roomNumber: finalRoomNumber,
      guestName,
      orderNumber,
      items,
      totalAmount,
      specialInstructions: specialInstructions || 'Delivered to room',
      status: 'PLACED',
      createdAt: new Date().toISOString(),
    });

    // Update folio balance on stay
    if (stay) {
      stay.folioBalance = (Number(stay.folioBalance) || 0) + totalAmount;
      await Stay.findByIdAndUpdate(stay._id, { folioBalance: stay.folioBalance });
    }

    return ApiResponse.success(res, 'Food order placed successfully and added to folio', order, 201);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status, fulfilledBy } = req.body;
    const actor = fulfilledBy || req.user?.name || 'Staff Member';
    const nowIso = new Date().toISOString();

    const updateData = { status, fulfilledBy: actor, updatedAt: nowIso };
    if (status === 'DELIVERED' || status === 'COMPLETED' || status === 'FULFILLED') {
      updateData.status = 'DELIVERED';
      updateData.deliveredAt = nowIso;
    }

    const order = await FoodOrder.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!order) return ApiResponse.error(res, 'Order not found', 404);

    return ApiResponse.success(res, `Order status updated to ${updateData.status}`, order);
  } catch (err) {
    next(err);
  }
});

export default router;
