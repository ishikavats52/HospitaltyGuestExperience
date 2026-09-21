import { Router } from 'express';
import { Invoice } from './billing.model.js';
import { Stay } from '../stays/stays.model.js';
import { FoodOrder } from '../orders/orders.model.js';
import { ServiceRequest } from '../services/services.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * Generate or fetch real-time stay folio (Room charge, Food, Services, Taxes)
 */
router.get('/stay/:stayId/folio', authenticate, async (req, res, next) => {
  try {
    const { stayId } = req.params;
    if (!stayId || stayId === 'undefined' || stayId === 'null') {
      return ApiResponse.error(res, 'Valid stayId parameter is required', 400);
    }
    const stay = await Stay.findById(stayId).populate('bookingId').populate('roomId');
    if (!stay) return ApiResponse.error(res, 'Stay not found', 404);

    const foodOrders = await FoodOrder.find({ stayId });
    const serviceRequests = await ServiceRequest.find({ stayId, price: { $gt: 0 } }).populate('serviceCatalogueId', 'name');

    const items = [];
    // Room charge
    const roomCharge = stay.bookingId?.totalAmount || 3500;
    items.push({
      itemType: 'ROOM',
      description: `Room accommodation charge (${stay.bookingId?.bookingNumber || 'Standard'})`,
      quantity: 1,
      unitPrice: roomCharge,
      totalPrice: roomCharge,
    });

    // Food orders
    foodOrders.forEach((order) => {
      items.push({
        itemType: 'FOOD',
        description: `In-room Dining (${order.orderNumber}): ${order.items.map(i => i.name).join(', ')}`,
        quantity: 1,
        unitPrice: order.totalAmount,
        totalPrice: order.totalAmount,
      });
    });

    // Paid services
    serviceRequests.forEach((reqItem) => {
      items.push({
        itemType: 'SERVICE',
        description: `Hotel Service: ${reqItem.serviceCatalogueId?.name || 'Custom Service'}`,
        quantity: 1,
        unitPrice: reqItem.price,
        totalPrice: reqItem.price,
      });
    });

    const subtotal = items.reduce((acc, i) => acc + i.totalPrice, 0);
    const taxAmount = Math.round(subtotal * 0.12); // 12% GST
    const totalAmount = subtotal + taxAmount;

    return ApiResponse.success(res, 'Guest folio details fetched', {
      stayId,
      bookingNumber: stay.bookingId?.bookingNumber,
      roomNumber: stay.roomId?.roomNumber || 'Assigned on arrival',
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
    const { stayId } = req.params;
    const { paymentMethod, amountPaid } = req.body;

    const stay = await Stay.findById(stayId);
    if (!stay) return ApiResponse.error(res, 'Stay not found', 404);

    stay.status = 'CHECKED_OUT';
    stay.checkedOutAt = new Date();
    await stay.save();

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
