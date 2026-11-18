import { Router } from 'express';
import { HotelService, ServiceRequest, SERVICE_REQUEST_STATUS } from './services.model.js';
import { ServiceCatalogue } from '../serviceCatalogue/serviceCatalogue.model.js';
import { FoodOrder } from '../orders/orders.model.js';
import { Hotel } from '../hotels/hotels.model.js';
import { Stay } from '../stays/stays.model.js';
import { Room } from '../rooms/rooms.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';

const router = Router();

// Standard default starter services if hotel hasn't added any yet
const DEFAULT_HOTEL_SERVICES = [
  {
    name: 'Daily Housekeeping & Turndown',
    category: 'Housekeeping',
    description: 'Fresh linen, vacuuming, dusting, and luxury turndown amenity setup.',
    price: 0,
    isComplimentary: true,
    isAvailable: true,
  },
  {
    name: 'Extra Cotton Towels & Pillows',
    category: 'Housekeeping',
    description: 'Additional plush Egyptian cotton bath towels, hand towels, and hypoallergenic pillows.',
    price: 0,
    isComplimentary: true,
    isAvailable: true,
  },
  {
    name: 'Laundry & Express Dry Cleaning',
    category: 'Laundry',
    description: 'Same-day laundry, wash, steam iron, and fold service delivered to your wardrobe.',
    price: 350,
    isComplimentary: false,
    isAvailable: true,
  },
  {
    name: 'Luggage Assistance & Bellboy',
    category: 'Front Desk',
    description: 'Valet luggage handling, check-in baggage delivery, and checkout cart transfer.',
    price: 0,
    isComplimentary: true,
    isAvailable: true,
  },
  {
    name: 'Airport Cab & City Transfer',
    category: 'Concierge',
    description: 'Private chauffeur airport pickup and drop-off in a luxury sedan.',
    price: 1500,
    isComplimentary: false,
    isAvailable: true,
  },
  {
    name: 'Doctor on Call / Medical First Aid',
    category: 'Front Desk',
    description: 'Emergency first aid kit, prescription medicine dispatch, and certified doctor visit.',
    price: 500,
    isComplimentary: false,
    isAvailable: true,
  },
  {
    name: 'Ironing Board & Kit Delivery',
    category: 'Housekeeping',
    description: 'High-temperature steam iron and heavy-duty folding board delivered to your room.',
    price: 0,
    isComplimentary: true,
    isAvailable: true,
  },
];

/**
 * GET Hotel Services (Available to Guests and Staff)
 */
router.get('/hotels/:hotelId/services', authenticate, async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    let targetHotelId = hotelId;
    if (!targetHotelId || targetHotelId === 'undefined' || targetHotelId === 'null') {
      targetHotelId = req.user?.hotelId;
    }
    let hotel = targetHotelId && targetHotelId !== 'undefined' ? await Hotel.findById(targetHotelId) : null;
    if (!hotel) {
      hotel = await Hotel.findOne();
    }
    if (!hotel) return ApiResponse.error(res, 'Hotel not found', 404);
    const resolvedHotelId = String(hotel._id);

    // 1. Fetch hotel-level services created in database
    const allHotelServices = await HotelService.find();
    let hotelServices = allHotelServices.filter(
      (s) => String(s.hotelId) === resolvedHotelId || !s.hotelId
    );

    // Auto-seed default services for this hotel if none exist yet
    if (hotelServices.length === 0) {
      const seeded = [];
      for (const def of DEFAULT_HOTEL_SERVICES) {
        const created = await HotelService.create({
          ...def,
          hotelId: resolvedHotelId,
          enabled: true,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          createdByRole: 'HOTEL_ADMIN',
        });
        seeded.push(created);
      }
      hotelServices = seeded;
    }

    // 2. Format unified service list
    const result = hotelServices.map((s) => ({
      _id: s._id,
      name: s.name,
      category: s.category || 'General',
      description: s.description || '',
      price: Number(s.price) || 0,
      isComplimentary: s.isComplimentary !== undefined ? Boolean(s.isComplimentary) : (Number(s.price) === 0),
      isAvailable: s.isAvailable !== undefined ? Boolean(s.isAvailable) : (s.enabled !== false),
      enabled: s.enabled !== undefined ? Boolean(s.enabled) : true,
      operatingHours: s.operatingHours || { open: '06:00', close: '23:00' },
      createdByRole: s.createdByRole || 'HOTEL_ADMIN',
      createdByName: s.createdByName || 'Management',
      hotelConfig: {
        enabled: s.enabled !== false,
        price: Number(s.price) || 0,
        isComplimentary: Boolean(s.isComplimentary),
        isAvailable: s.isAvailable !== false,
      },
      serviceCatalogue: {
        _id: s._id,
        name: s.name,
        category: s.category || 'General',
        description: s.description || '',
      },
    }));

    return ApiResponse.success(res, 'Hotel services fetched successfully', {
      hotel: { id: hotel._id, name: hotel.name, location: hotel.locationHierarchy },
      services: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/hotels/:hotelId/services
 * Create a new service for the hotel (Hotel Admin, Front Desk Staff, Booking Staff)
 */
router.post('/hotels/:hotelId/services', authenticate, async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    const { name, category, description, price, isComplimentary, isAvailable, propertyId } = req.body;

    if (!name || !name.trim()) {
      return ApiResponse.error(res, 'Service name is required', 400);
    }

    const resolvedHotelId = hotelId || req.user?.hotelId;
    const userRole = req.user?.role || 'HOTEL_ADMIN';
    const userName = req.user?.name || 'Staff Member';

    const numPrice = isComplimentary ? 0 : Number(price) || 0;

    const newService = await HotelService.create({
      hotelId: String(resolvedHotelId),
      propertyId: propertyId ? String(propertyId) : null,
      name: name.trim(),
      category: category?.trim() || 'General',
      description: description?.trim() || '',
      price: numPrice,
      isComplimentary: Boolean(isComplimentary || numPrice === 0),
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      enabled: true,
      status: 'ACTIVE',
      createdByRole: userRole,
      createdByName: userName,
      createdAt: new Date().toISOString(),
    });

    return ApiResponse.success(res, `Service '${newService.name}' added successfully`, newService, 201);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/hotels/:hotelId/services/:serviceId
 * Update service or toggle availability (Hotel Admin, Front Desk Staff, Booking Staff)
 */
router.patch('/hotels/:hotelId/services/:serviceId', authenticate, async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const { name, category, description, price, isComplimentary, isAvailable, enabled } = req.body;

    const service = await HotelService.findById(serviceId);
    if (!service) {
      return ApiResponse.error(res, 'Service not found', 404);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) updateData.price = Number(price);
    if (isComplimentary !== undefined) updateData.isComplimentary = Boolean(isComplimentary);
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);
    if (enabled !== undefined) updateData.enabled = Boolean(enabled);
    updateData.updatedAt = new Date().toISOString();

    const updated = await HotelService.findByIdAndUpdate(serviceId, updateData, { new: true });
    return ApiResponse.success(res, 'Service updated successfully', updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/hotels/:hotelId/services/:serviceId
 * Delete a service
 */
router.delete('/hotels/:hotelId/services/:serviceId', authenticate, async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const deleted = await HotelService.findByIdAndDelete(serviceId);
    if (!deleted) return ApiResponse.error(res, 'Service not found', 404);
    return ApiResponse.success(res, 'Service deleted successfully');
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/service-requests
 * Guest Service Request creation
 */
router.post('/service-requests', authenticate, async (req, res, next) => {
  try {
    let { stayId, serviceCatalogueId, serviceId, guestNotes } = req.body;
    const targetServiceId = serviceCatalogueId || serviceId;

    if (!stayId || stayId === 'undefined' || stayId === 'null' || stayId === 'default-stay') {
      stayId = req.user?.stayId;
    }
    if (!targetServiceId || targetServiceId === 'undefined' || targetServiceId === 'null') {
      return ApiResponse.error(res, 'Valid service ID is required', 400);
    }

    let stay = stayId && stayId !== 'default-stay' && stayId !== 'STAY-ACTIVE' ? await Stay.findById(stayId) : null;
    if (!stay && req.user?.bookingId) {
      stay = await Stay.findOne({ bookingId: req.user.bookingId });
    }
    if (!stay && req.user?.guestId) {
      stay = await Stay.findOne({ guestId: req.user.guestId });
    }
    if (!stay) return ApiResponse.error(res, 'Stay not found', 404);

    // Enforce check-in authentication & verification
    if (stay.status !== 'CHECKED_IN' && stay.status !== 'STAY_ACTIVE') {
      return ApiResponse.error(
        res,
        'Check-In verification required: Please complete contactless check-in with your Aadhaar card and selfie before requesting in-stay services.',
        403
      );
    }

    // Locate requested service
    let service = await HotelService.findById(targetServiceId);
    if (!service) {
      service = await ServiceCatalogue.findById(targetServiceId);
    }
    if (!service) {
      const allServices = await HotelService.find();
      service = allServices.find((s) => String(s._id) === String(targetServiceId));
    }

    if (!service) {
      return ApiResponse.error(res, 'Requested service was not found', 404);
    }

    // Check availability
    if (service.isAvailable === false || service.enabled === false) {
      return ApiResponse.error(
        res,
        `Service "${service.name}" is currently unavailable or under maintenance. Please contact the front desk.`,
        400
      );
    }

    const isFree = Boolean(service.isComplimentary) || Number(service.price) === 0;
    const finalPrice = isFree ? 0 : Number(service.price) || 0;

    // Resolve Room number
    let roomNumber = stay.roomNumber;
    if (!roomNumber && stay.roomId) {
      const room = await Room.findById(stay.roomId);
      roomNumber = room?.roomNumber;
    }

    const request = await ServiceRequest.create({
      hotelId: String(stay.hotelId || req.user?.hotelId || 'HOTEL-DELHI-01'),
      propertyId: stay.propertyId ? String(stay.propertyId) : null,
      stayId: String(stay._id),
      roomId: stay.roomId ? String(stay.roomId) : null,
      roomNumber: roomNumber || 'Assigned Room',
      guestName: req.user?.guestName || req.user?.name || 'Hotel Guest',
      serviceCatalogueId: String(service._id),
      serviceName: service.name,
      serviceCategory: service.category || 'General',
      price: finalPrice,
      isFree,
      guestNotes: guestNotes || 'Requested via Guest Services Portal',
      status: SERVICE_REQUEST_STATUS.PENDING,
      createdAt: new Date().toISOString(),
    });

    // If paid service, charge to guest stay folio
    if (finalPrice > 0) {
      stay.folioBalance = (Number(stay.folioBalance) || 0) + finalPrice;
      await Stay.findByIdAndUpdate(stay._id, { folioBalance: stay.folioBalance });
    }

    return ApiResponse.success(res, 'Guest service request successfully created', request, 201);
  } catch (err) {
    next(err);
  }
});

/**
 * GET Service Requests (Staff Operational Queue, Hotel Admin & In-Stay History)
 * Seamlessly merges Service Requests (Amenities, Housekeeping, Front Desk) and Food Orders (Dining)
 */
router.get('/service-requests', authenticate, async (req, res, next) => {
  try {
    const isSuper = req.user?.role === 'SUPER_ADMIN' || req.tenant?.isSuperAdmin;
    const hotelId = req.tenant?.hotelId || req.user?.hotelId;
    const stayId = req.query.stayId;

    const [allRequests, allOrders] = await Promise.all([
      ServiceRequest.find().catch(() => []),
      FoodOrder.find().catch(() => []),
    ]);

    // Format FoodOrders to match unified operational queue schema
    const formattedOrders = (allOrders || []).map((o) => {
      const itemsList = Array.isArray(o.items) ? o.items : [];
      const itemNames = itemsList.map((it) => `${it.quantity || 1}x ${it.name || 'Dish'}`).join(', ');
      const prepTime = itemsList.find((it) => it.preparationTime)?.preparationTime || '15-20 mins';
      const isFulfilled = o.status === 'DELIVERED' || o.status === 'COMPLETED' || o.status === 'FULFILLED';

      return {
        _id: o._id,
        isFoodOrder: true,
        requestType: 'DINING',
        orderNumber: o.orderNumber || `ORD-${String(o._id).slice(-6)}`,
        serviceCatalogueId: o._id,
        serviceName: itemNames || 'In-Room Dining Order',
        serviceCategory: 'Kitchen / In-Room Dining',
        roomNumber: o.roomNumber || 'Room Assigned',
        guestName: o.guestName || 'In-Stay Guest',
        price: Number(o.totalAmount) || 0,
        isFree: false,
        items: itemsList,
        specialInstructions: o.specialInstructions || '',
        guestNotes: `${itemNames}${prepTime ? ` (Prep: ${prepTime})` : ''}${o.specialInstructions ? ` | ${o.specialInstructions}` : ''}`,
        preparationTime: prepTime,
        status: o.status || 'PLACED',
        isFulfilled,
        assignedTo: o.fulfilledBy || '',
        fulfilledBy: o.fulfilledBy || '',
        completedAt: o.deliveredAt || (isFulfilled ? o.updatedAt : null),
        deliveredAt: o.deliveredAt,
        createdAt: o.createdAt || new Date().toISOString(),
        hotelId: o.hotelId,
        propertyId: o.propertyId,
        stayId: o.stayId,
        bookingId: o.bookingId,
        roomId: o.roomId,
      };
    });

    // Format standard ServiceRequests (Housekeeping, Front Desk, Concierge, Laundry)
    const formattedRequests = (allRequests || []).map((r) => {
      const isFulfilled = r.status === 'COMPLETED' || r.status === 'FULFILLED' || r.status === 'DELIVERED';
      return {
        _id: r._id,
        isFoodOrder: false,
        requestType: 'SERVICE',
        orderNumber: `SRV-${String(r._id).slice(-6).toUpperCase()}`,
        serviceCatalogueId: r.serviceCatalogueId,
        serviceName: r.serviceName || 'Requested Hotel Amenity',
        serviceCategory: r.serviceCategory || 'Housekeeping',
        roomNumber: r.roomNumber || 'Room Assigned',
        guestName: r.guestName || 'In-Stay Guest',
        price: Number(r.price) || 0,
        isFree: Boolean(r.isFree || Number(r.price) === 0),
        items: [{ name: r.serviceName || 'Requested Hotel Amenity', quantity: 1, price: Number(r.price) || 0 }],
        specialInstructions: r.guestNotes || '',
        guestNotes: r.guestNotes || 'Requested via Guest Portal',
        preparationTime: 'Immediate / Next Available Attendant',
        status: r.status || 'PENDING',
        isFulfilled,
        assignedTo: r.assignedTo || '',
        fulfilledBy: r.assignedTo || '',
        staffNotes: r.staffNotes || '',
        completedAt: r.completedAt,
        createdAt: r.createdAt || new Date().toISOString(),
        hotelId: r.hotelId,
        propertyId: r.propertyId,
        stayId: r.stayId,
        roomId: r.roomId,
      };
    });

    const combined = [...formattedRequests, ...formattedOrders];

    let filtered = combined.filter((item) => {
      if (stayId && String(item.stayId) !== String(stayId)) return false;
      if (!isSuper && hotelId) {
        const itemHotelId = String(item.hotelId?._id || item.hotelId || '');
        const targetHotelId = String(hotelId?._id || hotelId);
        if (itemHotelId && targetHotelId && itemHotelId !== targetHotelId && itemHotelId !== 'DEFAULT') {
          return false;
        }
      }
      return true;
    });

    // Sort newest requests to the top
    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return ApiResponse.success(res, 'Service requests fetched', filtered);
  } catch (err) {
    next(err);
  }
});

/**
 * GET Single Service Request or Dining Order Details
 */
router.get('/service-requests/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check FoodOrder
    const order = await FoodOrder.findById(id).catch(() => null);
    if (order) {
      const itemsList = Array.isArray(order.items) ? order.items : [];
      const itemNames = itemsList.map((it) => `${it.quantity || 1}x ${it.name || 'Dish'}`).join(', ');
      const prepTime = itemsList.find((it) => it.preparationTime)?.preparationTime || '15-20 mins';
      const isFulfilled = order.status === 'DELIVERED' || order.status === 'COMPLETED' || order.status === 'FULFILLED';

      return ApiResponse.success(res, 'Dining request details fetched', {
        _id: order._id,
        isFoodOrder: true,
        requestType: 'DINING',
        orderNumber: order.orderNumber,
        serviceName: itemNames || 'In-Room Dining Order',
        serviceCategory: 'Kitchen / In-Room Dining',
        roomNumber: order.roomNumber || 'Room Assigned',
        guestName: order.guestName || 'In-Stay Guest',
        price: Number(order.totalAmount) || 0,
        isFree: false,
        items: itemsList,
        specialInstructions: order.specialInstructions || '',
        guestNotes: order.specialInstructions || itemNames,
        preparationTime: prepTime,
        status: order.status || 'PLACED',
        isFulfilled,
        assignedTo: order.fulfilledBy || '',
        fulfilledBy: order.fulfilledBy || '',
        deliveredAt: order.deliveredAt,
        completedAt: order.deliveredAt,
        createdAt: order.createdAt,
      });
    }

    // Check ServiceRequest
    const srv = await ServiceRequest.findById(id).catch(() => null);
    if (srv) {
      const isFulfilled = srv.status === 'COMPLETED' || srv.status === 'FULFILLED' || srv.status === 'DELIVERED';
      return ApiResponse.success(res, 'Service request details fetched', {
        _id: srv._id,
        isFoodOrder: false,
        requestType: 'SERVICE',
        orderNumber: `SRV-${String(srv._id).slice(-6).toUpperCase()}`,
        serviceName: srv.serviceName || 'Requested Hotel Amenity',
        serviceCategory: srv.serviceCategory || 'Housekeeping',
        roomNumber: srv.roomNumber || 'Room Assigned',
        guestName: srv.guestName || 'In-Stay Guest',
        price: Number(srv.price) || 0,
        isFree: Boolean(srv.isFree || Number(srv.price) === 0),
        items: [{ name: srv.serviceName || 'Requested Hotel Amenity', quantity: 1, price: Number(srv.price) || 0 }],
        specialInstructions: srv.guestNotes || '',
        guestNotes: srv.guestNotes || '',
        preparationTime: 'Immediate / Next Available Attendant',
        status: srv.status || 'PENDING',
        isFulfilled,
        assignedTo: srv.assignedTo || '',
        fulfilledBy: srv.assignedTo || '',
        staffNotes: srv.staffNotes || '',
        completedAt: srv.completedAt,
        createdAt: srv.createdAt,
      });
    }

    return ApiResponse.error(res, 'Request not found', 404);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH Service Request or Dining Order Status (Mark Fulfilled / In-Progress)
 */
router.patch('/service-requests/:id/status', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, fulfilledBy, staffNotes } = req.body;
    const actor = fulfilledBy || assignedTo || req.user?.name || 'Staff Member';
    const nowIso = new Date().toISOString();

    const isFulfillTarget =
      status === 'COMPLETED' ||
      status === 'FULFILLED' ||
      status === 'DELIVERED';

    // 1. Check if target is a FoodOrder
    const order = await FoodOrder.findById(id).catch(() => null);
    if (order) {
      const newStatus = isFulfillTarget ? 'DELIVERED' : (status || 'IN_PROGRESS');
      const updateData = {
        status: newStatus,
        fulfilledBy: actor,
        updatedAt: nowIso,
      };
      if (isFulfillTarget) {
        updateData.deliveredAt = nowIso;
      }

      const updated = await FoodOrder.findByIdAndUpdate(id, updateData, { new: true });
      return ApiResponse.success(res, `Dining order marked as ${newStatus} by ${actor}`, updated);
    }

    // 2. Otherwise update ServiceRequest
    const newStatus = isFulfillTarget ? 'COMPLETED' : (status || 'IN_PROGRESS');
    const updateData = {
      status: newStatus,
      assignedTo: actor,
      updatedAt: nowIso,
    };
    if (staffNotes) updateData.staffNotes = staffNotes;
    if (isFulfillTarget) {
      updateData.completedAt = nowIso;
    }

    const updated = await ServiceRequest.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return ApiResponse.error(res, 'Service request or food order not found', 404);

    return ApiResponse.success(res, `Service request marked as ${newStatus} by ${actor}`, updated);
  } catch (err) {
    next(err);
  }
});

export default router;
