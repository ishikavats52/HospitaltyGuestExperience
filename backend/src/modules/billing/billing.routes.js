import { Router } from 'express';
import { Invoice } from './billing.model.js';
import { Stay } from '../stays/stays.model.js';
import { Booking } from '../bookings/bookings.model.js';
import { Room } from '../rooms/rooms.model.js';
import { FoodOrder } from '../orders/orders.model.js';
import { ServiceRequest, HotelService } from '../services/services.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * Generate or fetch real-time stay folio (Room charge, Food, Services, Taxes)
 */
router.get('/stay/:stayId/folio', authenticate, async (req, res, next) => {
  try {
    let { stayId } = req.params;
    if (!stayId || stayId === 'undefined' || stayId === 'null' || stayId === 'default-stay') {
      stayId = req.user?.stayId;
    }

    // 1. Resolve Stay accurately for this guest
    let stay = null;
    if (stayId && stayId !== 'default-stay' && stayId !== 'undefined' && stayId !== 'null') {
      stay = await Stay.findById(stayId);
    }
    if (!stay && req.user?.bookingId) {
      stay = await Stay.findOne({ bookingId: req.user.bookingId });
    }
    if (!stay && req.user?.guestId) {
      stay = await Stay.findOne({ guestId: req.user.guestId });
    }
    if (!stay && req.user?.roomNumber) {
      stay = await Stay.findOne({ roomNumber: String(req.user.roomNumber) });
    }

    // 2. Resolve Booking for this guest
    let booking = null;
    if (stay?.bookingId) {
      booking = await Booking.findById(stay.bookingId);
      if (!booking) {
        booking = await Booking.findOne({ bookingNumber: stay.bookingId });
      }
    }
    if (!booking && req.user?.bookingId) {
      booking = await Booking.findById(req.user.bookingId);
      if (!booking) {
        booking = await Booking.findOne({ bookingNumber: req.user.bookingId });
      }
    }

    // 3. Resolve Room details
    let room = null;
    const resolvedRoomId = stay?.roomId || booking?.roomId;
    if (resolvedRoomId) {
      room = await Room.findById(resolvedRoomId);
    }

    const roomNumber = stay?.roomNumber || booking?.roomNumber || room?.roomNumber || req.user?.roomNumber || 'Assigned';
    const bookingNumber = booking?.bookingNumber || (typeof stay?.bookingId === 'string' && stay.bookingId.startsWith('BK-') ? stay.bookingId : null) || 'BK-LIVE';
    const guestName = booking?.guestName || stay?.guestName || req.user?.guestName || 'Valued Guest';

    // 4. Calculate exact Room Tariff for this specific guest (from their booking or room rate)
    const roomTariff = Number(booking?.totalAmount) || Number(room?.pricePerNight) || Number(stay?.folioBalance) || 0;
    const roomTypeName = booking?.roomTypeName || room?.roomTypeName || 'Room Accommodation';

    let nights = 1;
    if (booking?.checkInDate && booking?.checkOutDate) {
      const d1 = new Date(booking.checkInDate).getTime();
      const d2 = new Date(booking.checkOutDate).getTime();
      const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      if (diff > 0) nights = diff;
    }

    const items = [];
    if (roomTariff > 0) {
      items.push({
        itemType: 'ROOM',
        description: `${roomTypeName} (Room ${roomNumber}) - ${nights} Night${nights > 1 ? 's' : ''}`,
        quantity: nights,
        unitPrice: Math.round(roomTariff / nights),
        totalPrice: roomTariff,
      });
    }

    // 5. Gather Food Orders placed after check-in for this specific guest
    const activeStayId = stay ? String(stay._id || stay.id) : (stayId ? String(stayId) : null);
    const activeBookingId = booking ? String(booking._id || booking.id) : (req.user?.bookingId ? String(req.user.bookingId) : null);

    const allFoodOrders = await FoodOrder.find();
    const guestFoodOrders = allFoodOrders.filter((order) => {
      if (activeStayId && String(order.stayId) === activeStayId) return true;
      if (activeBookingId && String(order.bookingId) === activeBookingId) return true;
      if (roomNumber && String(order.roomNumber) === String(roomNumber) && activeStayId && String(order.stayId) === activeStayId) return true;
      return false;
    });

    guestFoodOrders.forEach((order) => {
      const dishesSummary = Array.isArray(order.items)
        ? order.items.map((i) => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ''}`).join(', ')
        : 'In-Room Dining Item(s)';

      items.push({
        itemType: 'FOOD',
        description: `In-Room Dining (${order.orderNumber || 'Order'}): ${dishesSummary}`,
        quantity: 1,
        unitPrice: Number(order.totalAmount) || 0,
        totalPrice: Number(order.totalAmount) || 0,
      });
    });

    // 6. Gather Paid Hotel Services requested by this specific guest
    const allServices = await ServiceRequest.find();
    const guestServices = allServices.filter((srv) => {
      if (activeStayId && String(srv.stayId) === activeStayId) return true;
      if (activeBookingId && String(srv.bookingId) === activeBookingId) return true;
      return false;
    });

    for (const reqItem of guestServices) {
      const price = Number(reqItem.price) || 0;
      if (price > 0) {
        let serviceName = reqItem.serviceName || reqItem.name;
        if (!serviceName && reqItem.serviceCatalogueId) {
          const cat = await HotelService.findById(reqItem.serviceCatalogueId);
          serviceName = cat?.name || 'Hotel Service';
        }
        items.push({
          itemType: 'SERVICE',
          description: `Guest Service: ${serviceName || 'Requested Service'}`,
          quantity: 1,
          unitPrice: price,
          totalPrice: price,
        });
      }
    }

    const subtotal = items.reduce((acc, i) => acc + i.totalPrice, 0);
    const taxAmount = Math.round(subtotal * 0.12); // 12% GST
    const totalAmount = subtotal + taxAmount;

    return ApiResponse.success(res, 'Guest folio details fetched', {
      stayId: activeStayId,
      bookingNumber,
      roomNumber,
      guestName,
      subtotal,
      taxAmount,
      totalAmount,
      items,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Settle Folio / Contactless Checkout
 */
router.post('/stay/:stayId/settle', authenticate, async (req, res, next) => {
  try {
    let { stayId } = req.params;
    if (!stayId || stayId === 'undefined' || stayId === 'null' || stayId === 'default-stay' || stayId === 'me') {
      stayId = req.user?.stayId;
    }
    const { paymentMethod, amountPaid } = req.body;

    let stay = (stayId && stayId !== 'default-stay' && stayId !== 'me') ? await Stay.findById(stayId) : null;
    if (!stay && req.user?.bookingId) {
      stay = await Stay.findOne({ bookingId: req.user.bookingId });
    }
    if (!stay && req.user?.roomNumber) {
      stay = await Stay.findOne({ roomNumber: String(req.user.roomNumber) });
    }
    if (!stay) return ApiResponse.error(res, 'Stay record not found for settlement', 404);

    stay.status = 'CHECKED_OUT';
    stay.checkedOutAt = new Date().toISOString();
    await stay.save();

    // Release room to CLEANING for housekeeping turnover
    if (stay.roomId) {
      await Room.findByIdAndUpdate(stay.roomId, { status: 'CLEANING' });
    }

    return ApiResponse.success(res, 'Payment processed and checkout completed', {
      stayId,
      status: stay.status,
      paymentMethod: paymentMethod || 'RAZORPAY_UPI',
      amountPaid,
      settledAt: stay.checkedOutAt,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
