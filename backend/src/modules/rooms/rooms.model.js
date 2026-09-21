import mongoose from 'mongoose';

const roomTypeSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    name: { type: String, required: true }, // Deluxe, Executive Suite
    code: { type: String, required: true },
    basePrice: { type: Number, required: true },
    maxOccupancy: { type: Number, default: 2 },
    amenities: [{ type: String }],
  },
  { timestamps: true }
);

const roomSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    roomTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
    roomNumber: { type: String, required: true },
    floor: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'],
      default: 'AVAILABLE',
    },
  },
  { timestamps: true }
);

roomSchema.index({ propertyId: 1, roomNumber: 1 }, { unique: true });

export const RoomType = mongoose.model('RoomType', roomTypeSchema);
export const Room = mongoose.model('Room', roomSchema);
