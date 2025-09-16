import Class from '../models/classes.js'

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

// export async function createClass(req,res){
//     const {name,description} = req.body;      
//     console.log(name,description);      
//     try{
//         const existingClass = await Class.findOne({name});  
//         if(existingClass){
//             return res.status(400).json({message:"Class with this name already exists"});
//         }   
//         const newClass = new Class({name,description});
//         await newClass.save();
//         return res.status(201).json({message:"Class created successfully", class:newClass});
//     }catch(err){
//         return res.status(500).json({message:"Server error"});
//     }
// }