import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    idType: {
      type: String,
      enum: ['PASSPORT', 'DRIVING_LICENSE', 'NATIONAL_ID', 'AADHAAR'],
      default: 'PASSPORT',
    },
    idNumber: { type: String, trim: true },
    idDocumentUrl: { type: String, default: null },
    selfieUrl: { type: String, default: null },
    signatureUrl: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

guestSchema.index({ phone: 1, hotelId: 1 });

export const Guest = mongoose.model('Guest', guestSchema);
