import { Router } from 'express';
import { Stay } from '../stays/stays.model.js';
import { Guest } from '../guests/guests.model.js';
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
    if (!stayId || stayId === 'undefined' || stayId === 'null') {
      return ApiResponse.error(res, 'Valid stayId parameter is required for check-in submission', 400);
    }

    const stay = await Stay.findById(stayId).populate('bookingId');
    if (!stay) return ApiResponse.error(res, 'Stay not found', 404);

    // Update Guest record
    await Guest.findByIdAndUpdate(stay.guestId, {
      idType,
      idNumber,
      idDocumentUrl: idDocumentUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136',
      selfieUrl: selfieUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      signatureUrl: signatureUrl || 'data:image/svg+xml;utf8,<svg></svg>',
      isVerified: true,
    });

    // Generate cryptographic QR pass
    const { rawToken, tokenHash } = generateSecureToken();
    const qrPayload = JSON.stringify({
      token: rawToken,
      stayId: stay._id,
      hotelId: stay.hotelId,
      bookingNumber: stay.bookingId.bookingNumber,
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
