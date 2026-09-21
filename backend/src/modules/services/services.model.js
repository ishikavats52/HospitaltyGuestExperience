import mongoose from 'mongoose';

export const SERVICE_REQUEST_STATUS = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

/**
 * HotelServices: Hotel Admin configuration of an eligible catalogue service
 */
const hotelServiceSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCatalogue',
      required: true,
    },
    enabled: { type: Boolean, default: true },
    price: { type: Number, default: 0 },
    isComplimentary: { type: Boolean, default: false },
    operatingHours: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '23:00' },
    },
    assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    configuration: { type: Map, of: String },
    status: { type: String, enum: ['ACTIVE', 'PAUSED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

hotelServiceSchema.index({ hotelId: 1, serviceId: 1 }, { unique: true });

/**
 * ServiceRequests: Guest in-stay service request tickets
 */
const serviceRequestSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    stayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stay', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    serviceCatalogueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCatalogue',
      required: true,
    },
    hotelServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HotelService',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SERVICE_REQUEST_STATUS),
      default: SERVICE_REQUEST_STATUS.PENDING,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    price: { type: Number, default: 0 },
    isFree: { type: Boolean, default: false },
    guestNotes: { type: String, trim: true },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

serviceRequestSchema.index({ hotelId: 1, status: 1 });
serviceRequestSchema.index({ stayId: 1 });

export const HotelService = mongoose.model('HotelService', hotelServiceSchema);
export const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
