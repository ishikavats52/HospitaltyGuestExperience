import { Router } from 'express';
import { ServiceCatalogueController } from './serviceCatalogue.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireSuperAdmin } from '../../middleware/role.middleware.js';

const router = Router();

router.get('/', authenticate, ServiceCatalogueController.getAll);
router.get('/:id', authenticate, ServiceCatalogueController.getById);
router.post('/', authenticate, requireSuperAdmin, ServiceCatalogueController.create);
router.patch('/:id', authenticate, requireSuperAdmin, ServiceCatalogueController.update);

export default router;
