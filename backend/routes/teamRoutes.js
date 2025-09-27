import {Router} from 'express';
import {protectRoute} from '../middleware/auth.middleware.js'
import { createTeamRequest,updateRequestStatus,getRequests,deleteRequest,checkPending,getMyRequests,getMyMatches, getAllTeams } from '../controllers/team.controller.js';
const teamrouter = Router();

teamrouter.get('/teams', protectRoute, getAllTeams);
teamrouter.post('/team/create',protectRoute,createTeamRequest);
teamrouter.get('/team/getteam/:id',protectRoute,getRequests);
teamrouter.get('/team/pending/:username',protectRoute,checkPending);
teamrouter.get('/team/mine',protectRoute,getMyRequests);
//teamrouter.get('/teammatch/mine',protectRoute,getMyMatches);
teamrouter.patch('/team/update',protectRoute,updateRequestStatus);
teamrouter.delete('/team/delete/:id',protectRoute,deleteRequest);

export default teamrouter;