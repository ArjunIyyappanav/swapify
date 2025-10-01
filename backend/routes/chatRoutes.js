import { Router } from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { listMyMatches, listMessages, sendMessage, markRead, endChat, getChatStatus, uploadFile, downloadFile } from '../controllers/chat.controller.js';
import upload from '../middleware/upload.middleware.js';

const chatRouter = Router();

chatRouter.get('/chat/matches', protectRoute, listMyMatches);
chatRouter.get('/chat/:matchId/messages', protectRoute, listMessages);
chatRouter.post('/chat/:matchId/messages', protectRoute, sendMessage);
chatRouter.post('/chat/:matchId/upload', protectRoute, upload.single('file'), uploadFile);
chatRouter.get('/chat/download/:messageId', protectRoute, downloadFile);
chatRouter.post('/chat/:matchId/read', protectRoute, markRead);
chatRouter.post('/chat/:matchId/end', protectRoute, endChat);
chatRouter.get('/chat/:matchId/status', protectRoute, getChatStatus);

export default chatRouter; 