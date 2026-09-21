import { ServiceCatalogueService } from './serviceCatalogue.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class ServiceCatalogueController {
  static async create(req, res, next) {
    try {
      const service = await ServiceCatalogueService.create(req.body, req.user?.id);
      return ApiResponse.success(res, 'Service added to catalogue', service, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { category, status, isFree } = req.query;
      const filter = {};
      if (category) filter.category = category;
      if (status) filter.status = status;
      if (isFree !== undefined) filter.isFreeByDefault = isFree === 'true';

      const services = await ServiceCatalogueService.getAll(filter);
      return ApiResponse.success(res, 'Catalogue services fetched', services);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const service = await ServiceCatalogueService.getById(req.params.id);
      if (!service) return ApiResponse.error(res, 'Service not found in catalogue', 404);
      return ApiResponse.success(res, 'Service details fetched', service);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const updated = await ServiceCatalogueService.update(req.params.id, req.body, req.user?.id);
      if (!updated) return ApiResponse.error(res, 'Service not found', 404);
      return ApiResponse.success(res, 'Catalogue service updated', updated);
    } catch (err) {
      next(err);
    }
  }
}
