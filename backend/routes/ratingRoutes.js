import { Router } from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getRatings, createRating, getMyRatings, updateRating, deleteRating } from '../controllers/rating.controller.js';

const ratingRouter = Router();

ratingRouter.get('/ratings', protectRoute, getRatings);
ratingRouter.post('/ratings', protectRoute, createRating);
ratingRouter.get('/ratings/my', protectRoute, getMyRatings);
ratingRouter.put('/ratings/:ratingId', protectRoute, updateRating);
ratingRouter.delete('/ratings/:ratingId', protectRoute, deleteRating);

export default ratingRouter;
