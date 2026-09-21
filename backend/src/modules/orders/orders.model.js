import mongoose from 'mongoose';

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

const foodOrderSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    stayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stay', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    orderNumber: { type: String, required: true },
    items: [
      {
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    specialInstructions: { type: String },
  },
  { timestamps: true }
);

foodOrderSchema.index({ hotelId: 1, status: 1 });
foodOrderSchema.index({ stayId: 1 });

export const FoodOrder = mongoose.model('FoodOrder', foodOrderSchema);
