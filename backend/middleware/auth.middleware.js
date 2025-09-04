import jwt from 'jsonwebtoken';
import User from '../models/Users.js'
import {config} from 'dotenv';
config();

export const protectRoute = async (req, res, next) => { 
    try{
        let token;
        token = req.cookies.jwt;
        console.log("Token from cookies:",token);
        if(!token){
            return res.status(401).json({message:"Not authorized, no token"});
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        console.log(decoded);
        let user = await User.findById(decoded.id).select('-password');
        console.log("User from token:",user);
        if(!user){
            return res.status(401).json({message:"Not authorized, user not found"});
        }

        req.user = user;
        next();
    }catch(err){
        console.log(err);
        return res.status(401).json({message:"Not authorized, token failed"});
    }
}