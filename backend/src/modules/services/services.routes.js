import { Router } from 'express';
import { HotelService, ServiceRequest, SERVICE_REQUEST_STATUS } from './services.model.js';
import { ServiceCatalogue } from '../serviceCatalogue/serviceCatalogue.model.js';
import { Hotel } from '../hotels/hotels.model.js';
import { HotelSubscription } from '../subscriptions/subscriptions.model.js';
import { ServiceAvailabilityService } from '../serviceAvailability/serviceAvailability.service.js';
import { Stay } from '../stays/stays.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';

const router = Router();

/**
 * GET Hotel Services (Location & Plan Eligible + Hotel Configured)
 */
router.get('/hotels/:hotelId/services', authenticate, async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    if (!hotelId || hotelId === 'undefined' || hotelId === 'null') {
      return ApiResponse.error(res, 'Valid hotelId parameter is required', 400);
    }
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return ApiResponse.error(res, 'Hotel not found', 404);

    const subscription = await HotelSubscription.findOne({ hotelId }).populate('planId');
    const planCode = subscription?.planId?.code || 'FREE';

    // 1. Get location-eligible & subscription-eligible services from Super Admin rules
    const eligibleList = await ServiceAvailabilityService.getEligibleServicesForHotel({
      country: hotel.locationHierarchy?.country || '',
      state: hotel.locationHierarchy?.state || '',
      city: hotel.locationHierarchy?.city || '',
      localArea: hotel.locationHierarchy?.localArea || null,
      planCode,
    });

    // 2. Fetch hotel-level configurations
    const hotelConfigs = await HotelService.find({ hotelId });
    const configMap = new Map();
    hotelConfigs.forEach((c) => {
      if (c.serviceId) {
        configMap.set(c.serviceId.toString(), c);
      }
    });

    // 3. Merge eligible catalogue services with hotel admin settings
    const result = eligibleList.map((item) => {
      const serviceIdStr = item.service?._id ? item.service._id.toString() : null;
      const config = serviceIdStr ? configMap.get(serviceIdStr) : null;
      return {
        serviceCatalogue: item.service,
        isFreeEntitlement: item.isFree,
        hotelConfig: config || {
          enabled: false,
          price: item.isFree ? 0 : 500,
          isComplimentary: item.isFree,
          operatingHours: { open: '06:00', close: '23:00' },
          status: 'ACTIVE',
        },
      };
    });

    return ApiResponse.success(res, 'Hotel eligible & configured services fetched', {
      hotel: { id: hotel._id, name: hotel.name, location: hotel.locationHierarchy },
      planCode,
      services: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH Hotel Admin Service Enablement, Custom Pricing & Operating Hours
 */
router.patch('/hotels/:hotelId/services/:serviceId', authenticate, async (req, res, next) => {
  try {
    const { hotelId, serviceId } = req.params;
    const { enabled, price, isComplimentary, operatingHours, propertyId } = req.body;

    const updated = await HotelService.findOneAndUpdate(
      { hotelId, serviceId },
      {
        hotelId,
        propertyId: propertyId || req.tenant?.propertyId,
        serviceId,
        enabled: enabled !== undefined ? enabled : true,
        price: price !== undefined ? price : 0,
        isComplimentary: isComplimentary || false,
        operatingHours: operatingHours || { open: '06:00', close: '23:00' },
      },
      { upsert: true, new: true }
    ).populate('serviceId');

    return ApiResponse.success(res, 'Hotel service configuration updated', updated);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/service-requests
 * Guest Service Request creation with FULL 5-TIER BACKEND VALIDATION
 */
router.post('/service-requests', authenticate, async (req, res, next) => {
  try {
    const { stayId, serviceCatalogueId, guestNotes } = req.body;
    if (!stayId || stayId === 'undefined' || stayId === 'null') {
      return ApiResponse.error(res, 'Valid stayId is required to request a service', 400);
    }
    if (!serviceCatalogueId || serviceCatalogueId === 'undefined' || serviceCatalogueId === 'null') {
      return ApiResponse.error(res, 'Valid serviceCatalogueId is required', 400);
    }

    const stay = await Stay.findById(stayId).populate('hotelId');
    if (!stay) return ApiResponse.error(res, 'Stay not found', 404);

    const hotel = stay.hotelId;
    const subscription = await HotelSubscription.findOne({ hotelId: hotel._id }).populate('planId');
    const planCode = subscription?.planId?.code || 'FREE';

    // Tier 1 - 4: Check Super Admin Location and Plan Eligibility
    const eligibleServices = await ServiceAvailabilityService.getEligibleServicesForHotel({
      country: hotel.locationHierarchy.country,
      state: hotel.locationHierarchy.state,
      city: hotel.locationHierarchy.city,
      localArea: hotel.locationHierarchy.localArea,
      planCode,
    });

    const isCatalogueEligible = eligibleServices.find(
      (e) => e.service._id.toString() === serviceCatalogueId.toString()
    );

    if (!isCatalogueEligible) {
      return ApiResponse.error(
        res,
        'SECURITY REJECTION: Service is not eligible for this hotel geographic location or subscription plan',
        403
      );
    }

    // Tier 5: Check Hotel Admin Enablement
    const hotelConfig = await HotelService.findOne({
      hotelId: hotel._id,
      serviceId: serviceCatalogueId,
      enabled: true,
    });

    if (!hotelConfig) {
      return ApiResponse.error(
        res,
        'Service is currently not enabled or offered by this hotel property',
        403
      );
    }

    const isFree = isCatalogueEligible.isFree || hotelConfig.isComplimentary;
    const finalPrice = isFree ? 0 : hotelConfig.price;

    const request = await ServiceRequest.create({
      hotelId: hotel._id,
      propertyId: stay.propertyId,
      stayId: stay._id,
      roomId: stay.roomId,
      serviceCatalogueId,
      hotelServiceId: hotelConfig._id,
      price: finalPrice,
      isFree,
      guestNotes,
      status: SERVICE_REQUEST_STATUS.PENDING,
    });

    // If paid service, charge to guest stay folio
    if (finalPrice > 0) {
      stay.folioBalance = (stay.folioBalance || 0) + finalPrice;
      await stay.save();
    }

    return ApiResponse.success(res, 'Guest service request successfully created', request, 201);
  } catch (err) {
    next(err);
  }
});

/**
 * GET Service Requests (Staff Operational Queue)
 */
router.get('/service-requests', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const filter = req.tenant.isSuperAdmin && !req.tenant.hotelId ? {} : { hotelId: req.tenant.hotelId };
    if (req.query.stayId) filter.stayId = req.query.stayId;

    const requests = await ServiceRequest.find(filter)
      .populate('serviceCatalogueId', 'name category icon')
      .populate('roomId', 'roomNumber floor')
      .populate('assignedTo', 'name role')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, 'Service requests fetched', requests);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH Service Request Status & Assignment
 */
router.patch('/service-requests/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status, assignedTo } = req.body;
    const updateData = { status };
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (status === SERVICE_REQUEST_STATUS.COMPLETED) {
      updateData.completedAt = new Date();
    }

    const updated = await ServiceRequest.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('serviceCatalogueId')
      .populate('assignedTo', 'name');

    return ApiResponse.success(res, `Service request marked as ${status}`, updated);
  } catch (err) {
    next(err);
  }
});

export default router;
