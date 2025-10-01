import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true,unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    skills_offered: {type: [String], default: []},
    skills_wanted: {type: [String], default: []},
    rating: {type: Number, default: 5.0, min: 1, max: 5},
    totalRatings: {type: Number, default: 0}
}, {timestamps: true});

export default mongoose.model('User', userSchema);