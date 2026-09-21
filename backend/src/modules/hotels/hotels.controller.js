import { Hotel } from './hotels.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class HotelsController {
  static async create(req, res, next) {
    try {
      const hotel = await Hotel.create(req.body);
      return ApiResponse.success(res, 'Hotel tenant created', hotel, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req, res, next) {
    try {
      const hotels = await Hotel.find();
      return ApiResponse.success(res, 'Hotels fetched', hotels);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const hotel = await Hotel.findById(req.params.id);
      if (!hotel) return ApiResponse.error(res, 'Hotel not found', 404);
      return ApiResponse.success(res, 'Hotel details fetched', hotel);
    } catch (err) {
      next(err);
    }
  }
}
