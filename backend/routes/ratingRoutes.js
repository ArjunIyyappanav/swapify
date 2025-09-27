import { Router } from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { 
  createRating, 
  getUserRatings, 
  getPendingRatings, 
  updateRating, 
  deleteRating 
} from '../controllers/rating.controller.js';

const ratingRouter = Router();

ratingRouter.post('/rating', protectRoute, createRating);
ratingRouter.get('/rating/user/:userId', protectRoute, getUserRatings);
ratingRouter.get('/rating/user', protectRoute, getUserRatings); // For current user
ratingRouter.get('/rating/pending', protectRoute, getPendingRatings);
ratingRouter.patch('/rating/:ratingId', protectRoute, updateRating);
ratingRouter.delete('/rating/:ratingId', protectRoute, deleteRating);

export default ratingRouter;