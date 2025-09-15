import { Router } from "express";
import { blockUser, unblockUser, getBlockedUsers, isUserBlocked } from "../controllers/block.controller.js";
import { protectRoute } from '../middleware/auth.middleware.js';

const blockRouter = Router();

blockRouter.post('/block', protectRoute, blockUser);
blockRouter.post('/unblock', protectRoute, unblockUser);
blockRouter.get('/blocked-users', protectRoute, getBlockedUsers);
blockRouter.get('/is-blocked/:userId', protectRoute, isUserBlocked);

export default blockRouter;
