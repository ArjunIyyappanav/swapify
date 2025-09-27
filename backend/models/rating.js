import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
  swapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  createdAt: { type: Date, default: Date.now }
});

// Ensure one rating per user pair per swap
ratingSchema.index({ fromUser: 1, toUser: 1, swapId: 1 }, { unique: true });

export default mongoose.model('Rating', ratingSchema);
