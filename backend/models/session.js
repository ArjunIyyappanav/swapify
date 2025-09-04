import {model,Schema} from "mongoose";

const sessionSchema = new Schema({
    matchId: {type: Schema.Types.ObjectId, ref: 'Match', required: true},
    scheduledTime: {type: Date, required: true},
    status: {type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled'},
    duration: {type: Number, default: 60}, 
    feedbackFromUser1: {type: String, default: ''},
    feedbackFromUser2: {type: String, default: ''},
}, {timestamps: true});

export default model('Session', sessionSchema);