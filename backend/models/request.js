import {model,Schema} from "mongoose";

const requestSchema = new Schema({
    fromUser: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    toUser: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    status: {type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending'},
    skillOffered: {type: String},
    skillRequested: {type: String},
    createdAt: {type: Date, default: Date.now}
}, {timestamps: true});

export default model("Request", requestSchema);