import { Router } from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { 
  getAllEvents, 
  createEvent, 
  scrapeVITEvents, 
  updateEvent, 
  deleteEvent 
} from '../controllers/event.controller.js';

const eventRouter = Router();

// Get all events
eventRouter.get('/events', protectRoute, getAllEvents);

// Create a new event
eventRouter.post('/events', protectRoute, createEvent);

// Scrape VIT events (public endpoint)
eventRouter.post('/events/scrape', scrapeVITEvents);

// Update event
eventRouter.patch('/events/:eventId', protectRoute, updateEvent);

// Delete event
eventRouter.delete('/events/:eventId', protectRoute, deleteEvent);

export default eventRouter;