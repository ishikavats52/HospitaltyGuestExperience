import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    locationHierarchy: {
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      localArea: { type: String, default: null },
    },
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

hotelSchema.index({ code: 1 }, { unique: true });
hotelSchema.index({ 'locationHierarchy.country': 1, 'locationHierarchy.city': 1 });

export const Hotel = mongoose.model('Hotel', hotelSchema);
