import { Router } from 'express';
import { Property } from './properties.model.js';
import { Room } from '../rooms/rooms.model.js';
import { Hotel } from '../hotels/hotels.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';

const router = Router();

/**
 * List all properties for the active tenant / admin, or all for SuperAdmin
 */
router.get('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const isSuper = req.user?.role === 'SUPER_ADMIN';
    const hotelId = req.tenant.hotelId || req.user?.hotelId;
    const userId = req.user?.id || req.user?._id;

    let properties = await Property.find();
    const hotels = await Hotel.find();
    const rooms = await Room.find();

    if (!isSuper) {
      properties = properties.filter((p) => {
        const matchesHotel = hotelId && String(p.hotelId?._id || p.hotelId) === String(hotelId);
        const matchesAdmin = userId && String(p.adminId) === String(userId);
        return matchesHotel || matchesAdmin;
      });
    }

    // Enrich with hotel details and live room metrics
    const enriched = properties.map((prop) => {
      const pId = String(prop._id);
      const propRooms = rooms.filter((r) => String(r.propertyId?._id || r.propertyId) === pId);
      const hotel = hotels.find((h) => String(h._id) === String(prop.hotelId?._id || prop.hotelId));

      return {
        ...prop,
        hotelName: hotel ? hotel.name : 'Primary Hotel Group',
        hotelCode: hotel ? hotel.code : '',
        totalRooms: propRooms.length || prop.totalRooms || 0,
        availableRooms: propRooms.filter((r) => r.status === 'AVAILABLE').length,
        occupiedRooms: propRooms.filter((r) => r.status === 'OCCUPIED').length,
        cleaningRooms: propRooms.filter((r) => r.status === 'CLEANING').length,
        maintenanceRooms: propRooms.filter((r) => r.status === 'MAINTENANCE').length,
      };
    });

    return ApiResponse.success(res, 'Properties fetched successfully', enriched);
  } catch (err) {
    next(err);
  }
});

/**
 * Get single property by ID
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) {
      return ApiResponse.error(res, 'Property not found', 404);
    }
    return ApiResponse.success(res, 'Property details fetched', prop);
  } catch (err) {
    next(err);
  }
});

/**
 * Create a new property (Hotel Admin or Super Admin)
 */
router.post('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const {
      name,
      code,
      address,
      city,
      state,
      country,
      phone,
      email,
      description,
      totalRooms,
      images,
    } = req.body;

    if (!name || !name.trim()) {
      return ApiResponse.error(res, 'Property name is required', 400);
    }

    const hotelId = req.body.hotelId || req.tenant.hotelId || req.user?.hotelId || 'HOTEL-DELHI-01';
    const adminId = req.user?.id || req.user?._id;

    const generatedCode =
      code?.trim() ||
      name
        .trim()
        .substring(0, 3)
        .toUpperCase() +
        '-' +
        Math.floor(100 + Math.random() * 900);

    const newProperty = await Property.create({
      name: name.trim(),
      code: generatedCode,
      address: address?.trim() || '',
      city: city?.trim() || 'New Delhi',
      state: state?.trim() || 'Delhi',
      country: country?.trim() || 'India',
      phone: phone?.trim() || req.user?.phone || '',
      email: email?.trim() || req.user?.email || '',
      description: description?.trim() || '',
      totalRooms: Number(totalRooms) || 0,
      images: Array.isArray(images) ? images : [],
      hotelId: String(hotelId),
      adminId: adminId ? String(adminId) : null,
      createdAt: new Date().toISOString(),
    });

    return ApiResponse.success(res, `Property '${newProperty.name}' created successfully`, newProperty, 201);
  } catch (err) {
    next(err);
  }
});

/**
 * Update property details
 */
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { name, code, address, city, state, country, phone, email, description, totalRooms, images } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (code) updateData.code = code.trim();
    if (address !== undefined) updateData.address = address.trim();
    if (city !== undefined) updateData.city = city.trim();
    if (state !== undefined) updateData.state = state.trim();
    if (country !== undefined) updateData.country = country.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (totalRooms !== undefined) updateData.totalRooms = Number(totalRooms);
    if (images !== undefined) updateData.images = images;

    const updated = await Property.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      return ApiResponse.error(res, 'Property not found', 404);
    }
    return ApiResponse.success(res, `Property updated successfully`, updated);
  } catch (err) {
    next(err);
  }
});

/**
 * Delete property
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const prop = await Property.findById(id);
    if (!prop) {
      return ApiResponse.error(res, 'Property not found', 404);
    }

    await Property.deleteMany({ _id: id });
    return ApiResponse.success(res, `Property '${prop.name}' deleted successfully`);
  } catch (err) {
    next(err);
  }
});

export default router;
