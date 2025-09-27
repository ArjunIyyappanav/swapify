import { Router } from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getMeetings, createMeeting, updateMeeting, deleteMeeting, getAvailableMatches } from '../controllers/meeting.controller.js';

const meetingRouter = Router();

meetingRouter.get('/meet', protectRoute, getMeetings);
meetingRouter.get('/meet/matches', protectRoute, getAvailableMatches);
meetingRouter.post('/meet', protectRoute, createMeeting);
meetingRouter.put('/meet/:meetingId', protectRoute, updateMeeting);
meetingRouter.delete('/meet/:meetingId', protectRoute, deleteMeeting);

export default meetingRouter;
