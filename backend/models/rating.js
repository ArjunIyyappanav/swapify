import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, maxlength: 500 },
  skillRated: { type: String, required: true }, // The skill that was exchanged
  createdAt: { type: Date, default: Date.now }
});

// Ensure one rating per match per user
ratingSchema.index({ rater: 1, match: 1 }, { unique: true });

export default mongoose.model('Rating', ratingSchema);