import { SubscriptionsService } from './subscriptions.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class SubscriptionsController {
  static async assign(req, res, next) {
    try {
      const { hotelId, planCode } = req.body;
      const sub = await SubscriptionsService.assignSubscription(hotelId, planCode);
      return ApiResponse.success(res, 'Subscription assigned to hotel', sub);
    } catch (err) {
      next(err);
    }
  }

  static async getForHotel(req, res, next) {
    try {
      const hotelId = req.params.hotelId || req.tenant?.hotelId;
      const sub = await SubscriptionsService.getHotelSubscription(hotelId);
      if (!sub) return ApiResponse.error(res, 'No active subscription found', 404);
      return ApiResponse.success(res, 'Hotel subscription details', sub);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req, res, next) {
    try {
      const subs = await SubscriptionsService.getAll();
      return ApiResponse.success(res, 'Subscriptions fetched', subs);
    } catch (err) {
      next(err);
    }
  }
}
