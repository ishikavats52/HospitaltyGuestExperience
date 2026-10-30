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

router.post('/items', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const { name, categoryId, price, description, isVegetarian, isAvailable, image } = req.body;
    const hotelId = req.tenant.hotelId || req.user?.hotelId;
    const item = await MenuItem.create({
      hotelId,
      propertyId: req.tenant.propertyId,
      categoryId,
      name,
      price: Number(price) || 0,
      description: description || '',
      isVegetarian: isVegetarian !== undefined ? isVegetarian : true,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      image: image || '',
    });
    return ApiResponse.success(res, 'Menu item created successfully', item, 201);
  } catch (err) {
    next(err);
  }
});

router.patch('/items/:id', authenticate, async (req, res, next) => {
  try {
    const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return ApiResponse.error(res, 'Menu item not found', 404);
    return ApiResponse.success(res, 'Menu item updated', updated);
  } catch (err) {
    next(err);
  }
});

export default router;
