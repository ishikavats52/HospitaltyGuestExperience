import { SubscriptionPlan } from './plans.model.js';

export class PlansService {
  static async create(data) {
    return await SubscriptionPlan.create(data);
  }

  static async getAll(filter = {}) {
    return await SubscriptionPlan.find(filter);
  }

  static async getByCode(code) {
    return await SubscriptionPlan.findOne({ code: code.toUpperCase() });
  }

  static async update(id, updateData) {
    return await SubscriptionPlan.findByIdAndUpdate(id, updateData, { new: true });
  }
}
