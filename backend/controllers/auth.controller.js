import {generateToken} from "../lib/utils.js";
import User from "../models/Users.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import {config} from 'dotenv';
config();


export const signup = async(req,res)=>{
    const {name,email,password,skills_offered,skills_wanted} = req.body;
    try{
        if(!name||!email||!password){
            return res.status(400).json({message:"Please provide all the fields"});
        }
        name=name.trim();
        email=email.trim().toLowerCase();
        skills_offered=skills_offered?skills_offered.trim():"";
        skills_wanted=skills_wanted?skills_wanted.trim():"";    
        if(!/^[^\s@]+@vitstudent\.ac\.in$/i.test(email)){
            return res.status(400).json({message:"Only @vitstudent.ac.in emails are allowed"});
        }

        if(password.length<6){
            return res.status(400).json({message:"Password must be at least 6 characters"});
        }

        const userexists = await User.findOne({email});

        if(userexists){
            return res.status(400).json({message:"User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            name, email, password: hashedpassword, skills_offered, skills_wanted
        })

        if(newUser){
            generateToken(newUser._id,res);
            await newUser.save();
            return res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                skills_offered: newUser.skills_offered,
                skills_wanted: newUser.skills_wanted
            })
        }else{
            return res.status(400).json({message:"Invalid user data"});
        }   
    }catch(err){
        console.log("Error in Signup:",err);
        res.status(500).json({message:"Server error"});
    }
}

export const login = async(req,res)=>{
    const {email,password} = req.body;
    try{
        if(!email||!password){
            return res.status(400).json({message:"Please provide all the fields"});
        }

        const user = await User.findOne({ email });
        console.log(user);
        if(!user){
            return res.status(400).json({message:"User does not exist"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({message:"Invalid credentials"});
        }

        generateToken(user._id,res);
        const { _id, name, email: userEmail, skills_offered, skills_wanted } = user;
        res.status(200).json({ _id, name, email: userEmail, skills_offered, skills_wanted })
    }catch(err){
        console.log("Error in login:",err);
        return res.status(500).json({message:"Internal Server error"});
    }
}

export const logout = (req,res)=>{
    try{
        // Clear cookie using same attributes as set to ensure removal
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('jwt','',{ httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', expires: new Date(0) });
        return res.status(200).json({message:"Logged out successfully"});
    }catch(err){
        console.log("Error in logout:",err);
        return res.status(500).json({message:"Internal Server error"});
    }
}

export const checkAuth = async(req,res)=>{
    try{
        const user = await User.findById(req.user._id).select('-password');
        if(!user){
            return res.status(400).json({message:"User does not exist"});
        }
        return res.status(200).json(user);
    }catch(err){
        console.log("Error in checkAuth:",err);
        return res.status(500).json({message:"Internal Server error"});
    }
}

export const updateSkills = async(req,res)=>{
    try{
        const {skills_offered, skills_wanted} = req.body;
        const userId = req.user._id;

        if(!userId){
            return res.status(401).json({message:"Not authorized"});
        }

        const updateData = {};
        if(skills_offered !== undefined) updateData.skills_offered = skills_offered;
        if(skills_wanted !== undefined) updateData.skills_wanted = skills_wanted;

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            {new: true}
        ).select('-password');

        if(!updatedUser){
            return res.status(404).json({message:"User not found"});
        }

        return res.status(200).json(updatedUser);
    }catch(err){
        console.log("Error in updateSkills:",err);
        return res.status(500).json({message:"Internal Server error"});
    }
}

export const searchUsers = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) return res.json([]);
        // Escape regex chars, also allow spaces to match across words
        const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = safe.replace(/\s+/g, '.*');
        const regex = new RegExp(pattern, 'i');
        const users = await User.find({
            $or: [
                { name: regex },
                { email: regex },
                { skills_offered: regex },
                { skills_wanted: regex },
            ]
        }).select('-password').limit(20);
        res.json(users);
    } catch (err) {
        console.log('Error in searchUsers:', err);
        res.status(500).json({ message: 'Server Error' });
    }
}

export const getPublicUser = async (req, res) => {
    try {
        const {name} = req.params;
        console.log(name);
        if (!name) return res.status(400).json({ message: 'Name parameter is required' });
        const user = await User.findOne({"name":name}).select('-password');
        if(!user) {
            user=await User.findOne({"name":name+" "}).select('-password')
        };
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.log('Error in getPublicUser:', err);
        res.status(500).json({ message: 'Server Error' });
    }
}


export const deleteUser = async(req,res) =>{
    const token = req.cookies.jwt;
    try{
        if(!token){
            return res.status(401).json({message:"Not authorized"});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        console.log(decoded);
        const userId = await User.findByIdAndDelete(decoded.id).select('-password');

        if(!userId){
            return res.status(404).json({message:"User not found"});
        }          
        return res.status(200).json({message:"User deleted successfully"});
    }catch(err){
        console.log(err);
        return res.status(401).json({message:"Not authorized, token failed"});
    }
}

export const updateUser = async(req,res) =>{
    const token = req.cookies.jwt;  
    try{
        if(!token){
            res.status(401).json({message:"Not authorized"});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        const userId = decoded.id;
        const {name,email,password} = req.body;
        const updateData = {};
        if(name) updateData.name = name;
        if(email) updateData.email = email;
        if(password){
            if(password.length<6){
                return res.status(400).json({message:"Password must be at least 6 characters"});
            }
            const salt = await bcrypt.genSalt(10);
            const hashedpassword = await bcrypt.hash(password,salt);
            updateData.password = hashedpassword;
        }
        const updatedUser = await User.findByIdAndUpdate(userId,updateData,{new:true}).select('-password');
        if(!updatedUser){
            res.status(500).json({"message":"Internal Server Error - Cannot update user"});
        }
    }catch(err){
        res.status(401).json({message:"Not authorized, token failed"});
    }
}