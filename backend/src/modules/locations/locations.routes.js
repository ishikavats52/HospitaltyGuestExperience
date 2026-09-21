import { Router } from 'express';
import { LocationsController } from './locations.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireSuperAdmin } from '../../middleware/role.middleware.js';

const router = Router();

router.get('/hierarchy', authenticate, LocationsController.getHierarchy);
router.get('/', authenticate, LocationsController.getAll);
router.post('/', authenticate, requireSuperAdmin, LocationsController.create);
router.patch('/:id', authenticate, requireSuperAdmin, LocationsController.update);

export default router;
