import Meeting from '../models/meeting.js';
import Match from '../models/match.js';
import User from '../models/Users.js';

// Get all meetings for the authenticated user
export const getMyMeetings = async (req, res) => {
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
    .populate({
      path: 'match',
      populate: [
        { path: 'user1', select: 'name email' },
        { path: 'user2', select: 'name email' }
      ]
    })
    .sort({ date: 1 });

    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ message: 'Failed to fetch meetings' });
  }
};

// Get available matches for scheduling meetings
export const getAvailableMatches = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all accepted matches where user is involved
    const matches = await Match.find({
      $and: [
        { status: 'accepted' },
        { $or: [{ user1: userId }, { user2: userId }] }
      ]
    })
    .populate('user1', 'name email')
    .populate('user2', 'name email');

    // Filter out matches that already have scheduled meetings
    const matchesWithMeetings = await Meeting.find({
      match: { $in: matches.map(m => m._id) }
    }).distinct('match');

    const availableMatches = matches.filter(
      match => !matchesWithMeetings.some(meetingMatch => 
        String(meetingMatch) === String(match._id)
      )
    );

    res.json(availableMatches);
  } catch (error) {
    console.error('Error fetching available matches:', error);
    res.status(500).json({ message: 'Failed to fetch available matches' });
  }
};

// Schedule a new meeting
export const scheduleMeeting = async (req, res) => {
  try {
    const { matchId, title, description, date, duration, meetingLink } = req.body;
    const userId = req.user._id;

    if (!matchId || !title || !date) {
      return res.status(400).json({ message: 'Match ID, title, and date are required' });
    }

    // Verify the match exists and user is part of it
    const match = await Match.findOne({
      _id: matchId,
      status: 'accepted',
      $or: [{ user1: userId }, { user2: userId }]
    });

    if (!match) {
      return res.status(404).json({ message: 'Match not found or you are not authorized to schedule a meeting for it' });
    }

    // Check if meeting already exists for this match
    const existingMeeting = await Meeting.findOne({
      match: matchId
    });

    if (existingMeeting) {
      return res.status(400).json({ message: 'A meeting is already scheduled for this match' });
    }

    // Get the other participant
    const otherUserId = String(match.user1) === String(userId) ? match.user2 : match.user1;

    const meeting = new Meeting({
      title,
      description,
      date: new Date(date),
      duration: duration || 60,
      organizer: userId,
      participants: [userId, otherUserId],
      match: matchId,
      meetingLink
    });

    await meeting.save();
    
    // Populate the meeting before sending response
    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('organizer', 'name email')
      .populate('participants', 'name email')
      .populate({
        path: 'match',
        populate: [
          { path: 'user1', select: 'name email' },
          { path: 'user2', select: 'name email' }
        ]
      });

    res.status(201).json(populatedMeeting);
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({ message: 'Failed to schedule meeting' });
  }
};

// Update meeting status or details
export const updateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { status, title, description, date, duration, meetingLink } = req.body;
    const userId = req.user._id;

    const meeting = await Meeting.findOne({
      _id: meetingId,
      $or: [
        { organizer: userId },
        { participants: userId }
      ]
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found or you are not authorized to update it' });
    }

    // Update allowed fields
    if (status) meeting.status = status;
    if (title && String(meeting.organizer) === String(userId)) meeting.title = title;
    if (description && String(meeting.organizer) === String(userId)) meeting.description = description;
    if (date && String(meeting.organizer) === String(userId)) meeting.date = new Date(date);
    if (duration && String(meeting.organizer) === String(userId)) meeting.duration = duration;
    if (meetingLink && String(meeting.organizer) === String(userId)) meeting.meetingLink = meetingLink;

    await meeting.save();

    const updatedMeeting = await Meeting.findById(meetingId)
      .populate('organizer', 'name email')
      .populate('participants', 'name email')
      .populate({
        path: 'match',
        populate: [
          { path: 'user1', select: 'name email' },
          { path: 'user2', select: 'name email' }
        ]
      });

    res.json(updatedMeeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ message: 'Failed to update meeting' });
  }
};

// Delete/Cancel a meeting
export const cancelMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user._id;

    const meeting = await Meeting.findOne({
      _id: meetingId,
      organizer: userId
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found or you are not authorized to cancel it' });
    }

    // Delete the meeting instead of updating status to avoid match validation issues
    await Meeting.findByIdAndDelete(meetingId);

    res.json({ message: 'Meeting cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling meeting:', error);
    res.status(500).json({ message: 'Failed to cancel meeting' });
  }
};
