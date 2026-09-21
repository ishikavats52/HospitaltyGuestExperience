import mongoose from 'mongoose';
import { SUBSCRIPTION_STATUS } from './subscriptions.constants.js';

const hotelSubscriptionSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
      unique: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.ACTIVE,
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null }, // Null for lifetime/free plans
    autoRenew: { type: Boolean, default: true },
    billingEmail: { type: String, trim: true },
  },
  { timestamps: true }
);

hotelSubscriptionSchema.index({ hotelId: 1 }, { unique: true });

export const HotelSubscription = mongoose.model('HotelSubscription', hotelSubscriptionSchema);
