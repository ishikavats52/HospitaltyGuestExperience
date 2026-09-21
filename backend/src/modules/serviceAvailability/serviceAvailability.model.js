import mongoose from 'mongoose';

const serviceAvailabilitySchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCatalogue',
      required: true,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },
    country: { type: String, trim: true, default: null },
    state: { type: String, trim: true, default: null },
    city: { type: String, trim: true, default: null },
    localArea: { type: String, trim: true, default: null },
    enabled: { type: Boolean, default: true },
    allowedPlans: [{ type: String, uppercase: true }], // e.g. ['FREE', 'BASIC', 'PREMIUM']
    isFree: { type: Boolean, default: false }, // Overrides/specifies Free Plan entitlement
    configuredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

serviceAvailabilitySchema.index({ serviceId: 1, country: 1, city: 1 });
serviceAvailabilitySchema.index({ locationId: 1 });

export const ServiceAvailability = mongoose.model('ServiceAvailability', serviceAvailabilitySchema);
