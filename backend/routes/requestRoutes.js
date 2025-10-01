import {Router} from 'express';
import {protectRoute} from '../middleware/auth.middleware.js'
import { createRequest,updateRequestStatus,getRequests,deleteRequest,checkPending,getMyRequests,getMyMatches,clearAllRequests } from '../controllers/requests.controller.js';
const requestsrouter = Router();

requestsrouter.post('/request/create',protectRoute,createRequest);
requestsrouter.get('/request/getreq/:id',protectRoute,getRequests);
requestsrouter.get('/request/pending/:username',protectRoute,checkPending);
requestsrouter.get('/request/mine',protectRoute,getMyRequests);
requestsrouter.get('/match/mine',protectRoute,getMyMatches);
requestsrouter.patch('/requests/update',protectRoute,updateRequestStatus);
requestsrouter.delete('/request/delete/:id',protectRoute,deleteRequest);
requestsrouter.delete('/requests/clear',protectRoute,clearAllRequests);

export default requestsrouter;