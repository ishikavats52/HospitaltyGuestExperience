import { ServiceAvailabilityService } from './serviceAvailability.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class ServiceAvailabilityController {
  static async setRule(req, res, next) {
    try {
      const rule = await ServiceAvailabilityService.setAvailabilityRule(req.body, req.user?.id);
      return ApiResponse.success(res, 'Service availability rule updated', rule, 200);
    } catch (err) {
      next(err);
    }
  }

  static async getAllRules(req, res, next) {
    try {
      const { country, city, serviceId } = req.query;
      const filter = {};
      if (country) filter.country = country;
      if (city) filter.city = city;
      if (serviceId) filter.serviceId = serviceId;

      const rules = await ServiceAvailabilityService.getAllRules(filter);
      return ApiResponse.success(res, 'Availability rules fetched', rules);
    } catch (err) {
      next(err);
    }
  }

  static async getEligible(req, res, next) {
    try {
      const { country, state, city, localArea, planCode } = req.query;
      const eligible = await ServiceAvailabilityService.getEligibleServicesForHotel({
        country,
        state,
        city,
        localArea,
        planCode: planCode || 'FREE',
      });
      return ApiResponse.success(res, 'Eligible services calculated', eligible);
    } catch (err) {
      next(err);
    }
  }
}
