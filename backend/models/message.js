import { model, Schema } from "mongoose";

const messageSchema = new Schema({
  match: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  readAt: { type: Date },
}, { timestamps: true });

export default model('Message', messageSchema); 