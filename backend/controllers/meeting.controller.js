import Meeting from '../models/meeting.js';
import User from '../models/Users.js';
import Match from '../models/match.js';

export const getMeetings = async (req, res) => {
  try {
    const userId = req.user._id;
    const meetings = await Meeting.find({
      $or: [
        { organizer: userId },
        { participants: userId }
      ]
    })
    .populate('organizer', 'name email')
    .populate('participants', 'name email')
    .populate('match', 'skillfromuser1 skillfromuser2 status')
    .sort({ date: 1 });
    
    res.status(200).json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAvailableMatches = async (req, res) => {
  try {
    const userId = req.user._id;
    const matches = await Match.find({ 
      $or: [{ user1: userId }, { user2: userId }],
      status: 'accepted' // Only active skill swaps
    })
    .populate('user1', 'name email')
    .populate('user2', 'name email')
    .sort({ updatedAt: -1 });
    
    res.status(200).json(matches);
  } catch (error) {
    console.error('Error fetching available matches:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createMeeting = async (req, res) => {
  try {
    const { title, description, date, duration, matchId } = req.body;
    const organizer = req.user._id;
    
    // Verify the match exists and user is part of it
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    if (String(match.user1) !== String(organizer) && String(match.user2) !== String(organizer)) {
      return res.status(403).json({ message: 'You can only schedule meetings with your skill swap partners' });
    }
    
    if (match.status !== 'accepted') {
      return res.status(400).json({ message: 'Can only schedule meetings for accepted skill swaps' });
    }
    
    // Get the other participant
    const otherParticipant = String(match.user1) === String(organizer) ? match.user2 : match.user1;
    
    const meeting = new Meeting({
      title,
      description,
      date: new Date(date),
      duration: duration || 60,
      participants: [otherParticipant], // The other person in the skill swap
      organizer,
      match: matchId
    });
    
    await meeting.save();
    await meeting.populate('organizer', 'name email');
    await meeting.populate('participants', 'name email');
    await meeting.populate('match', 'skillfromuser1 skillfromuser2');
    
    res.status(201).json(meeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user._id;
    const updates = req.body;
    
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    if (meeting.organizer.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this meeting' });
    }
    
    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      updates,
      { new: true }
    ).populate('organizer', 'name email')
     .populate('participants', 'name email');
    
    res.status(200).json(updatedMeeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user._id;
    
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    if (meeting.organizer.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this meeting' });
    }
    
    await Meeting.findByIdAndDelete(meetingId);
    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
