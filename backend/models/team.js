import {model,Schema} from "mongoose";

const teamSchema = new Schema({
    fromUser: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    toUser: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    status: {type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending'},
    description: {type: String},
    createdAt: {type: Date, default: Date.now}
}, {timestamps: true});

export default model("Team", teamSchema);