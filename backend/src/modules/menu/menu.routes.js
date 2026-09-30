import { Router } from 'express';
import { MenuCategory, MenuItem } from './menu.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const filter = req.tenant.isSuperAdmin && !req.tenant.hotelId ? {} : { hotelId: req.tenant.hotelId };
    let categories = await MenuCategory.find(filter).sort('displayOrder');
    let items = await MenuItem.find(filter).populate('categoryId', 'name');

    if (!items || items.length === 0) {
      items = await MenuItem.find({}).populate('categoryId', 'name');
    }
    if (!categories || categories.length === 0) {
      categories = await MenuCategory.find({}).sort('displayOrder');
    }

    return ApiResponse.success(res, 'Menu catalog fetched', { categories, items });
  } catch (err) {
    next(err);
  }
});

export default router;
