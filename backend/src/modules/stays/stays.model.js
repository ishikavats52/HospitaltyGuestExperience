import mongoose from 'mongoose';
import { GUEST_JOURNEY_STATES } from './stays.constants.js';

const staySchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    status: {
      type: String,
      enum: Object.values(GUEST_JOURNEY_STATES),
      default: GUEST_JOURNEY_STATES.BOOKING_CONFIRMED,
    },
    qrTokenHash: { type: String, default: null },
    qrPassUrl: { type: String, default: null },
    checkInStartedAt: { type: Date, default: null },
    checkedInAt: { type: Date, default: null },
    checkedOutAt: { type: Date, default: null },
    folioBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

staySchema.index({ hotelId: 1, status: 1 });
staySchema.index({ bookingId: 1 }, { unique: true });
staySchema.index({ qrTokenHash: 1 });

export const Stay = mongoose.model('Stay', staySchema);
