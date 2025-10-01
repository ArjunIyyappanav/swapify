import Match from "../models/match.js";
import Message from "../models/message.js";
import BlockedUser from "../models/BlockedUser.js";
import Rating from "../models/rating.js";
import path from "path";
import fs from "fs";

export const listMyMatches = async (req, res) => {
  try {
    const userId = req.user?._id;
    
    // Get blocked users
    const blockedUsers = await BlockedUser.find({
      $or: [
        { blocker: userId },
        { blocked: userId }
      ]
    });
    
    const blockedUserIds = new Set();
    blockedUsers.forEach(block => {
      if (String(block.blocker) === String(userId)) {
        blockedUserIds.add(String(block.blocked));
      } else {
        blockedUserIds.add(String(block.blocker));
      }
    });
    
    const matches = await Match.find({ 
      $or: [{ user1: userId }, { user2: userId }],
      status: { $ne: 'ended' } // Don't show ended matches
    })
      .populate('user1','name email')
      .populate('user2','name email')
      .sort({ updatedAt: -1 });
    
    // Filter out matches with blocked users
    const filteredMatches = matches.filter(match => {
      const otherUserId = String(match.user1._id) === String(userId) 
        ? String(match.user2._id) 
        : String(match.user1._id);
      return !blockedUserIds.has(otherUserId);
    });
    
    res.json(filteredMatches);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const listMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user?._id;
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (String(match.user1) !== String(userId) && String(match.user2) !== String(userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const messages = await Message.find({ match: matchId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (!content || !content.trim()) return res.status(400).json({ message: 'Content required' });
    
    // Check if match is ended
    if (match.status === 'ended') {
      return res.status(400).json({ message: 'Cannot send messages to ended chats' });
    }
    
    const isUser1 = String(match.user1) === String(userId);
    if (!isUser1 && String(match.user2) !== String(userId)) return res.status(403).json({ message: 'Forbidden' });
    
    const recipient = isUser1 ? match.user2 : match.user1;
    
    // Check if users have blocked each other
    const blockExists = await BlockedUser.findOne({
      $or: [
        { blocker: userId, blocked: recipient },
        { blocker: recipient, blocked: userId }
      ]
    });
    
    if (blockExists) {
      return res.status(403).json({ message: 'Cannot send messages to blocked users' });
    }
    
    const msg = await Message.create({ match: matchId, sender: userId, recipient, content: content.trim() });
    // Broadcast via socket if available
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`match:${matchId}`).emit('message', msg);
      }
    } catch {}
    res.status(201).json(msg);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const markRead = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user?._id;
    await Message.updateMany({ match: matchId, recipient: userId, readAt: { $exists: false } }, { $set: { readAt: new Date() } });
    res.json({ ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Server Error' });
  }
}; 

// End a chat/match and prompt for rating
export const endChat = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user._id;
    
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Verify user is part of the match
    if (String(match.user1) !== String(userId) && String(match.user2) !== String(userId)) {
      return res.status(403).json({ message: 'You are not authorized to end this chat' });
    }
    
    // Check if match is already ended
    if (match.status === 'ended') {
      return res.status(400).json({ message: 'Chat is already ended' });
    }
    
    // End the match
    match.status = 'ended';
    match.endedAt = new Date();
    match.endedBy = userId;
    await match.save();
    
    // Check if user has already rated this match
    const existingRating = await Rating.findOne({
      rater: userId,
      match: matchId
    });
    
    const response = {
      message: 'Chat ended successfully',
      needsRating: !existingRating,
      match: {
        _id: match._id,
        user1: match.user1,
        user2: match.user2,
        skillfromuser1: match.skillfromuser1,
        skillfromuser2: match.skillfromuser2,
        status: match.status
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error ending chat:', error);
    res.status(500).json({ message: 'Failed to end chat' });
  }
};

// Get chat status (for checking if ended, blocked, etc.)
export const getChatStatus = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user._id;
    
    const match = await Match.findById(matchId)
      .populate('user1', 'name')
      .populate('user2', 'name');
      
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Verify user is part of the match
    if (String(match.user1._id) !== String(userId) && String(match.user2._id) !== String(userId)) {
      return res.status(403).json({ message: 'You are not authorized to view this chat' });
    }
    
    const otherUserId = String(match.user1._id) === String(userId) ? match.user2._id : match.user1._id;
    
    // Check if users have blocked each other
    const blockExists = await BlockedUser.findOne({
      $or: [
        { blocker: userId, blocked: otherUserId },
        { blocker: otherUserId, blocked: userId }
      ]
    });
    
    // Check if user has rated this match
    const hasRated = await Rating.findOne({
      rater: userId,
      match: matchId
    });
    
    res.json({
      matchId: match._id,
      status: match.status,
      isEnded: match.status === 'ended',
      isBlocked: !!blockExists,
      hasRated: !!hasRated,
      endedAt: match.endedAt,
      endedBy: match.endedBy,
      otherUser: {
        _id: otherUserId,
        name: String(match.user1._id) === String(userId) ? match.user2.name : match.user1.name
      }
    });
  } catch (error) {
    console.error('Error getting chat status:', error);
    res.status(500).json({ message: 'Failed to get chat status' });
  }
};

// Upload file in chat
export const uploadFile = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user._id;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    
    // Check if match is ended
    if (match.status === 'ended') {
      return res.status(400).json({ message: 'Cannot send files to ended chats' });
    }
    
    const isUser1 = String(match.user1) === String(userId);
    if (!isUser1 && String(match.user2) !== String(userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const recipient = isUser1 ? match.user2 : match.user1;
    
    // Check if users have blocked each other
    const blockExists = await BlockedUser.findOne({
      $or: [
        { blocker: userId, blocked: recipient },
        { blocker: recipient, blocked: userId }
      ]
    });
    
    if (blockExists) {
      return res.status(403).json({ message: 'Cannot send files to blocked users' });
    }
    
    // Create file message
    const msg = await Message.create({
      match: matchId,
      sender: userId,
      recipient,
      messageType: 'file',
      content: req.body.caption || '', // Optional caption
      file: {
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      }
    });
    
    // Broadcast via socket if available
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`match:${matchId}`).emit('message', msg);
      }
    } catch {}
    
    res.status(201).json(msg);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
};

// Download/serve uploaded files
export const downloadFile = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is part of the match
    const match = await Match.findById(message.match);
    if (!match || (String(match.user1) !== String(userId) && String(match.user2) !== String(userId))) {
      return res.status(403).json({ message: 'You are not authorized to download this file' });
    }
    
    if (!message.file || !message.file.path) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const filePath = path.resolve(message.file.path);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', message.file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${message.file.originalName}"`);
    
    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
};
