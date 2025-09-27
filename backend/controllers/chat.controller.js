import Match from "../models/match.js";
import Message from "../models/message.js";

export const listMyMatches = async (req, res) => {
  try {
    const userId = req.user?._id;
    const matches = await Match.find({ $or: [{ user1: userId }, { user2: userId }] })
      .populate('user1','name email')
      .populate('user2','name email')
      .sort({ updatedAt: -1 });
    res.json(matches);
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
    const isUser1 = String(match.user1) === String(userId);
    if (!isUser1 && String(match.user2) !== String(userId)) return res.status(403).json({ message: 'Forbidden' });
    const recipient = isUser1 ? match.user2 : match.user1;
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