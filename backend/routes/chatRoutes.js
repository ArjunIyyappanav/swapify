import { Router } from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { listMyMatches, listMessages, sendMessage, markRead } from '../controllers/chat.controller.js';

const chatRouter = Router();

chatRouter.get('/chat/matches', protectRoute, listMyMatches);
chatRouter.get('/chat/:matchId/messages', protectRoute, listMessages);
chatRouter.post('/chat/:matchId/messages', protectRoute, sendMessage);
chatRouter.post('/chat/:matchId/read', protectRoute, markRead);

export default chatRouter; 