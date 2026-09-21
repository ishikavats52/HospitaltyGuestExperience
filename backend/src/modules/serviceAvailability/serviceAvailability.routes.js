import { Router } from 'express';
import { ServiceAvailabilityController } from './serviceAvailability.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireSuperAdmin } from '../../middleware/role.middleware.js';

const router = Router();

router.get('/eligible', authenticate, ServiceAvailabilityController.getEligible);
router.get('/', authenticate, ServiceAvailabilityController.getAllRules);
router.post('/', authenticate, requireSuperAdmin, ServiceAvailabilityController.setRule);

export default router;
