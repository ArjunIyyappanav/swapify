import {Router} from "express";
import {signup,login,logout,checkAuth, searchUsers, getPublicUser, updateSkills, deleteUser,updateUser} from "../controllers/auth.controller.js";
import {protectRoute} from '../middleware/auth.middleware.js'

const authrouter = Router();

authrouter.post('/auth/signup',signup);
authrouter.post('/auth/login',login);
authrouter.post('/auth/logout',logout);
authrouter.get('/auth/checkAuth',protectRoute,checkAuth);
authrouter.put('/auth/updateSkills',protectRoute,updateSkills);
authrouter.get('/users/search', protectRoute, searchUsers);
authrouter.get('/users/:name', protectRoute, getPublicUser);
authrouter.delete('/auth/account',deleteUser);
authrouter.patch('/auth/updateProfile',updateUser);

export default authrouter;
