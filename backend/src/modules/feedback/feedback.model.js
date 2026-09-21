import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    stayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stay', required: true },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
    ratingOverall: { type: Number, required: true, min: 1, max: 5 },
    ratingCleanliness: { type: Number, min: 1, max: 5, default: 5 },
    ratingFood: { type: Number, min: 1, max: 5, default: 5 },
    ratingStaff: { type: Number, min: 1, max: 5, default: 5 },
    npsScore: { type: Number, min: 0, max: 10, default: 10 },
    comments: { type: String, trim: true },
  },
  { timestamps: true }
);

feedbackSchema.index({ hotelId: 1 });
feedbackSchema.index({ stayId: 1 }, { unique: true });

export const Feedback = mongoose.model('Feedback', feedbackSchema);
