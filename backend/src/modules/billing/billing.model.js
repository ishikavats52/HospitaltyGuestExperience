import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    stayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stay', required: true },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    subtotal: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'ISSUED', 'PAID', 'PARTIALLY_PAID', 'CANCELLED'],
      default: 'DRAFT',
    },
    items: [
      {
        itemType: { type: String, enum: ['ROOM', 'FOOD', 'SERVICE', 'TAX'], required: true },
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

invoiceSchema.index({ stayId: 1 });
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });

export const Invoice = mongoose.model('Invoice', invoiceSchema);
