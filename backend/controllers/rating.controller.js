import Rating from '../models/rating.js';
import User from '../models/Users.js';

export const getRatings = async (req, res) => {
  try {
    const userId = req.user._id;
    const ratings = await Rating.find({ toUser: userId })
      .populate('fromUser', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createRating = async (req, res) => {
  try {
    const { toUserId, stars, comment, swapId } = req.body;
    const fromUserId = req.user._id;
    
    if (fromUserId.toString() === toUserId.toString()) {
      return res.status(400).json({ message: 'Cannot rate yourself' });
    }
    
    // Check if user exists
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if rating already exists for this swap
    if (swapId) {
      const existingRating = await Rating.findOne({
        fromUser: fromUserId,
        toUser: toUserId,
        swapId
      });
      
      if (existingRating) {
        return res.status(400).json({ message: 'Already rated this swap' });
      }
    }
    
    const rating = new Rating({
      fromUser: fromUserId,
      toUser: toUserId,
      stars,
      comment,
      swapId
    });
    
    await rating.save();
    await rating.populate('fromUser', 'name email');
    await rating.populate('toUser', 'name email');
    
    res.status(201).json(rating);
  } catch (error) {
    console.error('Error creating rating:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already rated this user for this swap' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyRatings = async (req, res) => {
  try {
    const userId = req.user._id;
    const ratings = await Rating.find({ fromUser: userId })
      .populate('toUser', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(ratings);
  } catch (error) {
    console.error('Error fetching my ratings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user._id;
    const { stars, comment } = req.body;
    
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    if (rating.fromUser.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this rating' });
    }
    
    const updatedRating = await Rating.findByIdAndUpdate(
      ratingId,
      { stars, comment },
      { new: true }
    ).populate('fromUser', 'name email')
     .populate('toUser', 'name email');
    
    res.status(200).json(updatedRating);
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user._id;
    
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    if (rating.fromUser.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this rating' });
    }
    
    await Rating.findByIdAndDelete(ratingId);
    res.status(200).json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
