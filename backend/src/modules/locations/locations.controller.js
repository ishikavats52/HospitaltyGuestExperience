import { LocationsService } from './locations.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class LocationsController {
  static async create(req, res, next) {
    try {
      const location = await LocationsService.createLocation(req.body);
      return ApiResponse.success(res, 'Location created successfully', location, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getHierarchy(req, res, next) {
    try {
      const hierarchy = await LocationsService.getHierarchy();
      return ApiResponse.success(res, 'Location hierarchy fetched successfully', hierarchy);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { type, parentId } = req.query;
      const filter = {};
      if (type) filter.type = type;
      if (parentId) filter.parentId = parentId;

      const locations = await LocationsService.getAll(filter);
      return ApiResponse.success(res, 'Locations fetched successfully', locations);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const updated = await LocationsService.update(req.params.id, req.body);
      if (!updated) return ApiResponse.error(res, 'Location not found', 404);
      return ApiResponse.success(res, 'Location updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }
}
