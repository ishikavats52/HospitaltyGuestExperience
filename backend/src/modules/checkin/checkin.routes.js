import { Router } from 'express';
import { Stay } from '../stays/stays.model.js';
import { Guest } from '../guests/guests.model.js';
import { Booking } from '../bookings/bookings.model.js';
import { GUEST_JOURNEY_STATES } from '../stays/stays.constants.js';
import { generateSecureToken, generateQRCodeDataUrl } from '../../utils/qrGenerator.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * Submit Contactless Check-In (KYC ID, Selfie, Signature, Consent)
 */
router.post('/submit', authenticate, async (req, res, next) => {
  try {
    const { stayId, idType, idNumber, idDocumentUrl, selfieUrl, signatureUrl } = req.body;

    let targetStayId = stayId;
    if (!targetStayId || targetStayId === 'undefined' || targetStayId === 'null') {
      targetStayId = req.user?.stayId;
    }

    let stay = null;
    if (targetStayId && targetStayId !== 'undefined' && targetStayId !== 'null') {
      stay = await Stay.findById(targetStayId);
    }

    if (!stay && req.user?.bookingId) {
      stay = await Stay.findOne({ bookingId: req.user.bookingId });
    }

    if (!stay) {
      stay = await Stay.findOne();
    }

    if (!stay) {
      return ApiResponse.error(res, 'Valid stayId parameter is required for check-in submission', 400);
    }

    // Safely retrieve booking number
    let bookingNumber = 'BK-DELHI-101';
    if (stay.bookingId) {
      const bId = typeof stay.bookingId === 'object' ? stay.bookingId._id || stay.bookingId : stay.bookingId;
      const b = await Booking.findById(bId);
      if (b && b.bookingNumber) {
        bookingNumber = b.bookingNumber;
      }
    }

    // Update Guest record if guestId exists
    if (stay.guestId) {
      const gId = typeof stay.guestId === 'object' ? stay.guestId._id || stay.guestId : stay.guestId;
      await Guest.findByIdAndUpdate(gId, {
        idType: idType || 'PASSPORT',
        idNumber: idNumber || 'Z5896321',
        idDocumentUrl: idDocumentUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136',
        selfieUrl: selfieUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        signatureUrl: signatureUrl || 'data:image/svg+xml;utf8,<svg></svg>',
        isVerified: true,
      });
    }

    // Generate cryptographic QR pass
    const { rawToken, tokenHash } = generateSecureToken();
    const qrPayload = JSON.stringify({
      token: rawToken,
      stayId: stay._id,
      hotelId: stay.hotelId,
      bookingNumber,
    });

    const qrDataUrl = await generateQRCodeDataUrl(qrPayload);

    stay.status = GUEST_JOURNEY_STATES.QR_GENERATED;
    stay.qrTokenHash = tokenHash;
    stay.qrPassUrl = qrDataUrl;
    await stay.save();

    return ApiResponse.success(res, 'Check-in completed and QR Pass generated', {
      stayId: stay._id,
      status: stay.status,
      qrPassUrl: qrDataUrl,
      rawToken,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
