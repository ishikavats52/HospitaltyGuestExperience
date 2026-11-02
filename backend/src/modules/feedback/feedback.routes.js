import { Router } from 'express';
import { Feedback } from './feedback.model.js';
import { Stay } from '../stays/stays.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { stayId, ratingOverall, ratingCleanliness, ratingFood, ratingStaff, npsScore, comments, guestName } = req.body;
    let stay = stayId ? await Stay.findById(stayId) : await Stay.findOne();
    if (!stay) {
      stay = { _id: 'STAY-ARCHIVED', hotelId: 'HOTEL-DELHI-01', guestId: 'GUEST-01' };
    }

    const feedback = await Feedback.create({
      hotelId: stay.hotelId || 'HOTEL-DELHI-01',
      stayId: stay._id,
      guestId: stay.guestId,
      guestName: guestName || 'Guest',
      ratingOverall: Number(ratingOverall) || 5,
      ratingCleanliness: Number(ratingCleanliness) || 5,
      ratingFood: Number(ratingFood) || 5,
      ratingStaff: Number(ratingStaff) || 5,
      npsScore: Number(npsScore) || 10,
      comments: comments || '',
      createdAt: new Date().toISOString(),
    });

    if (stay && stay.save) {
      stay.status = 'ARCHIVED';
      await stay.save();
    } else if (stay && stay._id) {
      await Stay.findByIdAndUpdate(stay._id, { status: 'ARCHIVED' });
    }

    return ApiResponse.success(res, 'Thank you! Your feedback has been recorded.', feedback, 201);
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const filter = req.tenant.isSuperAdmin && !req.tenant.hotelId ? {} : { hotelId: req.tenant.hotelId };
    const list = await Feedback.find(filter);
    return ApiResponse.success(res, 'Feedback fetched', list);
  } catch (err) {
    next(err);
  }
});

export default router;
