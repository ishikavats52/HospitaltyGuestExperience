import { Router } from 'express';
import { MenuCategory, MenuItem } from './menu.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const filter = req.tenant.isSuperAdmin && !req.tenant.hotelId ? {} : { hotelId: req.tenant.hotelId };
    const categories = await MenuCategory.find({ ...filter, isActive: true }).sort('displayOrder');
    const items = await MenuItem.find({ ...filter, isAvailable: true }).populate('categoryId', 'name');

    return ApiResponse.success(res, 'Menu catalog fetched', { categories, items });
  } catch (err) {
    next(err);
  }
});

export default router;
