import { Router } from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { 
  getMyMeetings, 
  getAvailableMatches, 
  scheduleMeeting, 
  updateMeeting, 
  cancelMeeting 
} from '../controllers/meeting.controller.js';

const meetingRouter = Router();

meetingRouter.get('/meet', protectRoute, getMyMeetings);
meetingRouter.get('/meet/available-matches', protectRoute, getAvailableMatches);
meetingRouter.post('/meet', protectRoute, scheduleMeeting);
meetingRouter.patch('/meet/:meetingId', protectRoute, updateMeeting);
meetingRouter.delete('/meet/:meetingId', protectRoute, cancelMeeting);

export default meetingRouter;