import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    source: { type: String, required: true, default: 'VIT_EVENTS' }
}, { timestamps: true });

// Ensure unique events by name and source
eventSchema.index({ name: 1, source: 1 }, { unique: true });

export default mongoose.model('Event', eventSchema);