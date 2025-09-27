import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  spots: { type: Number, required: true, default: 50 },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  skills: [{ type: String }],
  organizer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Event', eventSchema);
