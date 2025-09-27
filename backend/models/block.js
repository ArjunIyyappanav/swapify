import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  blocker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  blocked: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, maxlength: 200 },
  createdAt: { type: Date, default: Date.now }
});

// Ensure unique blocking relationship
blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

export default mongoose.model('Block', blockSchema);