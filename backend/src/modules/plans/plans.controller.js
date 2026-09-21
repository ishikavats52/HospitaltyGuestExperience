import { PlansService } from './plans.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class PlansController {
  static async create(req, res, next) {
    try {
      const plan = await PlansService.create(req.body);
      return ApiResponse.success(res, 'Subscription plan created', plan, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req, res, next) {
    try {
      const plans = await PlansService.getAll({ isActive: true });
      return ApiResponse.success(res, 'Subscription plans fetched', plans);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const updated = await PlansService.update(req.params.id, req.body);
      if (!updated) return ApiResponse.error(res, 'Plan not found', 404);
      return ApiResponse.success(res, 'Plan updated', updated);
    } catch (err) {
      next(err);
    }
  }
}
