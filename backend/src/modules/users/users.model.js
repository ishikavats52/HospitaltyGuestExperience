import mongoose from 'mongoose';

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HOTEL_ADMIN: 'HOTEL_ADMIN',
  RECEPTION: 'RECEPTION',
  KITCHEN: 'KITCHEN',
  HOUSEKEEPING: 'HOUSEKEEPING',
  ACCOUNTS: 'ACCOUNTS',
};

const userSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      default: null, // Super Admins are not tied to a single hotel
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ hotelId: 1, role: 1 });

export const User = mongoose.model('User', userSchema);
