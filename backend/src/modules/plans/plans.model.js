import mongoose from 'mongoose';
import { PLAN_CODES, BILLING_CYCLES } from './plans.constants.js';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      enum: Object.values(PLAN_CODES),
      required: true,
      unique: true,
      uppercase: true,
    },
    price: { type: Number, required: true, default: 0 },
    billingCycle: {
      type: String,
      enum: Object.values(BILLING_CYCLES),
      default: BILLING_CYCLES.MONTHLY,
    },
    isFreePlan: { type: Boolean, default: false },
    features: [{ type: String }],
    maxProperties: { type: Number, default: 1 },
    maxRooms: { type: Number, default: 50 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

subscriptionPlanSchema.index({ code: 1 }, { unique: true });

export const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
