import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Booking } from './bookings.model.js';
import { Guest } from '../guests/guests.model.js';
import { Room } from '../rooms/rooms.model.js';
import { Stay } from '../stays/stays.model.js';
import { Property } from '../properties/properties.model.js';
import { Hotel } from '../hotels/hotels.model.js';
import { GUEST_JOURNEY_STATES } from '../stays/stays.constants.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';
import { ENV } from '../../config/env.js';

const router = Router();

/**
 * Generate Guest JWT Token for seamless 60-second express check-in or stay access
 */
function generateGuestToken(payload) {
  return jwt.sign(
    {
      isGuest: true,
      role: 'GUEST',
      ...payload,
    },
    ENV.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Helper to ensure today's bookings are always available for demonstration & live operations
 */
async function ensureTodayBookings(hotelId, propertyId) {
  const existingBookings = await Booking.find();
  if (existingBookings.length > 0) return existingBookings;

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const hId = hotelId || 'HOTEL-DELHI-01';
  const pId = propertyId || 'PROP-DELHI-01';

  // Seed sample guest 1
  let guest1 = await Guest.findOne({ email: 'aarav.mehta@gmail.com' });
  if (!guest1) {
    guest1 = await Guest.create({
      hotelId: hId,
      name: 'Aarav Mehta',
      phone: '+91 98765 43210',
      email: 'aarav.mehta@gmail.com',
      idType: 'AADHAAR',
      idNumber: '4126-3082-2252',
      isVerified: true,
    });
  }

  // Seed sample guest 2
  let guest2 = await Guest.findOne({ email: 'priya.sharma@example.com' });
  if (!guest2) {
    guest2 = await Guest.create({
      hotelId: hId,
      name: 'Priya Sharma',
      phone: '+91 98112 34567',
      email: 'priya.sharma@example.com',
      idType: 'PASSPORT',
      idNumber: 'Z9821453',
      isVerified: false,
    });
  }

  // Seed sample guest 3
  let guest3 = await Guest.findOne({ email: 'rohan.gupta@corp.in' });
  if (!guest3) {
    guest3 = await Guest.create({
      hotelId: hId,
      name: 'Rohan Gupta',
      phone: '+91 99201 88472',
      email: 'rohan.gupta@corp.in',
      idType: 'DRIVING_LICENSE',
      idNumber: 'DL-042019001234',
      isVerified: true,
    });
  }

  // Find rooms
  const rooms = await Room.find();
  const room302 = rooms.find((r) => r.roomNumber === '302') || rooms[0];
  const room303 = rooms.find((r) => r.roomNumber === '303') || rooms[1] || rooms[0];

  const booking1 = await Booking.create({
    bookingNumber: 'BK-DELHI-101',
    hotelId: hId,
    propertyId: pId,
    guestId: guest1._id,
    roomId: room302?._id,
    roomNumber: room302?.roomNumber || '302',
    roomTypeName: room302?.roomTypeName || 'Deluxe Suite',
    checkInDate: todayStr,
    checkOutDate: tomorrow,
    totalAmount: 4500,
    status: 'CHECKED_IN',
    source: 'WEB_DIRECT',
    createdAt: new Date().toISOString(),
  });

  const booking2 = await Booking.create({
    bookingNumber: 'BK-DELHI-102',
    hotelId: hId,
    propertyId: pId,
    guestId: guest2._id,
    roomId: room303?._id,
    roomNumber: room303?.roomNumber || '303',
    roomTypeName: room303?.roomTypeName || 'Luxury King Bedroom',
    checkInDate: todayStr,
    checkOutDate: tomorrow,
    totalAmount: 6200,
    status: 'CONFIRMED',
    source: 'OTA_MAKEMYTRIP',
    createdAt: new Date().toISOString(),
  });

  const booking3 = await Booking.create({
    bookingNumber: 'BK-DELHI-103',
    hotelId: hId,
    propertyId: pId,
    guestId: guest3._id,
    roomId: null,
    roomNumber: 'Unassigned',
    roomTypeName: 'Executive Suite',
    checkInDate: todayStr,
    checkOutDate: tomorrow,
    totalAmount: 8500,
    status: 'CONFIRMED',
    source: 'CORPORATE',
    createdAt: new Date().toISOString(),
  });

  return [booking1, booking2, booking3];
}

/**
 * GET /api/v1/bookings
 * Fetch all bookings enriched with guest and stay details
 */
router.get('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const isSuper = req.tenant.isSuperAdmin && !req.tenant.hotelId;
    const filter = isSuper ? {} : { hotelId: req.tenant.hotelId };

    let bookings = await Booking.find(filter);
    if (bookings.length === 0) {
      bookings = await ensureTodayBookings(req.tenant.hotelId, req.tenant.propertyId);
    }

    const [allGuests, allRooms, allStays, allProperties] = await Promise.all([
      Guest.find(),
      Room.find(),
      Stay.find(),
      Property.find(),
    ]);

    const enriched = bookings.map((b) => {
      const guest = allGuests.find((g) => String(g._id) === String(b.guestId?._id || b.guestId));
      const room = allRooms.find((r) => String(r._id) === String(b.roomId?._id || b.roomId));
      const stay = allStays.find((s) => String(s.bookingId?._id || s.bookingId) === String(b._id));
      const property = allProperties.find((p) => String(p._id) === String(b.propertyId?._id || b.propertyId));

      return {
        ...b,
        _id: b._id,
        id: b._id,
        bookingNumber: b.bookingNumber || `BK-${b._id?.slice(-6).toUpperCase()}`,
        guestName: guest?.name || b.guestName || 'Valued Guest',
        guestPhone: guest?.phone || b.guestPhone || '',
        guestEmail: guest?.email || b.guestEmail || '',
        idType: guest?.idType || b.idType || 'AADHAAR',
        idNumber: guest?.idNumber || b.idNumber || '',
        roomNumber: room?.roomNumber || b.roomNumber || 'Unassigned',
        roomTypeName: room?.roomTypeName || b.roomTypeName || 'Deluxe Room',
        propertyName: property?.name || 'Main Property',
        stayId: stay?._id || null,
        stayStatus: stay?.status || (b.status === 'CHECKED_IN' ? 'STAY_ACTIVE' : 'CHECK_IN_PENDING'),
        magicLink: `/stay/${b.bookingNumber || b._id}`,
      };
    });

    return ApiResponse.success(res, 'Bookings fetched', enriched);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/bookings/today
 * Dedicated endpoint for Admin & Reception: Today's Bookings and Scheduled Arrivals
 */
router.get('/today', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const isSuper = req.tenant.isSuperAdmin && !req.tenant.hotelId;
    const filter = isSuper ? {} : { hotelId: req.tenant.hotelId };

    let bookings = await Booking.find(filter);
    if (bookings.length === 0) {
      bookings = await ensureTodayBookings(req.tenant.hotelId, req.tenant.propertyId);
    }

    const [allGuests, allRooms, allStays, allProperties] = await Promise.all([
      Guest.find(),
      Room.find(),
      Stay.find(),
      Property.find(),
    ]);

    const enriched = bookings.map((b) => {
      const guest = allGuests.find((g) => String(g._id) === String(b.guestId?._id || b.guestId));
      const room = allRooms.find((r) => String(r._id) === String(b.roomId?._id || b.roomId));
      const stay = allStays.find((s) => String(s.bookingId?._id || s.bookingId) === String(b._id));
      const property = allProperties.find((p) => String(p._id) === String(b.propertyId?._id || b.propertyId));

      const isCheckedIn = b.status === 'CHECKED_IN' || stay?.status === 'STAY_ACTIVE' || stay?.status === 'CHECKED_IN';

      return {
        ...b,
        _id: b._id,
        id: b._id,
        bookingNumber: b.bookingNumber || `BK-${b._id?.slice(-6).toUpperCase()}`,
        guestName: guest?.name || b.guestName || 'Valued Guest',
        guestPhone: guest?.phone || b.guestPhone || '',
        guestEmail: guest?.email || b.guestEmail || '',
        idType: guest?.idType || b.idType || 'AADHAAR',
        idNumber: guest?.idNumber || b.idNumber || '',
        roomNumber: room?.roomNumber || b.roomNumber || 'Unassigned',
        roomId: room?._id || b.roomId || null,
        roomTypeName: room?.roomTypeName || b.roomTypeName || 'Deluxe Room',
        propertyName: property?.name || 'Main Property',
        stayId: stay?._id || null,
        stayStatus: isCheckedIn ? 'STAY_ACTIVE' : (b.status === 'CHECKED_OUT' ? 'CHECKED_OUT' : 'CHECK_IN_PENDING'),
        isWalkIn: b.source === 'WALK_IN' || b.isWalkIn === true,
        magicLink: `/stay/${b.bookingNumber || b._id}`,
      };
    });

    // Sort today's arrivals first (Pending arrivals first, then Active, then Checked Out)
    const priority = { CHECK_IN_PENDING: 1, CONFIRMED: 2, STAY_ACTIVE: 3, CHECKED_IN: 4, CHECKED_OUT: 5 };
    enriched.sort((a, b) => (priority[a.stayStatus] || 9) - (priority[b.stayStatus] || 9));

    return ApiResponse.success(res, "Today's bookings and arrivals", enriched);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/bookings
 * Create Walk-In or On-The-Spot Guest Registration
 */
router.post('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const {
      guestName,
      phone,
      email,
      idType,
      idNumber,
      propertyId,
      roomId,
      roomNumber,
      roomTypeName,
      checkInDate,
      checkOutDate,
      totalAmount,
      isWalkIn = true,
      directCheckIn = true,
      notes,
    } = req.body;

    if (!guestName || !guestName.trim()) {
      return ApiResponse.error(res, 'Guest full name is required', 400);
    }

    const hotelId = req.tenant.hotelId || req.user?.hotelId || 'HOTEL-DELHI-01';

    // 1. Resolve Target Property
    let targetPropId = propertyId || req.tenant.propertyId;
    if (!targetPropId) {
      const props = await Property.find();
      const match = props.find((p) => String(p.hotelId?._id || p.hotelId) === String(hotelId));
      targetPropId = match?._id || props[0]?._id;
    }
    const property = targetPropId ? await Property.findById(targetPropId) : null;
    const propCode = property?.code || 'AURA';

    // 2. Find or Create Guest Profile
    let guest = null;
    if (phone) {
      guest = await Guest.findOne({ phone: phone.trim() });
    }
    if (!guest && email) {
      guest = await Guest.findOne({ email: email.trim().toLowerCase() });
    }

    if (!guest) {
      guest = await Guest.create({
        hotelId: String(hotelId),
        propertyId: String(targetPropId),
        name: guestName.trim(),
        phone: phone ? phone.trim() : '',
        email: email ? email.trim().toLowerCase() : '',
        idType: idType || 'AADHAAR',
        idNumber: idNumber || '',
        isVerified: Boolean(idNumber),
        createdAt: new Date().toISOString(),
      });
    } else {
      // Update missing info
      const updates = {};
      if (idType) updates.idType = idType;
      if (idNumber) updates.idNumber = idNumber;
      if (phone && !guest.phone) updates.phone = phone.trim();
      if (email && !guest.email) updates.email = email.trim().toLowerCase();
      if (Object.keys(updates).length > 0) {
        await Guest.findByIdAndUpdate(guest._id, updates);
      }
    }

    // 3. Resolve Room
    let resolvedRoom = null;
    if (roomId) {
      resolvedRoom = await Room.findById(roomId);
    } else if (roomNumber) {
      resolvedRoom = await Room.findOne({ roomNumber: String(roomNumber).trim() });
    }

    // 4. Generate unique Booking Reference
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const bookingNumber = `BK-${propCode}-${dateCode}-${randomSuffix}`;

    const todayStr = new Date().toISOString().split('T')[0];
    const finalCheckInDate = checkInDate || todayStr;
    const finalCheckOutDate = checkOutDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const finalTariff = Number(totalAmount) || resolvedRoom?.pricePerNight || 4500;

    // 4b. Strict Date-Aware Allotment Conflict Check: A room cannot be double-booked for overlapping dates
    if (resolvedRoom) {
      const allRoomBookings = await Booking.find({ roomId: String(resolvedRoom._id) });
      const reqStart = new Date(finalCheckInDate).getTime();
      const reqEnd = new Date(finalCheckOutDate).getTime();

      const conflictingBooking = allRoomBookings.find((b) => {
        if (b.status === 'CANCELLED' || b.status === 'CHECKED_OUT') return false;
        const bStart = new Date(b.checkInDate).getTime();
        const bEnd = new Date(b.checkOutDate).getTime();
        return reqStart < bEnd && reqEnd > bStart;
      });

      if (conflictingBooking) {
        return ApiResponse.error(
          res,
          `Room ${resolvedRoom.roomNumber} is already allotted from ${conflictingBooking.checkInDate} to ${conflictingBooking.checkOutDate} for guest "${conflictingBooking.guestName}". Please select an unallotted room.`,
          409
        );
      }
    }

    // 5. Create Booking
    const newBooking = await Booking.create({
      bookingNumber,
      hotelId: String(hotelId),
      propertyId: String(targetPropId),
      guestId: guest._id,
      guestName: guest.name,
      guestPhone: guest.phone,
      guestEmail: guest.email,
      roomId: resolvedRoom?._id || null,
      roomNumber: resolvedRoom?.roomNumber || roomNumber || 'Unassigned',
      roomTypeName: resolvedRoom?.roomTypeName || roomTypeName || 'Deluxe Room',
      checkInDate: finalCheckInDate,
      checkOutDate: finalCheckOutDate,
      totalAmount: finalTariff,
      status: directCheckIn ? 'CHECKED_IN' : 'CONFIRMED',
      source: isWalkIn ? 'WALK_IN' : 'FRONT_DESK',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    });

    // 6. Generate QR token & hash
    const rawQrToken = crypto.randomBytes(16).toString('hex');
    const qrTokenHash = crypto.createHash('sha256').update(rawQrToken).digest('hex');

    // 7. Create Stay Record
    const stayStatus = directCheckIn ? GUEST_JOURNEY_STATES.STAY_ACTIVE : 'BOOKING_CONFIRMED';
    const nowIso = new Date().toISOString();

    const stay = await Stay.create({
      hotelId: String(hotelId),
      propertyId: String(targetPropId),
      bookingId: newBooking._id,
      guestId: guest._id,
      roomId: resolvedRoom?._id || null,
      roomNumber: resolvedRoom?.roomNumber || roomNumber || 'Unassigned',
      status: stayStatus,
      checkInToken: rawQrToken,
      qrTokenHash,
      checkedInAt: directCheckIn ? nowIso : null,
      idType: idType || guest.idType || 'AADHAAR',
      idNumber: idNumber || guest.idNumber || '',
      isVerified: Boolean(idNumber || directCheckIn),
      createdAt: nowIso,
    });

    // 8. If direct check-in with allotted room, mark Room as OCCUPIED immediately
    if (resolvedRoom && directCheckIn) {
      await Room.findByIdAndUpdate(resolvedRoom._id, { status: 'OCCUPIED' });
    }

    const magicLink = `/stay/${bookingNumber}`;

    return ApiResponse.success(
      res,
      directCheckIn
        ? `Walk-in Guest ${guest.name} checked into Room ${resolvedRoom?.roomNumber || roomNumber || 'Assigned'} successfully!`
        : `Booking ${bookingNumber} created for ${guest.name} successfully!`,
      {
        booking: newBooking,
        stay,
        guest,
        room: resolvedRoom,
        magicLink,
      },
      201
    );
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/bookings/magic/:ref
 * Magic Stay Link Resolver: Auto-authenticates guest using Booking Reference or Stay ID
 * Express 60-Second Check-In dispatch endpoint for WhatsApp / SMS
 */
router.get('/magic/:ref', async (req, res, next) => {
  try {
    const { ref } = req.params;
    if (!ref || !ref.trim()) {
      return ApiResponse.error(res, 'Booking reference or Stay ID is required', 400);
    }

    const cleanRef = ref.trim();

    // 1. Look up by bookingNumber
    let booking = await Booking.findOne({ bookingNumber: cleanRef });
    if (!booking) {
      booking = await Booking.findById(cleanRef);
    }
    if (!booking) {
      // Case-insensitive lookup
      const allBk = await Booking.find();
      booking = allBk.find((b) => b.bookingNumber && b.bookingNumber.toUpperCase() === cleanRef.toUpperCase());
    }

    // 2. Look up stay
    let stay = null;
    if (booking) {
      stay = await Stay.findOne({ bookingId: booking._id });
    } else {
      stay = await Stay.findById(cleanRef);
      if (stay && stay.bookingId) {
        booking = await Booking.findById(stay.bookingId);
      }
    }

    // Fallback if not found: find active demo stay
    if (!stay && !booking) {
      const fallbackBookings = await ensureTodayBookings('HOTEL-DELHI-01', 'PROP-DELHI-01');
      booking = fallbackBookings[0];
      if (booking) {
        stay = await Stay.findOne({ bookingId: booking._id });
      }
    }

    if (!booking && !stay) {
      return ApiResponse.error(res, `Booking reference '${ref}' not found. Please verify with reception desk.`, 404);
    }

    // 3. Resolve Guest details
    let guest = null;
    const gId = booking?.guestId || stay?.guestId;
    if (gId) {
      const resolvedGId = typeof gId === 'object' ? gId._id || gId : gId;
      guest = await Guest.findById(resolvedGId);
    }
    if (!guest) {
      guest = {
        _id: 'GUEST-RESOLVED',
        name: booking?.guestName || 'Valued Guest',
        phone: booking?.guestPhone || '',
        email: booking?.guestEmail || '',
      };
    }

    // 4. Resolve Room details
    let room = null;
    const rId = booking?.roomId || stay?.roomId;
    if (rId) {
      const resolvedRId = typeof rId === 'object' ? rId._id || rId : rId;
      room = await Room.findById(resolvedRId);
    }

    // 5. Generate Guest Token
    const stayId = stay?._id || 'STAY-ACTIVE';
    const hotelId = booking?.hotelId || stay?.hotelId || 'HOTEL-DELHI-01';
    const propertyId = booking?.propertyId || stay?.propertyId || 'PROP-DELHI-01';

    const token = generateGuestToken({
      stayId,
      bookingId: booking?._id || booking?.bookingNumber,
      guestId: guest._id,
      hotelId,
      propertyId,
      guestName: guest.name,
      roomNumber: room?.roomNumber || booking?.roomNumber || '302',
    });

    const isStayActive = stay?.status === 'STAY_ACTIVE' || stay?.status === 'CHECKED_IN';
    const redirectUrl = isStayActive ? '/guest/dashboard' : '/guest/checkin';

    return ApiResponse.success(res, 'Guest session authenticated via Magic Link', {
      token,
      guest,
      booking,
      stay,
      room,
      redirectUrl,
      isStayActive,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/bookings/:id/checkin
 * 1-Click Check-In from Admin / Reception desk
 */
router.patch('/:id/checkin', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roomId } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return ApiResponse.error(res, 'Booking not found', 404);

    let stay = await Stay.findOne({ bookingId: booking._id });
    const nowIso = new Date().toISOString();

    const targetRoomId = roomId || booking.roomId;
    if (targetRoomId) {
      await Room.findByIdAndUpdate(targetRoomId, { status: 'OCCUPIED' });
    }

    if (stay) {
      stay.status = GUEST_JOURNEY_STATES.STAY_ACTIVE;
      stay.checkedInAt = nowIso;
      if (targetRoomId) stay.roomId = targetRoomId;
      await stay.save();
    } else {
      stay = await Stay.create({
        hotelId: booking.hotelId,
        propertyId: booking.propertyId,
        bookingId: booking._id,
        guestId: booking.guestId,
        roomId: targetRoomId || null,
        status: GUEST_JOURNEY_STATES.STAY_ACTIVE,
        checkedInAt: nowIso,
        createdAt: nowIso,
      });
    }

    await Booking.findByIdAndUpdate(booking._id, {
      status: 'CHECKED_IN',
      roomId: targetRoomId || booking.roomId,
    });

    return ApiResponse.success(res, `Guest ${booking.guestName || 'Guest'} checked in successfully!`, {
      booking,
      stay,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Purge Test Bookings, Guests, and Stays for Clean Slate
 */
router.delete('/purge-test', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const hotelId = req.tenant.hotelId || req.user?.hotelId;
    const filter = hotelId ? { hotelId } : {};

    const bookings = await Booking.find(filter);
    const roomIds = bookings.map((b) => b.roomId).filter(Boolean);

    await Booking.deleteMany(filter);
    await Stay.deleteMany(filter);
    await Guest.deleteMany(filter);

    // Reset rooms to AVAILABLE
    for (const rId of roomIds) {
      await Room.findByIdAndUpdate(rId, { status: 'AVAILABLE' });
    }

    return ApiResponse.success(res, 'All test bookings, guests, and stay folios purged. All rooms reset to AVAILABLE.');
  } catch (err) {
    next(err);
  }
});

/**
 * Cancel or Delete a Booking and release the room back to AVAILABLE
 */
router.delete('/:id', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return ApiResponse.error(res, 'Booking not found', 404);

    if (booking.roomId) {
      await Room.findByIdAndUpdate(booking.roomId, { status: 'AVAILABLE' });
    }

    await Booking.deleteMany({ _id: req.params.id });
    await Stay.deleteMany({ bookingId: req.params.id });

    return ApiResponse.success(res, `Booking ${booking.bookingNumber} deleted and Room ${booking.roomNumber} is now AVAILABLE.`);
  } catch (err) {
    next(err);
  }
});

export default router;
