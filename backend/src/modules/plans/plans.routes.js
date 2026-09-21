import { Router } from 'express';
import { PlansController } from './plans.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireSuperAdmin } from '../../middleware/role.middleware.js';

const router = Router();

router.get('/', authenticate, PlansController.getAll);
router.post('/', authenticate, requireSuperAdmin, PlansController.create);
router.patch('/:id', authenticate, requireSuperAdmin, PlansController.update);

export default router;
