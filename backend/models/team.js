import {model,Schema} from "mongoose";

// Team model for actual teams
const teamSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    creator: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    members: [{type: Schema.Types.ObjectId, ref: 'User'}],
    maxMembers: {type: Number, default: 6},
    skillsRequired: [{type: String}],
    category: {type: String, enum: ['hackathon', 'project', 'study', 'other'], default: 'hackathon'},
    event: {type: Schema.Types.ObjectId, ref: 'Event'},
    isPublic: {type: Boolean, default: true},
    status: {type: String, enum: ['active', 'full', 'inactive'], default: 'active'},
    createdAt: {type: Date, default: Date.now}
}, {timestamps: true});

// Team request model for joining teams
const teamRequestSchema = new Schema({
    fromUser: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    toUser: {type: Schema.Types.ObjectId, ref: 'User'},
    toTeam: {type: Schema.Types.ObjectId, ref: 'Team'},
    fromTeam: {type: Schema.Types.ObjectId, ref: 'Team'},
    status: {type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending'},
    description: {type: String},
    requestType: {type: String, enum: ['join_team', 'invite_user'], required: true},
    createdAt: {type: Date, default: Date.now}
}, {timestamps: true});

export const Team = model("Team", teamSchema);
export const TeamRequest = model("TeamRequest", teamRequestSchema);

// Keep backward compatibility
export default model("TeamRequest", teamRequestSchema);
