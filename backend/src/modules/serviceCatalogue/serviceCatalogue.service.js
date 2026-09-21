import { ServiceCatalogue } from './serviceCatalogue.model.js';

export class ServiceCatalogueService {
  static async create(data, userId) {
    return await ServiceCatalogue.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });
  }

  static async getAll(filter = {}) {
    return await ServiceCatalogue.find(filter).populate('availableLocations', 'name type');
  }

  static async getById(id) {
    return await ServiceCatalogue.findById(id).populate('availableLocations');
  }

  static async update(id, updateData, userId) {
    return await ServiceCatalogue.findByIdAndUpdate(
      id,
      { ...updateData, updatedBy: userId },
      { new: true }
    );
  }
}
