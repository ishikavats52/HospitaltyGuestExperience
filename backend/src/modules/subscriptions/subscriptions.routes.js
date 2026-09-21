import { Router } from 'express';
import { SubscriptionsController } from './subscriptions.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireSuperAdmin } from '../../middleware/role.middleware.js';

const router = Router();

router.get('/', authenticate, requireSuperAdmin, SubscriptionsController.getAll);
router.get('/hotel/:hotelId', authenticate, SubscriptionsController.getForHotel);
router.post('/assign', authenticate, requireSuperAdmin, SubscriptionsController.assign);

export default router;
