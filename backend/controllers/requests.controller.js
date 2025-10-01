import Request from "../models/request.js";
import User from "../models/Users.js";
import Match from "../models/match.js";

export const createRequest = async (req, res) => {
    try {
        const { toUsername, status, createdAt, skillOffered, skillRequested } = req.body;

        if(!toUsername){
            return res.status(400).json({message:"toUsername is required"});
        }

        const toUserDoc = await User.findOne({ name: toUsername });
        if(!toUserDoc){
            return res.status(404).json({message:"Recipient user not found"});
        }

        const fromUser = req.user?._id;
        if(!fromUser){
            return res.status(401).json({message:"Not authorized"});
        }

        const newRequest = new Request({
            fromUser,
            toUser: toUserDoc._id,
            status: status || 'pending',
            skillOffered,
            skillRequested,
            createdAt
        });
        await newRequest.save();
        return res.status(201).json(newRequest);    
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Server Error"});
    }
}

export const checkPending = async(req,res) => {
    try{
        const { username } = req.params;
        if(!username){
            return res.status(400).json({message:"username is required"});
        }
        const toUserDoc = await User.findOne({ name: username });
        if(!toUserDoc){
            return res.status(404).json({message:"Recipient user not found"});
        }
        const fromUser = req.user?._id;
        if(!fromUser){
            return res.status(401).json({message:"Not authorized"});
        }
        const existing = await Request.findOne({ fromUser, toUser: toUserDoc._id, status: 'pending' });
        return res.status(200).json({ pending: !!existing });
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Server Error"});
    }
}

export const getMyRequests = async (req, res) => {
    try {
        const userId = req.user?._id;
        if(!userId){
            return res.status(401).json({message:"Not authorized"});
        }
        const sent = await Request.find({ fromUser: userId }).populate('toUser','name email');
        const received = await Request.find({ toUser: userId }).populate('fromUser','name email');
        return res.status(200).json({ sent, received });
    } catch (err) {
        console.log(err);
        return res.status(500).json({message:"Server Error"});
    }
}

export const getRequests = async(req,res) =>{
    const fromUser = req.params.id;
    try{
        if(!fromUser){
            return res.status(400).json({message:"User not found"});
        }

        const requests = await Request.find({fromUser});

        if(!requests || requests.length === 0){
            return res.status(404).json({message:"No requests found"});
        }

        return res.status(200).json(requests);
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Server Error"});
    }
}

export const updateRequestStatus = async(req,res) =>{
    const {requestId,status} = req.body;

    try{
        if(!requestId || !status){
            return res.status(400).json({message:"requestId and status are required"});
        }

        const updatedRequest = await Request.findByIdAndUpdate(requestId,{status:status},{new:true});

        if(!updatedRequest){
            return res.status(404).json({message:"Request not found"});
        }

        // If accepted, create a Match connecting the two users
        if (status === 'accepted') {
            // Check for existing active match (not ended)
            const existingActiveMatch = await Match.findOne({
                $or: [
                    { user1: updatedRequest.fromUser, user2: updatedRequest.toUser },
                    { user1: updatedRequest.toUser, user2: updatedRequest.fromUser },
                ],
                status: { $ne: 'ended' } // Only check for non-ended matches
            });
            if (!existingActiveMatch) {
                await Match.create({
                    user1: updatedRequest.fromUser,
                    user2: updatedRequest.toUser,
                    skillfromuser1: updatedRequest.skillOffered || 'unknown',
                    skillfromuser2: updatedRequest.skillRequested || 'unknown',
                    status: 'accepted',
                });
            }
        }
        return res.status(200).json(updatedRequest);
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Server Error"});
    }
}

export const deleteRequest = async(req,res) =>{
    const requestId = req.params.id;

    try{
        if(!requestId){
            return res.status(400).json({message:"requestId is required"});
        }
        const deletedRequest = await Request.findByIdAndDelete(requestId);

        if(!deletedRequest){
            return res.status(404).json({message:"Request not found"});
        }           

        return res.status(200).json({message:"Request deleted successfully"});
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Server Error"});  
    }
}

export const clearAllRequests = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Delete all requests sent by the user
        const sentDeleted = await Request.deleteMany({ fromUser: userId });
        
        // Delete all requests received by the user
        const receivedDeleted = await Request.deleteMany({ toUser: userId });

        return res.status(200).json({
            message: "All requests cleared successfully",
            sentDeleted: sentDeleted.deletedCount,
            receivedDeleted: receivedDeleted.deletedCount
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const getMyMatches = async (req, res) => {
    try{
        const userId = req.user?._id;
        if(!userId){
            return res.status(401).json({message:"Not authorized"});
        }
        const matches = await Match.find({ $or: [{ user1: userId }, { user2: userId }] })
            .populate('user1','name email')
            .populate('user2','name email');
        return res.status(200).json(matches);
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Server Error"});
    }
}
