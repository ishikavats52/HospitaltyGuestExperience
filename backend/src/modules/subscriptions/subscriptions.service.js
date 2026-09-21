import { HotelSubscription } from './subscriptions.model.js';
import { SubscriptionPlan } from '../plans/plans.model.js';

export class SubscriptionsService {
  static async assignSubscription(hotelId, planCode) {
    const plan = await SubscriptionPlan.findOne({ code: planCode.toUpperCase() });
    if (!plan) throw new Error(`Plan ${planCode} not found`);

    return await HotelSubscription.findOneAndUpdate(
      { hotelId },
      {
        hotelId,
        planId: plan._id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: plan.isFreePlan ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { upsert: true, new: true }
    ).populate('planId');
  }

  static async getHotelSubscription(hotelId) {
    return await HotelSubscription.findOne({ hotelId }).populate('planId');
  }

  static async getAll() {
    return await HotelSubscription.find().populate('hotelId', 'name code').populate('planId');
  }
}
