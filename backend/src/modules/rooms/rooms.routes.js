import { Router } from 'express';
import { Room, RoomType } from './rooms.model.js';
import { Property } from '../properties/properties.model.js';
import { Hotel } from '../hotels/hotels.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';

const router = Router();

// Default high-resolution curated hospitality photography
const DEFAULT_ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80', // Deluxe Suite
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', // Luxury King Bedroom
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', // Executive Suite
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', // Modern Cozy Room
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', // Heritage Hotel Bed
];

const DEFAULT_AMENITIES = [
  'King Size Plush Bed',
  'Smart 4K Ultra-HD TV',
  'High-Speed Wi-Fi 6',
  'Mini Bar & Refrigerator',
  'Climate Controlled AC',
  'Premium Espresso Machine',
  'Electronic Safe Locker',
];

const DEFAULT_INVENTORY = [
  { name: 'Egyptian Cotton Bath Towels', quantity: 4, category: 'Linen' },
  { name: 'Feather Comfort Pillows', quantity: 4, category: 'Bedding' },
  { name: 'Luxury Cotton Bathrobes', quantity: 2, category: 'Linen' },
  { name: 'Nespresso Pods & Kettle Set', quantity: 1, category: 'Appliances' },
  { name: 'High-Velocity Hair Dryer', quantity: 1, category: 'Appliances' },
  { name: 'RFID Smart Room Keys', quantity: 2, category: 'Access' },
];

/**
 * Fetch all rooms, with full enrichment (property, room type, images, amenities, inventory)
 */
router.get('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const isSuper = req.user?.role === 'SUPER_ADMIN';
    const hotelId = req.tenant.hotelId || req.user?.hotelId;
    const { propertyId, status } = req.query;

    const [allRooms, allProperties, allTypes, allHotels] = await Promise.all([
      Room.find(),
      Property.find(),
      RoomType.find(),
      Hotel.find(),
    ]);

    let filtered = allRooms;

    if (!isSuper) {
      filtered = filtered.filter((r) => {
        const matchesHotel = hotelId && String(r.hotelId?._id || r.hotelId) === String(hotelId);
        return matchesHotel;
      });
    }

    if (propertyId) {
      filtered = filtered.filter((r) => String(r.propertyId?._id || r.propertyId) === String(propertyId));
    }

    if (status && status !== 'ALL') {
      filtered = filtered.filter((r) => r.status === status);
    }

    // Enrich each room with property, roomType, images, amenities, and inventory
    const enrichedRooms = filtered.map((room, index) => {
      const pId = String(room.propertyId?._id || room.propertyId);
      const property = allProperties.find((p) => String(p._id) === pId);

      const tId = String(room.roomTypeId?._id || room.roomTypeId);
      const rType = allTypes.find((t) => String(t._id) === tId);

      const hId = String(room.hotelId?._id || room.hotelId || property?.hotelId);
      const hotel = allHotels.find((h) => String(h._id) === hId);

      // Safe fallback images
      const images = Array.isArray(room.images) && room.images.length > 0
        ? room.images
        : [DEFAULT_ROOM_IMAGES[index % DEFAULT_ROOM_IMAGES.length]];

      // Safe fallback amenities ("What's in the room")
      const amenities = Array.isArray(room.amenities) && room.amenities.length > 0
        ? room.amenities
        : (rType?.amenities?.length ? rType.amenities : DEFAULT_AMENITIES);

      // Safe fallback inventory
      const inventory = Array.isArray(room.inventory) && room.inventory.length > 0
        ? room.inventory
        : DEFAULT_INVENTORY;

      return {
        ...room,
        propertyName: property ? property.name : 'Main Property',
        propertyCode: property ? property.code : '',
        propertyAddress: property ? property.address : '',
        propertyCity: property ? property.city : '',
        hotelName: hotel ? hotel.name : 'Hotel Group',
        roomTypeName: room.roomTypeName || rType?.name || 'Deluxe Heritage Suite',
        pricePerNight: room.pricePerNight || rType?.basePrice || 4500,
        images,
        amenities,
        inventory,
      };
    });

    return ApiResponse.success(res, 'Rooms inventory fetched successfully', enrichedRooms);
  } catch (err) {
    next(err);
  }
});

/**
 * Fetch room types
 */
router.get('/types', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const isSuper = req.user?.role === 'SUPER_ADMIN';
    const hotelId = req.tenant.hotelId || req.user?.hotelId;

    let types = await RoomType.find();
    if (!isSuper && hotelId) {
      types = types.filter((t) => !t.hotelId || String(t.hotelId) === String(hotelId));
    }
    return ApiResponse.success(res, 'Room types fetched', types);
  } catch (err) {
    next(err);
  }
});

/**
 * Create a new room with images, what's in the room, and inventory
 */
router.post('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const {
      roomNumber,
      floor,
      roomTypeId,
      roomTypeName,
      propertyId,
      pricePerNight,
      images,
      amenities,
      inventory,
      status,
    } = req.body;

    if (!roomNumber || !roomNumber.trim()) {
      return ApiResponse.error(res, 'Room number is required', 400);
    }

    // Determine target property
    let targetPropertyId = propertyId;
    if (!targetPropertyId) {
      const properties = await Property.find();
      const userHotelId = req.tenant.hotelId || req.user?.hotelId;
      const hotelProp = properties.find((p) => String(p.hotelId?._id || p.hotelId) === String(userHotelId));
      targetPropertyId = hotelProp?._id || properties[0]?._id;
    }

    const prop = targetPropertyId ? await Property.findById(targetPropertyId) : null;
    const hotelId = prop?.hotelId || req.tenant.hotelId || req.user?.hotelId || 'HOTEL-DELHI-01';

    // Room Type resolution
    let finalRoomTypeId = roomTypeId;
    let finalTypeName = roomTypeName || 'Deluxe Suite';

    if (!finalRoomTypeId && roomTypeName) {
      const existingType = await RoomType.findOne({ name: roomTypeName });
      if (existingType) {
        finalRoomTypeId = existingType._id;
      } else {
        const createdType = await RoomType.create({
          hotelId,
          propertyId: targetPropertyId,
          name: roomTypeName,
          code: roomTypeName.substring(0, 3).toUpperCase(),
          basePrice: Number(pricePerNight) || 4500,
          amenities: Array.isArray(amenities) ? amenities : DEFAULT_AMENITIES,
        });
        finalRoomTypeId = createdType._id;
      }
    }

    // Curate images
    let finalImages = Array.isArray(images) && images.length > 0 ? images.filter(Boolean) : [];
    if (finalImages.length === 0) {
      finalImages = [DEFAULT_ROOM_IMAGES[Math.floor(Math.random() * DEFAULT_ROOM_IMAGES.length)]];
    }

    // Curate amenities ("What's in the room")
    let finalAmenities = Array.isArray(amenities) && amenities.length > 0 ? amenities : DEFAULT_AMENITIES;

    // Curate inventory
    let finalInventory = Array.isArray(inventory) && inventory.length > 0 ? inventory : DEFAULT_INVENTORY;

    const newRoom = await Room.create({
      hotelId: String(hotelId),
      propertyId: String(targetPropertyId),
      roomTypeId: finalRoomTypeId ? String(finalRoomTypeId) : null,
      roomTypeName: finalTypeName,
      roomNumber: roomNumber.trim(),
      floor: Number(floor) || 1,
      pricePerNight: Number(pricePerNight) || 4500,
      status: status || 'AVAILABLE',
      images: finalImages,
      amenities: finalAmenities,
      inventory: finalInventory,
      createdAt: new Date().toISOString(),
    });

    return ApiResponse.success(res, `Room ${newRoom.roomNumber} added to inventory successfully!`, newRoom, 201);
  } catch (err) {
    next(err);
  }
});

/**
 * Update room details (status, images, amenities, inventory, etc.)
 */
router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status, roomNumber, floor, roomTypeId, roomTypeName, pricePerNight, images, amenities, inventory } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (roomNumber) updateData.roomNumber = roomNumber.trim();
    if (floor !== undefined) updateData.floor = Number(floor);
    if (roomTypeId) updateData.roomTypeId = roomTypeId;
    if (roomTypeName) updateData.roomTypeName = roomTypeName;
    if (pricePerNight !== undefined) updateData.pricePerNight = Number(pricePerNight);
    if (images !== undefined) updateData.images = images;
    if (amenities !== undefined) updateData.amenities = amenities;
    if (inventory !== undefined) updateData.inventory = inventory;

    const room = await Room.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!room) {
      return ApiResponse.error(res, 'Room not found', 404);
    }
    return ApiResponse.success(res, `Room ${room.roomNumber} updated successfully`, room);
  } catch (err) {
    next(err);
  }
});

/**
 * Full update room
 */
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { status, roomNumber, floor, roomTypeId, roomTypeName, pricePerNight, images, amenities, inventory } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (roomNumber) updateData.roomNumber = roomNumber.trim();
    if (floor !== undefined) updateData.floor = Number(floor);
    if (roomTypeId) updateData.roomTypeId = roomTypeId;
    if (roomTypeName) updateData.roomTypeName = roomTypeName;
    if (pricePerNight !== undefined) updateData.pricePerNight = Number(pricePerNight);
    if (images !== undefined) updateData.images = images;
    if (amenities !== undefined) updateData.amenities = amenities;
    if (inventory !== undefined) updateData.inventory = inventory;

    const room = await Room.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!room) {
      return ApiResponse.error(res, 'Room not found', 404);
    }
    return ApiResponse.success(res, `Room ${room.roomNumber} updated successfully`, room);
  } catch (err) {
    next(err);
  }
});

/**
 * Delete a room
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room) {
      return ApiResponse.error(res, 'Room not found', 404);
    }
    await Room.deleteMany({ _id: id });
    return ApiResponse.success(res, `Room ${room.roomNumber} removed from inventory`);
  } catch (err) {
    next(err);
  }
});

export default router;
