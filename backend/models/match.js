import {model,Schema} from "mongoose";

const matchSchema = new Schema({
    user1: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    user2: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    skillfromuser1: {type: String, required: true},
    skillfromuser2: {type: String, required: true},
    status: {type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending'},
    completedAt: {type: Date},
    createdAt: {type: Date, default: Date.now}
}, {timestamps: true});

export default model('Match', matchSchema);