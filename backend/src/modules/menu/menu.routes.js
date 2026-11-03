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

    if (!categories || categories.length === 0) {
      const DEFAULT_MENU_CATEGORIES = [
        { name: 'Starters & Appetizers', displayOrder: 1 },
        { name: 'Main Course & Curries', displayOrder: 2 },
        { name: 'Breads & Rice Specialties', displayOrder: 3 },
        { name: 'Snacks & Fast Food', displayOrder: 4 },
        { name: 'Desserts & Sweets', displayOrder: 5 },
        { name: 'Hot & Cold Beverages', displayOrder: 6 },
      ];
      const targetHotelId = req.tenant.hotelId || req.user?.hotelId || 'DEFAULT';
      const seeded = [];
      for (const def of DEFAULT_MENU_CATEGORIES) {
        const cat = await MenuCategory.create({
          hotelId: targetHotelId,
          name: def.name,
          displayOrder: def.displayOrder,
        });
        seeded.push(cat);
      }
      categories = seeded;
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

// Create Custom Menu Category
router.post('/categories', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const { name, displayOrder } = req.body;
    if (!name || !name.trim()) return ApiResponse.error(res, 'Category name is required', 400);

    const hotelId = req.tenant.hotelId || req.user?.hotelId;
    const allCats = await MenuCategory.find();
    const existing = allCats.find((c) => c.name && c.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) {
      return ApiResponse.success(res, 'Category already exists', existing);
    }

    const category = await MenuCategory.create({
      hotelId,
      name: name.trim(),
      displayOrder: Number(displayOrder) || 1,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    return ApiResponse.success(res, `Category '${category.name}' created successfully`, category, 201);
  } catch (err) {
    next(err);
  }
});

// Delete Menu Category
router.delete('/categories/:id', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const { id } = req.params;
    const cat = await MenuCategory.findById(id);
    if (!cat) return ApiResponse.error(res, 'Category not found', 404);

    await MenuCategory.deleteMany({ _id: id });
    return ApiResponse.success(res, `Category '${cat.name}' deleted successfully from database`);
  } catch (err) {
    next(err);
  }
});

// Delete Menu Item
router.delete('/items/:id', authenticate, enforceTenantIsolation, async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findById(id);
    if (!item) return ApiResponse.error(res, 'Menu item not found', 404);

    await MenuItem.deleteMany({ _id: id });
    return ApiResponse.success(res, `Dish '${item.name}' deleted successfully from menu`);
  } catch (err) {
    next(err);
  }
});

export default router;
