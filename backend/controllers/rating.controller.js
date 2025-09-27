import Rating from '../models/rating.js';
import Match from '../models/match.js';
import User from '../models/Users.js';

// Create a rating for a completed skill swap
export const createRating = async (req, res) => {
  try {
    const { matchId, rating, review, skillRated } = req.body;
    const raterId = req.user._id;

    if (!matchId || !rating || !skillRated) {
      return res.status(400).json({ message: 'Match ID, rating, and skill rated are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Verify the match exists and user is part of it
    const match = await Match.findOne({
      _id: matchId,
      status: 'accepted',
      $or: [{ user1: raterId }, { user2: raterId }]
    });

    if (!match) {
      return res.status(404).json({ message: 'Match not found or you are not authorized to rate it' });
    }

    // Check if user already rated this match
    const existingRating = await Rating.findOne({
      rater: raterId,
      match: matchId
    });

    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this skill swap' });
    }

    // Get the other user (ratee)
    const rateeId = String(match.user1) === String(raterId) ? match.user2 : match.user1;

    const newRating = new Rating({
      rater: raterId,
      ratee: rateeId,
      match: matchId,
      rating,
      review: review || '',
      skillRated
    });

    await newRating.save();

    const populatedRating = await Rating.findById(newRating._id)
      .populate('rater', 'name')
      .populate('ratee', 'name')
      .populate('match');

    res.status(201).json(populatedRating);
  } catch (error) {
    console.error('Error creating rating:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already rated this skill swap' });
    }
    res.status(500).json({ message: 'Failed to create rating' });
  }
};

// Get ratings for a user (both given and received)
export const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user._id;

    // If no userId provided, get current user's ratings
    const targetUserId = userId || requestingUserId;

    const receivedRatings = await Rating.find({ ratee: targetUserId })
      .populate('rater', 'name')
      .populate('match')
      .sort({ createdAt: -1 });

    const givenRatings = await Rating.find({ rater: targetUserId })
      .populate('ratee', 'name')
      .populate('match')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const averageRating = receivedRatings.length > 0 
      ? receivedRatings.reduce((sum, r) => sum + r.rating, 0) / receivedRatings.length
      : 0;

    res.json({
      received: receivedRatings,
      given: givenRatings,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: receivedRatings.length
    });
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    res.status(500).json({ message: 'Failed to fetch ratings' });
  }
};

// Get pending ratings (matches that can be rated)
export const getPendingRatings = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find accepted matches where user hasn't rated yet
    const userMatches = await Match.find({
      status: 'accepted',
      $or: [{ user1: userId }, { user2: userId }]
    })
    .populate('user1', 'name')
    .populate('user2', 'name');

    // Get matches that user hasn't rated yet
    const ratedMatches = await Rating.find({ rater: userId }).distinct('match');
    
    const pendingRatings = userMatches.filter(match => 
      !ratedMatches.some(ratedMatch => 
        String(ratedMatch) === String(match._id)
      )
    );

    res.json(pendingRatings);
  } catch (error) {
    console.error('Error fetching pending ratings:', error);
    res.status(500).json({ message: 'Failed to fetch pending ratings' });
  }
};

// Update a rating
export const updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user._id;

    const existingRating = await Rating.findOne({
      _id: ratingId,
      rater: userId
    });

    if (!existingRating) {
      return res.status(404).json({ message: 'Rating not found or you are not authorized to update it' });
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      existingRating.rating = rating;
    }

    if (review !== undefined) {
      existingRating.review = review;
    }

    await existingRating.save();

    const updatedRating = await Rating.findById(ratingId)
      .populate('rater', 'name')
      .populate('ratee', 'name')
      .populate('match');

    res.json(updatedRating);
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ message: 'Failed to update rating' });
  }
};

// Delete a rating
export const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user._id;

    const rating = await Rating.findOne({
      _id: ratingId,
      rater: userId
    });

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found or you are not authorized to delete it' });
    }

    await Rating.findByIdAndDelete(ratingId);
    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({ message: 'Failed to delete rating' });
  }
};