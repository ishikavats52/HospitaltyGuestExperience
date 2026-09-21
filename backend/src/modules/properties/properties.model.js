import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true },
    address: { type: String, required: true },
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    checkInTime: { type: String, default: '14:00' },
    checkOutTime: { type: String, default: '11:00' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

propertySchema.index({ hotelId: 1, code: 1 }, { unique: true });

export const Property = mongoose.model('Property', propertySchema);
