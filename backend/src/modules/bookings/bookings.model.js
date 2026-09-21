import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },
    bookingNumber: { type: String, required: true, unique: true, uppercase: true },
    phone: { type: String, required: true },
    roomTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    numberOfGuests: { type: Number, default: 1 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'],
      default: 'CONFIRMED',
    },
  },
  { timestamps: true }
);

bookingSchema.index({ bookingNumber: 1 }, { unique: true });
bookingSchema.index({ phone: 1, bookingNumber: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
