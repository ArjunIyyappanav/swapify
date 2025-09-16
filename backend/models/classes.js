import mongoose from 'mongoose'

const ClassSchema = new mongoose.Schema({
    name:{type:String, required:true, unique:true},
    description:{type:String, required:true},
    members:{type:[mongoose.Schema.Types.ObjectId], ref:'User', default:[]},
    createdAt:{type:Date, default:Date.now}
})

export default mongoose.model('Class', ClassSchema);