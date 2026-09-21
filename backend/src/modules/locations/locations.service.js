import { Location } from './locations.model.js';

export class LocationsService {
  static async createLocation(data) {
    return await Location.create(data);
  }

  static async getHierarchy() {
    const countries = await Location.find({ type: 'COUNTRY', isActive: true });
    const states = await Location.find({ type: 'STATE', isActive: true });
    const cities = await Location.find({ type: 'CITY', isActive: true });
    const localAreas = await Location.find({ type: 'LOCAL_AREA', isActive: true });

    return { countries, states, cities, localAreas };
  }

  static async getAll(filter = {}) {
    return await Location.find(filter).populate('parentId', 'name type');
  }

  static async getById(id) {
    return await Location.findById(id);
  }

  static async update(id, updateData) {
    return await Location.findByIdAndUpdate(id, updateData, { new: true });
  }
}
