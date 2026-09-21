import { Router } from 'express';
import { Feedback } from './feedback.model.js';
import { Stay } from '../stays/stays.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';

const router = Router();

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { stayId, ratingOverall, ratingCleanliness, ratingFood, ratingStaff, npsScore, comments } = req.body;
    const stay = await Stay.findById(stayId);
    if (!stay) return ApiResponse.error(res, 'Stay not found', 404);

    const feedback = await Feedback.create({
      hotelId: stay.hotelId,
      stayId: stay._id,
      guestId: stay.guestId,
      ratingOverall,
      ratingCleanliness,
      ratingFood,
      ratingStaff,
      npsScore,
      comments,
    });

    stay.status = 'ARCHIVED';
    await stay.save();

    return ApiResponse.success(res, 'Thank you! Feedback received.', feedback, 201);
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const filter = req.tenant.isSuperAdmin && !req.tenant.hotelId ? {} : { hotelId: req.tenant.hotelId };
    const list = await Feedback.find(filter).sort({ createdAt: -1 });
    return ApiResponse.success(res, 'Feedback fetched', list);
  } catch (err) {
    next(err);
  }
});

export default router;
