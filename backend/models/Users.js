import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true,unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    skills_offered: {type: [String], default: []},
    skills_wanted: {type: [String], default: []},
}, {timestamps: true});

export default mongoose.model('User', userSchema);