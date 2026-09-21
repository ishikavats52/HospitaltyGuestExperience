import { Router } from 'express';
import crypto from 'crypto';
import { Stay } from '../stays/stays.model.js';
import { Room } from '../rooms/rooms.model.js';
import { GUEST_JOURNEY_STATES } from '../stays/stays.constants.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireStaff } from '../../middleware/role.middleware.js';

const router = Router();

/**
 * Reception QR Pass Validation and Check-In
 */
router.post('/validate', authenticate, requireStaff, async (req, res, next) => {
  try {
    const { token, stayId, roomId } = req.body;

    const stay = await Stay.findById(stayId).populate('guestId').populate('bookingId');
    if (!stay) return ApiResponse.error(res, 'Invalid QR code: Stay not found', 404);

    const computedHash = crypto.createHash('sha256').update(token).digest('hex');
    if (stay.qrTokenHash !== computedHash) {
      return ApiResponse.error(res, 'QR Code validation failed: Cryptographic token mismatch', 400);
    }

    // Assign room if provided
    if (roomId) {
      stay.roomId = roomId;
      await Room.findByIdAndUpdate(roomId, { status: 'OCCUPIED' });
    }

    stay.status = GUEST_JOURNEY_STATES.STAY_ACTIVE;
    stay.checkedInAt = new Date();
    await stay.save();

    return ApiResponse.success(res, 'Guest check-in validated successfully. Stay is now ACTIVE.', {
      stayId: stay._id,
      status: stay.status,
      guestName: stay.guestId?.name,
      roomId: stay.roomId,
      checkedInAt: stay.checkedInAt,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
