import Class from '../models/classes.js'
import User from '../models/Users.js'

export async function classes(req,res){
    try{
        const classes = await Class.find({}); 
        if(!classes){
            return res.status(404).json({message:"No classes found"});
        }  
        return res.status(200).json(classes);
    }catch(err){
        return res.status(500).json({message:"Server error"});
    }       
}
export async function enroll(req,res){
    const {classId} = req.body;
    const userId = req.user._id;
    try{
        const classObj = await Class.findById(classId);
        if(!classObj){
            return res.status(404).json({message:"Class not found"});
        }
        if(classObj.members.includes(userId)){
            return res.status(400).json({message:"User already enrolled in this class"});
        }
        classObj.members.push(userId);
        await classObj.save();
        return res.status(200).json({message:"Enrolled successfully"});
    }catch(err){
        return res.status(500).json({message:"Server error"});
    }
} 
export const showmembers = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    try{
        const classObj = await Class.findById(id).populate('members', 'name email skills');
        console.log(classObj);
        if(!classObj){
            return res.status(404).json({message:"Class not found"});
        }   
        return res.status(200).json(classObj.members);
    }catch(err){
        return res.status(500).json({message:"Server error"});  
    }
}  
