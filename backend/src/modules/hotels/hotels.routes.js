import { Router } from 'express';
import { HotelsController } from './hotels.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireSuperAdmin } from '../../middleware/role.middleware.js';

const router = Router();

router.get('/', authenticate, HotelsController.getAll);
router.get('/:id', authenticate, HotelsController.getById);
router.post('/', authenticate, requireSuperAdmin, HotelsController.create);

export default router;
