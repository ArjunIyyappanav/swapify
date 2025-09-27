import { Router } from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getEvents, createEvent, joinEvent } from '../controllers/event.controller.js';

const eventRouter = Router();

eventRouter.get('/events', protectRoute, getEvents);
eventRouter.post('/events', protectRoute, createEvent);
eventRouter.post('/events/:eventId/join', protectRoute, joinEvent);

export default eventRouter;
