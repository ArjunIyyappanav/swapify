import jwt from 'jsonwebtoken';
import {config} from 'dotenv';
config();

export const generateToken = (userId,res)=>{
    const token = jwt.sign({id:userId},process.env.JWT_SECRET_KEY,{expiresIn:'7d'});
    console.log(jwt.verify(token,process.env.JWT_SECRET_KEY));
    // In dev with different ports (5173 vs 3000) we need SameSite=None and secure=false only for localhost.
    // Browsers require secure=true when SameSite=None, but localhost is treated specially by modern browsers.
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: true, // set true in production behind https
        sameSite: 'none',
        maxAge: 7*24*60*60*1000
    })  
}

