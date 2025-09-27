import Team, { Team as TeamModel, TeamRequest } from "../models/team.js";
import User from "../models/Users.js";
import Match from "../models/match.js";

export const createTeamRequest = async (req, res) => {
    try {
        const { toUsername, status, description} = req.body;

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

        const newTeam = new Team({
            fromUser,
            toUser: toUserDoc._id,
            status: status || 'pending',
            description,
        });
        await newTeam.save();
        return res.status(201).json(newTeam);    
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
        const existing = await Team.findOne({ fromUser, toUser: toUserDoc._id, status: 'pending' });
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
        const sent = await Team.find({ fromUser: userId }).populate('toUser','name email');
        const received = await Team.find({ toUser: userId }).populate('fromUser','name email');
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

        const requests = await Team.find({fromUser});

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

        const updatedRequest = await Team.findByIdAndUpdate(requestId,{status:status},{new:true});

        if(!updatedRequest){
            return res.status(404).json({message:"Request not found"});
        }

        if (status === 'accepted') {
            const existingMatch = await Match.findOne({
                $or: [
                    { user1: updatedRequest.fromUser, user2: updatedRequest.toUser },
                    { user1: updatedRequest.toUser, user2: updatedRequest.fromUser },
                ]
            });
            if (!existingMatch) {
                await Match.create({
                    user1: updatedRequest.fromUser,
                    user2: updatedRequest.toUser,
                    skillfromuser1: 'unknown',
                    skillfromuser2: 'unknown',
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
        const deletedRequest = await Team.findByIdAndDelete(requestId);

        if(!deletedRequest){
            return res.status(404).json({message:"Request not found"});
        }           

        return res.status(200).json({message:"Request deleted successfully"});
    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Server Error"});  
    }
}

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

// New team creation and management functions

// Create a new team
export const createTeam = async (req, res) => {
    try {
        const { name, description, maxMembers, skillsRequired, category, isPublic } = req.body;
        const creatorId = req.user._id;

        if (!name || !description) {
            return res.status(400).json({ message: "Team name and description are required" });
        }

        const team = new TeamModel({
            name,
            description,
            creator: creatorId,
            members: [creatorId], // Creator is automatically a member
            maxMembers: maxMembers || 6,
            skillsRequired: skillsRequired || [],
            category: category || 'hackathon',
            isPublic: isPublic !== false // Default to true unless explicitly false
        });

        await team.save();
        const populatedTeam = await TeamModel.findById(team._id)
            .populate('creator', 'name email')
            .populate('members', 'name email');

        res.status(201).json(populatedTeam);
    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ message: 'Failed to create team' });
    }
};

// Get all public teams
export const getAllTeams = async (req, res) => {
    try {
        const { category, skillsRequired } = req.query;
        const filter = { isPublic: true, status: 'active' };

        if (category) {
            filter.category = category;
        }

        if (skillsRequired) {
            filter.skillsRequired = { $in: skillsRequired.split(',') };
        }

        const teams = await TeamModel.find(filter)
            .populate('creator', 'name email')
            .populate('members', 'name email')
            .sort({ createdAt: -1 });

        res.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ message: 'Failed to fetch teams' });
    }
};

// Get teams created by or joined by the user
export const getMyTeams = async (req, res) => {
    try {
        const userId = req.user._id;

        const teams = await TeamModel.find({
            $or: [
                { creator: userId },
                { members: userId }
            ]
        })
        .populate('creator', 'name email')
        .populate('members', 'name email')
        .sort({ createdAt: -1 });

        res.json(teams);
    } catch (error) {
        console.error('Error fetching user teams:', error);
        res.status(500).json({ message: 'Failed to fetch user teams' });
    }
};

// Join a team (send join request)
export const requestToJoinTeam = async (req, res) => {
    try {
        const { teamId, description } = req.body;
        const userId = req.user._id;

        if (!teamId) {
            return res.status(400).json({ message: "Team ID is required" });
        }

        const team = await TeamModel.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.members.includes(userId)) {
            return res.status(400).json({ message: "You are already a member of this team" });
        }

        if (team.members.length >= team.maxMembers) {
            return res.status(400).json({ message: "Team is already full" });
        }

        // Check if request already exists
        const existingRequest = await TeamRequest.findOne({
            fromUser: userId,
            toTeam: teamId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: "You already have a pending request to join this team" });
        }

        const joinRequest = new TeamRequest({
            fromUser: userId,
            toTeam: teamId,
            requestType: 'join_team',
            description: description || `Request to join ${team.name}`,
            status: 'pending'
        });

        await joinRequest.save();
        const populatedRequest = await TeamRequest.findById(joinRequest._id)
            .populate('fromUser', 'name email')
            .populate('toTeam', 'name');

        res.status(201).json(populatedRequest);
    } catch (error) {
        console.error('Error requesting to join team:', error);
        res.status(500).json({ message: 'Failed to send join request' });
    }
};

// Accept/Reject team join requests
export const handleTeamJoinRequest = async (req, res) => {
    try {
        const { requestId, status } = req.body;
        const userId = req.user._id;

        if (!requestId || !status) {
            return res.status(400).json({ message: "Request ID and status are required" });
        }

        const request = await TeamRequest.findById(requestId)
            .populate('toTeam')
            .populate('fromUser', 'name email');

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Only team creator can accept/reject requests
        if (String(request.toTeam.creator) !== String(userId)) {
            return res.status(403).json({ message: "Only team creator can handle join requests" });
        }

        request.status = status;
        await request.save();

        // If accepted, add user to team
        if (status === 'accepted') {
            const team = await TeamModel.findById(request.toTeam._id);
            if (team && !team.members.includes(request.fromUser._id)) {
                team.members.push(request.fromUser._id);
                if (team.members.length >= team.maxMembers) {
                    team.status = 'full';
                }
                await team.save();
            }
        }

        res.json({ message: `Request ${status} successfully`, request });
    } catch (error) {
        console.error('Error handling team join request:', error);
        res.status(500).json({ message: 'Failed to handle join request' });
    }
};

// Leave a team
export const leaveTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user._id;

        const team = await TeamModel.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (String(team.creator) === String(userId)) {
            return res.status(400).json({ message: "Team creator cannot leave the team. Transfer ownership or delete the team instead." });
        }

        if (!team.members.includes(userId)) {
            return res.status(400).json({ message: "You are not a member of this team" });
        }

        team.members = team.members.filter(memberId => String(memberId) !== String(userId));
        
        // Update team status if it was full
        if (team.status === 'full') {
            team.status = 'active';
        }
        
        await team.save();

        res.json({ message: "Left team successfully" });
    } catch (error) {
        console.error('Error leaving team:', error);
        res.status(500).json({ message: 'Failed to leave team' });
    }
};

// Update team details (only creator can update)
export const updateTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { name, description, maxMembers, skillsRequired, category, isPublic, status } = req.body;
        const userId = req.user._id;

        const team = await TeamModel.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (String(team.creator) !== String(userId)) {
            return res.status(403).json({ message: "Only team creator can update team details" });
        }

        // Update allowed fields
        if (name) team.name = name;
        if (description) team.description = description;
        if (maxMembers && maxMembers >= team.members.length) team.maxMembers = maxMembers;
        if (skillsRequired) team.skillsRequired = skillsRequired;
        if (category) team.category = category;
        if (isPublic !== undefined) team.isPublic = isPublic;
        if (status) team.status = status;

        await team.save();

        const updatedTeam = await TeamModel.findById(teamId)
            .populate('creator', 'name email')
            .populate('members', 'name email');

        res.json(updatedTeam);
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).json({ message: 'Failed to update team' });
    }
};

// Delete team (only creator can delete)
export const deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user._id;

        const team = await TeamModel.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (String(team.creator) !== String(userId)) {
            return res.status(403).json({ message: "Only team creator can delete the team" });
        }

        await TeamModel.findByIdAndDelete(teamId);
        await TeamRequest.deleteMany({ toTeam: teamId }); // Delete all related requests

        res.json({ message: "Team deleted successfully" });
    } catch (error) {
        console.error('Error deleting team:', error);
        res.status(500).json({ message: 'Failed to delete team' });
    }
};
