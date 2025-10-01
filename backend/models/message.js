import { model, Schema } from "mongoose";

const messageSchema = new Schema({
  match: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  messageType: { type: String, enum: ['text', 'file'], default: 'text' },
  file: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String
  },
  readAt: { type: Date },
}, { timestamps: true });

// Custom validation to ensure either content or file is present
messageSchema.pre('validate', function(next) {
  if (this.messageType === 'file' && this.file && this.file.filename) {
    // File message is valid
    next();
  } else if (this.messageType === 'text' && this.content) {
    // Text message is valid
    next();
  } else {
    next(new Error('Message must have either content or file attachment'));
  }
});

export default model('Message', messageSchema); 