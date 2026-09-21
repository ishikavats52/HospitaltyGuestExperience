import mongoose from 'mongoose';

const menuCategorySchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    name: { type: String, required: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const menuItemSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    isVeg: { type: Boolean, default: true },
    preparationTime: { type: Number, default: 20 }, // minutes
    isAvailable: { type: Boolean, default: true },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

export const MenuCategory = mongoose.model('MenuCategory', menuCategorySchema);
export const MenuItem = mongoose.model('MenuItem', menuItemSchema);
