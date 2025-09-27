import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  duration: { type: Number, default: 60 }, // in minutes
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true }, // Reference to the skill swap match
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  meetingLink: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Meeting', meetingSchema);
