import BlockedUser from "../models/BlockedUser.js";
import User from "../models/Users.js";

export const blockUser = async (req, res) => {
    try {
        const { blockedUserId, reason } = req.body;
        const blockerId = req.user._id;

        if (!blockedUserId) {
            return res.status(400).json({ message: "User ID to block is required" });
        }

        if (blockerId.toString() === blockedUserId) {
            return res.status(400).json({ message: "You cannot block yourself" });
        }

        // Check if user exists
        const userToBlock = await User.findById(blockedUserId);
        if (!userToBlock) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already blocked
        const existingBlock = await BlockedUser.findOne({
            blocker: blockerId,
            blocked: blockedUserId
        });

        if (existingBlock) {
            return res.status(400).json({ message: "User is already blocked" });
        }

        // Create block record
        const blockedUser = new BlockedUser({
            blocker: blockerId,
            blocked: blockedUserId,
            reason: reason || ""
        });

        await blockedUser.save();

        return res.status(201).json({
            message: "User blocked successfully",
            blockedUser: {
                _id: userToBlock._id,
                name: userToBlock.name,
                email: userToBlock.email
            }
        });
    } catch (err) {
        console.log("Error in blockUser:", err);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const unblockUser = async (req, res) => {
    try {
        const { blockedUserId } = req.body;
        const blockerId = req.user._id;

        if (!blockedUserId) {
            return res.status(400).json({ message: "User ID to unblock is required" });
        }

        const blockedUser = await BlockedUser.findOneAndDelete({
            blocker: blockerId,
            blocked: blockedUserId
        });

        if (!blockedUser) {
            return res.status(404).json({ message: "User is not blocked" });
        }

        return res.status(200).json({ message: "User unblocked successfully" });
    } catch (err) {
        console.log("Error in unblockUser:", err);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const getBlockedUsers = async (req, res) => {
    try {
        const blockerId = req.user._id;

        const blockedUsers = await BlockedUser.find({ blocker: blockerId })
            .populate('blocked', 'name email')
            .select('blocked reason createdAt');

        return res.status(200).json(blockedUsers);
    } catch (err) {
        console.log("Error in getBlockedUsers:", err);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const isUserBlocked = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const isBlocked = await BlockedUser.findOne({
            $or: [
                { blocker: currentUserId, blocked: userId },
                { blocker: userId, blocked: currentUserId }
            ]
        });

        return res.status(200).json({ isBlocked: !!isBlocked });
    } catch (err) {
        console.log("Error in isUserBlocked:", err);
        return res.status(500).json({ message: "Server Error" });
    }
};
