import {Router} from 'express';
import {protectRoute} from '../middleware/auth.middleware.js'
import { 
  createTeamRequest, updateRequestStatus, getRequests, deleteRequest, checkPending, getMyRequests, getMyMatches,
  createTeam, getAllTeams, getMyTeams, requestToJoinTeam, handleTeamJoinRequest, leaveTeam, updateTeam, deleteTeam
} from '../controllers/team.controller.js';
const teamrouter = Router();

// Legacy team request routes (keep for backward compatibility)
teamrouter.post('/team/create',protectRoute,createTeamRequest);
teamrouter.get('/team/getteam/:id',protectRoute,getRequests);
teamrouter.get('/team/pending/:username',protectRoute,checkPending);
teamrouter.get('/team/mine',protectRoute,getMyRequests);
//teamrouter.get('/teammatch/mine',protectRoute,getMyMatches);
teamrouter.patch('/team/update',protectRoute,updateRequestStatus);
teamrouter.delete('/team/delete/:id',protectRoute,deleteRequest);

// New team management routes
teamrouter.post('/teams/create', protectRoute, createTeam);
teamrouter.get('/teams', protectRoute, getAllTeams);
teamrouter.get('/teams/my', protectRoute, getMyTeams);
teamrouter.post('/teams/join', protectRoute, requestToJoinTeam);
teamrouter.patch('/teams/join-request', protectRoute, handleTeamJoinRequest);
teamrouter.post('/teams/:teamId/leave', protectRoute, leaveTeam);
teamrouter.patch('/teams/:teamId', protectRoute, updateTeam);
teamrouter.delete('/teams/:teamId', protectRoute, deleteTeam);

export default teamrouter;