import {Router} from "express";
import {signup,login,logout,checkAuth} from "../controllers/auth.controller.js";
import User from "../models/Users.js";
import Match from "../models/match.js";
import {protectRoute} from '../middleware/auth.middleware.js'

const authrouter = Router();

authrouter.post('/auth/signup',signup);
authrouter.post('/auth/login',login);
authrouter.post('/auth/logout',logout);
authrouter.get('/auth/checkAuth',protectRoute,checkAuth);

export default authrouter;