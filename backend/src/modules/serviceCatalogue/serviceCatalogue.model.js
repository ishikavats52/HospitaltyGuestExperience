import mongoose from 'mongoose';
import { SERVICE_CATEGORIES, SERVICE_STATUS } from './serviceCatalogue.constants.js';

const serviceCatalogueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: {
      type: String,
      enum: Object.values(SERVICE_CATEGORIES),
      required: true,
    },
    description: { type: String, trim: true },
    icon: { type: String, default: 'concierge-bell' },
    status: {
      type: String,
      enum: Object.values(SERVICE_STATUS),
      default: SERVICE_STATUS.ACTIVE,
    },
    isFreeByDefault: { type: Boolean, default: false },
    eligiblePlans: [{ type: String, uppercase: true }], // ['FREE', 'BASIC', 'PREMIUM']
    availableLocations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

serviceCatalogueSchema.index({ category: 1, status: 1 });
serviceCatalogueSchema.index({ code: 1 }, { unique: true });

export const ServiceCatalogue = mongoose.model('ServiceCatalogue', serviceCatalogueSchema);
