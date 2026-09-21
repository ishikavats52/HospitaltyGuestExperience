import mongoose from 'mongoose';
import { LOCATION_TYPES } from './locations.constants.js';

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: Object.values(LOCATION_TYPES),
      required: true,
    },
    code: { type: String, trim: true, uppercase: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },
    coordinates: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

locationSchema.index({ type: 1, name: 1 });
locationSchema.index({ parentId: 1 });

export const Location = mongoose.model('Location', locationSchema);
