import { ServiceAvailability } from './serviceAvailability.model.js';
import { ServiceCatalogue } from '../serviceCatalogue/serviceCatalogue.model.js';

export class ServiceAvailabilityService {
  static async setAvailabilityRule(data, userId) {
    const { serviceId, country, state, city, localArea } = data;
    return await ServiceAvailability.findOneAndUpdate(
      { serviceId, country, state, city, localArea },
      { ...data, configuredBy: userId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  static async getAllRules(filter = {}) {
    return await ServiceAvailability.find(filter)
      .populate('serviceId', 'name code category isFreeByDefault status')
      .populate('locationId', 'name type');
  }

  /**
   * Resolve eligible services for a given location and subscription plan
   */
  static async getEligibleServicesForHotel({ country, state, city, localArea, planCode }) {
    // 1. Fetch all active services from catalogue
    const allServices = await ServiceCatalogue.find({ status: 'ACTIVE' });

    // 2. Query geo-rules matching location
    const geoRules = await ServiceAvailability.find({
      $or: [
        { city: city, enabled: true },
        { state: state, enabled: true },
        { country: country, enabled: true },
        { country: null, state: null, city: null, enabled: true }, // Global fallback
      ],
    });

    const ruleMap = new Map();
    geoRules.forEach((rule) => {
      if (rule.serviceId) {
        ruleMap.set(rule.serviceId.toString(), rule);
      }
    });

    // 3. Filter services that meet location and plan criteria
    const eligible = [];
    for (const service of allServices) {
      const rule = ruleMap.get(service._id.toString());
      
      // If rule exists and explicitly disabled for location
      if (rule && !rule.enabled) continue;

      // Check plan eligibility
      const allowedPlans = rule?.allowedPlans?.length ? rule.allowedPlans : service.eligiblePlans;
      const isPlanAllowed = allowedPlans.includes(planCode?.toUpperCase());
      const isFreeService = rule?.isFree || service.isFreeByDefault;

      // If hotel is on FREE plan, service must be explicitly free or plan allowed
      if (planCode?.toUpperCase() === 'FREE' && !isFreeService && !isPlanAllowed) {
        continue;
      }

      if (isPlanAllowed || isFreeService) {
        eligible.push({
          service,
          isFree: isFreeService,
          ruleId: rule?._id || null,
        });
      }
    }

    return eligible;
  }
}
