import { useEffect, useState } from "react";
import axios from "../utils/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import UserRating from "../components/UserRating";
import { 
  Users, Plus, Star, Send, Clock, X, Check, Filter, Search as SearchIcon,
  Settings, UserCheck, UserX, Crown, Calendar, MapPin, Globe, Lock,
  MessageSquare, AlertCircle, Edit, Trash2
} from "lucide-react";

const Spinner = ({ text = "Loading..." }) => (
    <div className="flex flex-col items-center justify-center p-10">
        <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-neutral-400">{text}</p>
    </div>
);

const Toast = ({ message, type = 'error', onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(), 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const bgClass = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg text-white z-[100] ${bgClass}`}
        >
            {message}
            <button onClick={onDismiss} className="ml-3 hover:opacity-70">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

const TeamCard = ({ team, onJoinTeam, onManageTeam, onLeaveTeam, userRatings = {}, currentUserId, viewType = 'browse' }) => {
    const isCreator = currentUserId && String(team.creator._id) === String(currentUserId);
    const isMember = currentUserId && team.members.some(member => String(member._id) === String(currentUserId));
    const isFull = team.members.length >= team.maxMembers;
    const creatorRating = userRatings[team.creator._id];

    return (
        <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-6 hover:border-neutral-700 transition-all duration-300"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-bold text-white truncate">{team.name}</h3>
                        {isCreator && <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" title="Team Leader" />}
                        {team.isPublic ? <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" title="Public" /> : <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" title="Private" />}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                        <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${
                            team.category === 'hackathon' ? 'bg-purple-500/20 text-purple-300' :
                            team.category === 'project' ? 'bg-blue-500/20 text-blue-300' :
                            team.category === 'study' ? 'bg-green-500/20 text-green-300' :
                            'bg-gray-500/20 text-gray-300'
                        }`}>
                            {team.category}
                        </span>
                        <span className="text-neutral-400 text-xs sm:text-sm">
                            {team.members.length}/{team.maxMembers}
                        </span>
                        {isFull && (
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-red-500/20 text-red-300 rounded-full">
                                Full
                            </span>
                        )}
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full ${
                            team.status === 'active' ? 'bg-green-500/20 text-green-300' :
                            team.status === 'full' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-gray-500/20 text-gray-300'
                        }`}>
                            {team.status}
                        </span>
                    </div>
                </div>
                <div className="text-right sm:text-left sm:min-w-0">
                    <div className="text-xs sm:text-sm text-neutral-400 mb-1">Created by</div>
                    <div className="flex items-center gap-2 sm:justify-start justify-end">
                        <span className="font-medium text-white text-sm sm:text-base truncate">{team.creator.name}</span>
                        <UserRating 
                            rating={creatorRating?.averageRating} 
                            totalRatings={creatorRating?.totalRatings} 
                            size="xs" 
                            className="flex-shrink-0"
                        />
                    </div>
                </div>
            </div>

            <p className="text-neutral-300 mb-4 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base">{team.description}</p>

            {team.skillsRequired && team.skillsRequired.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-neutral-400 mb-2">Skills Needed:</h4>
                    <div className="flex flex-wrap gap-2">
                        {team.skillsRequired.map((skill, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-indigo-500/20 text-indigo-300 rounded-full">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex -space-x-1.5 sm:-space-x-2">
                    {team.members.slice(0, 4).map((member, index) => (
                        <div key={member._id} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-500 border-2 border-neutral-900 flex items-center justify-center text-white text-xs sm:text-sm font-medium" title={member.name}>
                            {member.name.charAt(0).toUpperCase()}
                        </div>
                    ))}
                    {team.members.length > 4 && (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-neutral-700 border-2 border-neutral-900 flex items-center justify-center text-neutral-300 text-xs">
                            +{team.members.length - 4}
                        </div>
                    )}
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    {viewType === 'browse' && (
                        <>
                            {!isMember && !isFull && (
                                <button
                                    onClick={() => onJoinTeam(team)}
                                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    <Send className="w-4 h-4" />
                                    <span className="hidden sm:inline">Request to Join</span>
                                    <span className="sm:hidden">Join</span>
                                </button>
                            )}
                            {isMember && !isCreator && (
                                <span className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600/20 text-green-300 rounded-lg font-medium text-center text-sm sm:text-base">
                                    Member
                                </span>
                            )}
                            {isFull && !isMember && (
                                <span className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-neutral-700 text-neutral-400 rounded-lg font-medium text-center text-sm sm:text-base">
                                    <span className="hidden sm:inline">Team Full</span>
                                    <span className="sm:hidden">Full</span>
                                </span>
                            )}
                        </>
                    )}
                    {viewType === 'my-teams' && (
                        <>
                            {isCreator && (
                                <button
                                    onClick={() => onManageTeam(team)}
                                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>Manage</span>
                                </button>
                            )}
                            {isMember && !isCreator && (
                                <button
                                    onClick={() => onLeaveTeam(team._id)}
                                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    <UserX className="w-4 h-4" />
                                    <span className="hidden sm:inline">Leave Team</span>
                                    <span className="sm:hidden">Leave</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const JoinRequestCard = ({ request, onHandleRequest, processing }) => {
    return (
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                            {request.fromUser.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-white">{request.fromUser.name}</span>
                        <span className="text-xs text-neutral-400">{request.fromUser.email}</span>
                    </div>
                    <p className="text-neutral-300 text-sm mb-2">{request.description}</p>
                    {request.teamName && (
                        <p className="text-neutral-500 text-xs mb-2">Team: {request.teamName}</p>
                    )}
                    <span className="text-xs text-neutral-500">
                        Requested {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div className="flex gap-2 ml-4">
                    <button
                        onClick={() => onHandleRequest(request._id, 'accepted')}
                        disabled={processing === request._id}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                    >
                        <Check className="w-4 h-4" />
                        {processing === request._id ? 'Processing...' : 'Accept'}
                    </button>
                    <button
                        onClick={() => onHandleRequest(request._id, 'rejected')}
                        disabled={processing === request._id}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                    >
                        <X className="w-4 h-4" />
                        {processing === request._id ? 'Processing...' : 'Reject'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Teams() {
    const [teams, setTeams] = useState([]);
    const [myTeams, setMyTeams] = useState([]);
    const [joinRequests, setJoinRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'my-teams', 'requests'
    const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [creating, setCreating] = useState(false);
    const [processing, setProcessing] = useState(null);
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [userRatings, setUserRatings] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    
    const [teamForm, setTeamForm] = useState({
        name: '',
        description: '',
        maxMembers: 6,
        skillsRequired: '',
        category: 'hackathon',
        event: '',
        isPublic: true
    });
    
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        maxMembers: 6,
        skillsRequired: '',
        category: 'hackathon',
        event: '',
        isPublic: true
    });

    const navigate = useNavigate();

    const loadJoinRequests = async (userTeams) => {
        try {
            // Get pending join requests for teams I created
            const createdTeams = userTeams.filter(team => 
                currentUser && String(team.creator._id) === String(currentUser._id)
            );
            
            if (createdTeams.length === 0) {
                setJoinRequests([]);
                return;
            }
            
            // Create a new endpoint to get team requests
            try {
                const response = await axios.get('/teams/requests', { withCredentials: true });
                if (response.data && Array.isArray(response.data)) {
                    const pendingRequests = response.data
                        .filter(req => req.status === 'pending')
                        .map(req => ({ 
                            ...req, 
                            teamName: req.toTeam?.name || 'Unknown Team' 
                        }));
                    setJoinRequests(pendingRequests);
                } else {
                    setJoinRequests([]);
                }
            } catch (err) {
                console.log('No join requests endpoint available, trying legacy route');
                // Fallback to legacy routes if new endpoint doesn't exist
                const requests = [];
                for (const team of createdTeams) {
                    try {
                        const response = await axios.get(`/team/getteam/${team._id}`, { withCredentials: true });
                        if (response.data && Array.isArray(response.data)) {
                            const pendingRequests = response.data
                                .filter(req => req.status === 'pending')
                                .map(req => ({ ...req, teamName: team.name }));
                            requests.push(...pendingRequests);
                        }
                    } catch (legacyErr) {
                        console.log(`No requests found for team ${team._id}`);
                    }
                }
                setJoinRequests(requests);
            }
        } catch (error) {
            console.error('Error loading join requests:', error);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [teamsRes, myTeamsRes, userRes, eventsRes] = await Promise.all([
                axios.get('/teams', { withCredentials: true }),
                axios.get('/teams/my', { withCredentials: true }),
                axios.get('/auth/checkAuth', { withCredentials: true }),
                axios.get('/events', { withCredentials: true }).catch(() => ({ data: [] }))
            ]);
            
            setTeams(teamsRes.data || []);
            setMyTeams(myTeamsRes.data || []);
            setCurrentUser(userRes.data);
            setEvents(eventsRes.data || []);
            
            // Load ratings for team creators using bulk endpoint
            const allTeams = [...(teamsRes.data || []), ...(myTeamsRes.data || [])];
            const creatorIds = [...new Set(allTeams.map(team => team.creator._id))];
            const memberIds = [...new Set(allTeams.flatMap(team => team.members.map(member => member._id)))];
            const allUserIds = [...new Set([...creatorIds, ...memberIds])];
            
            if (allUserIds.length > 0) {
                try {
                    const ratingsRes = await axios.post('/rating/bulk', { userIds: allUserIds }, { withCredentials: true });
                    setUserRatings(ratingsRes.data);
                } catch (error) {
                    console.error('Error loading bulk ratings:', error);
                    // Fallback to default ratings
                    const ratingsMap = {};
                    allUserIds.forEach(userId => {
                        ratingsMap[userId] = { averageRating: 5.0, totalRatings: 0 };
                    });
                    setUserRatings(ratingsMap);
                }
            }
        } catch (error) {
            console.error('Error loading teams:', error);
            setNotification({ show: true, message: 'Failed to load teams', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Load join requests when user and teams are loaded
    useEffect(() => {
        if (currentUser && myTeams.length > 0) {
            loadJoinRequests(myTeams);
        }
    }, [currentUser, myTeams]);

    const handleCreateTeam = async () => {
        if (!teamForm.name || !teamForm.description) {
            setNotification({ show: true, message: 'Team name and description are required', type: 'error' });
            return;
        }

        setCreating(true);
        try {
            await axios.post('/teams/create', {
                ...teamForm,
                skillsRequired: teamForm.skillsRequired.split(',').map(s => s.trim()).filter(s => s)
            }, { withCredentials: true });
            
            setNotification({ show: true, message: 'Team created successfully!', type: 'success' });
            setShowCreateModal(false);
            setTeamForm({ name: '', description: '', maxMembers: 6, skillsRequired: '', category: 'hackathon', event: '', isPublic: true });
            loadData();
        } catch (error) {
            console.error('Error creating team:', error);
            setNotification({ show: true, message: error.response?.data?.message || 'Failed to create team', type: 'error' });
        } finally {
            setCreating(false);
        }
    };

    const handleJoinTeam = async (team) => {
        try {
            await axios.post('/teams/join', {
                teamId: team._id,
                description: `Request to join ${team.name}`
            }, { withCredentials: true });
            
            setNotification({ show: true, message: 'Join request sent successfully!', type: 'success' });
        } catch (error) {
            console.error('Error joining team:', error);
            setNotification({ show: true, message: error.response?.data?.message || 'Failed to send join request', type: 'error' });
        }
    };

    const handleManageTeam = (team) => {
        setSelectedTeam(team);
        setShowManageModal(true);
    };

    const handleLeaveTeam = async (teamId) => {
        if (!confirm('Are you sure you want to leave this team?')) {
            return;
        }
        
        try {
            await axios.post(`/teams/${teamId}/leave`, {}, { withCredentials: true });
            setNotification({ show: true, message: 'Left team successfully!', type: 'success' });
            loadData();
        } catch (error) {
            console.error('Error leaving team:', error);
            setNotification({ show: true, message: error.response?.data?.message || 'Failed to leave team', type: 'error' });
        }
    };

    const handleJoinRequest = async (requestId, status) => {
        setProcessing(requestId);
        try {
            // Use new team route for handling requests
            await axios.patch('/teams/join-request', {
                requestId,
                status
            }, { withCredentials: true });
            
            setNotification({ 
                show: true, 
                message: `Request ${status} successfully!`, 
                type: 'success' 
            });
            
            // Refresh data
            loadData();
        } catch (error) {
            console.error('Error handling join request:', error);
            setNotification({ 
                show: true, 
                message: error.response?.data?.message || 'Failed to handle request', 
                type: 'error' 
            });
        } finally {
            setProcessing(null);
        }
    };

    const handleEditTeam = (team) => {
        setEditForm({
            name: team.name,
            description: team.description,
            maxMembers: team.maxMembers,
            skillsRequired: team.skillsRequired.join(', '),
            category: team.category,
            event: team.event?._id || '',
            isPublic: team.isPublic
        });
        setSelectedTeam(team);
        setShowManageModal(false);
        setShowEditModal(true);
    };

    const handleUpdateTeam = async () => {
        if (!editForm.name || !editForm.description) {
            setNotification({ show: true, message: 'Team name and description are required', type: 'error' });
            return;
        }

        setEditing(true);
        try {
            await axios.patch(`/teams/${selectedTeam._id}`, {
                ...editForm,
                skillsRequired: editForm.skillsRequired.split(',').map(s => s.trim()).filter(s => s)
            }, { withCredentials: true });
            
            setNotification({ show: true, message: 'Team updated successfully!', type: 'success' });
            setShowEditModal(false);
            setEditForm({ name: '', description: '', maxMembers: 6, skillsRequired: '', category: 'hackathon', event: '', isPublic: true });
            loadData();
        } catch (error) {
            console.error('Error updating team:', error);
            setNotification({ show: true, message: error.response?.data?.message || 'Failed to update team', type: 'error' });
        } finally {
            setEditing(false);
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
            return;
        }
        
        setDeleting(true);
        try {
            await axios.delete(`/teams/${teamId}`, { withCredentials: true });
            setNotification({ show: true, message: 'Team deleted successfully!', type: 'success' });
            setShowManageModal(false);
            loadData();
        } catch (error) {
            console.error('Error deleting team:', error);
            setNotification({ show: true, message: error.response?.data?.message || 'Failed to delete team', type: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    const filteredTeams = teams.filter(team => {
        const matchesSearch = !searchQuery || 
            team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.skillsRequired.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
            
        const matchesCategory = categoryFilter === 'all' || team.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return <Spinner text="Loading teams..." />;
    }

    return (
        <>
            <AnimatePresence>
                {notification.show && (
                    <Toast 
                        message={notification.message} 
                        type={notification.type}
                        onDismiss={() => setNotification({ show: false, message: '', type: 'error' })} 
                    />
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 text-neutral-200">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Teams</h1>
                        <p className="text-sm sm:text-base text-neutral-400">Find teammates for hackathons, projects, and study groups</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 sm:px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="sm:inline">Create Team</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-1 mb-6 sm:mb-8">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                            activeTab === 'browse' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        }`}
                    >
                        <span className="hidden sm:inline">Browse Teams ({filteredTeams.length})</span>
                        <span className="sm:hidden">Browse ({filteredTeams.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('my-teams')}
                        className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                            activeTab === 'my-teams' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        }`}
                    >
                        <span className="hidden sm:inline">My Teams ({myTeams.length})</span>
                        <span className="sm:hidden">Mine ({myTeams.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm sm:text-base ${
                            activeTab === 'requests' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        }`}
                    >
                        <span className="hidden sm:inline">Join Requests ({joinRequests.length})</span>
                        <span className="sm:hidden">Requests ({joinRequests.length})</span>
                        {joinRequests.length > 0 && (
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </button>
                </div>

                {/* Search and Filters */}
                {activeTab === 'browse' && (
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="flex-1 relative">
                            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Search teams..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                        >
                            <option value="all">All Categories</option>
                            <option value="hackathon">Hackathon</option>
                            <option value="project">Project</option>
                            <option value="study">Study Group</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                )}

                {/* Content Area */}
                {activeTab === 'browse' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredTeams.length > 0 ? (
                            filteredTeams.map(team => (
                                <TeamCard
                                    key={team._id}
                                    team={team}
                                    onJoinTeam={handleJoinTeam}
                                    userRatings={userRatings}
                                    currentUserId={currentUser?._id}
                                    viewType="browse"
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <Users className="w-16 h-16 mx-auto text-neutral-600 mb-4" />
                                <h3 className="text-xl font-medium text-neutral-300 mb-2">No teams found</h3>
                                <p className="text-neutral-500">Try adjusting your search or create a new team!</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'my-teams' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {myTeams.length > 0 ? (
                            myTeams.map(team => (
                                <TeamCard
                                    key={team._id}
                                    team={team}
                                    onManageTeam={handleManageTeam}
                                    onLeaveTeam={handleLeaveTeam}
                                    userRatings={userRatings}
                                    currentUserId={currentUser?._id}
                                    viewType="my-teams"
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <Users className="w-16 h-16 mx-auto text-neutral-600 mb-4" />
                                <h3 className="text-xl font-medium text-neutral-300 mb-2">You're not in any teams yet</h3>
                                <p className="text-neutral-500">Browse available teams or create your own!</p>
                                <button
                                    onClick={() => setActiveTab('browse')}
                                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Browse Teams
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-indigo-400" />
                                Pending Join Requests
                            </h3>
                            
                            {joinRequests.length > 0 ? (
                                <div className="space-y-4">
                                    {joinRequests.map(request => (
                                        <JoinRequestCard
                                            key={request._id}
                                            request={request}
                                            onHandleRequest={handleJoinRequest}
                                            processing={processing}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <UserCheck className="w-16 h-16 mx-auto text-neutral-600 mb-4" />
                                    <h4 className="text-xl font-medium text-neutral-300 mb-2">No pending requests</h4>
                                    <p className="text-neutral-500">Join requests will appear here when users want to join your teams.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Team Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-4 sm:mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-white">Create New Team</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-neutral-400 hover:text-white p-1"
                                >
                                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-2">
                                        Team Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={teamForm.name}
                                        onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter team name"
                                        className="w-full px-3 py-2.5 sm:py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        value={teamForm.description}
                                        onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe your team's purpose and goals"
                                        rows={3}
                                        className="w-full px-3 py-2.5 sm:py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm sm:text-base"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={teamForm.category}
                                            onChange={(e) => setTeamForm(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full px-3 py-2.5 sm:py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                                        >
                                            <option value="hackathon">Hackathon</option>
                                            <option value="project">Project</option>
                                            <option value="study">Study Group</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-2">
                                            Max Members
                                        </label>
                                        <input
                                            type="number"
                                            min="2"
                                            max="20"
                                            value={teamForm.maxMembers}
                                            onChange={(e) => setTeamForm(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || 6 }))}
                                            className="w-full px-3 py-2.5 sm:py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-2">
                                        Event (Optional)
                                    </label>
                    <select
                        value={teamForm.event}
                        onChange={(e) => setTeamForm(prev => ({ ...prev, event: e.target.value }))}
                        className="w-full px-3 py-2.5 sm:py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    >
                        <option value="">No specific event</option>
                        {events.filter(event => event.type === 'hackathon' || teamForm.category === 'hackathon').map(event => (
                            <option key={event._id} value={event._id}>
                                {event.name} ({event.type}) - {event.source}
                            </option>
                        ))}
                    </select>
                                    <p className="text-xs text-neutral-500 mt-1">Select a specific hackathon or event for this team</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Skills Required
                                    </label>
                                    <input
                                        type="text"
                                        value={teamForm.skillsRequired}
                                        onChange={(e) => setTeamForm(prev => ({ ...prev, skillsRequired: e.target.value }))}
                                        placeholder="e.g. React, Python, UI/UX Design (comma separated)"
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">Separate skills with commas</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isPublic"
                                        checked={teamForm.isPublic}
                                        onChange={(e) => setTeamForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                                        className="w-4 h-4 text-indigo-600 bg-neutral-800 border-neutral-700 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="isPublic" className="text-sm text-neutral-300">
                                        Make this team publicly visible
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-neutral-800">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-neutral-400 hover:text-white transition-colors text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateTeam}
                                    disabled={creating || !teamForm.name || !teamForm.description}
                                    className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    {creating ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Team'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Team Management Modal */}
            <AnimatePresence>
                {showManageModal && selectedTeam && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Crown className="w-6 h-6 text-yellow-400" />
                                    Manage {selectedTeam.name}
                                </h2>
                                <button
                                    onClick={() => setShowManageModal(false)}
                                    className="text-neutral-400 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Team Info */}
                                <div className="bg-neutral-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-lg mb-3">Team Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-neutral-400">Category:</span>
                                            <span className="ml-2 text-white capitalize">{selectedTeam.category}</span>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400">Members:</span>
                                            <span className="ml-2 text-white">{selectedTeam.members.length}/{selectedTeam.maxMembers}</span>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400">Status:</span>
                                            <span className={`ml-2 capitalize ${
                                                selectedTeam.status === 'active' ? 'text-green-400' :
                                                selectedTeam.status === 'full' ? 'text-orange-400' :
                                                'text-gray-400'
                                            }`}>{selectedTeam.status}</span>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400">Visibility:</span>
                                            <span className="ml-2 text-white">{selectedTeam.isPublic ? 'Public' : 'Private'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Team Members */}
                                <div className="bg-neutral-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-lg mb-3">Team Members</h3>
                                    <div className="space-y-2">
                                        {selectedTeam.members.map(member => (
                                            <div key={member._id} className="flex items-center justify-between py-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white flex items-center gap-2">
                                                            {member.name}
                                                            {String(member._id) === String(selectedTeam.creator._id) && (
                                                                <Crown className="w-4 h-4 text-yellow-400" />
                                                            )}
                                                            <UserRating 
                                                                rating={userRatings[member._id]?.averageRating} 
                                                                totalRatings={userRatings[member._id]?.totalRatings} 
                                                                size="xs"
                                                            />
                                                        </div>
                                                        <div className="text-xs text-neutral-400">{member.email}</div>
                                                    </div>
                                                </div>
                                                {String(member._id) !== String(selectedTeam.creator._id) && (
                                                    <button className="text-red-400 hover:text-red-300 text-sm">
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Skills Required */}
                                {selectedTeam.skillsRequired && selectedTeam.skillsRequired.length > 0 && (
                                    <div className="bg-neutral-800 rounded-lg p-4">
                                        <h3 className="font-semibold text-lg mb-3">Skills Required</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTeam.skillsRequired.map((skill, index) => (
                                                <span key={index} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center mt-6 pt-6 border-t border-neutral-800">
                                <button
                                    onClick={() => setShowManageModal(false)}
                                    className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
                                >
                                    Close
                                </button>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleEditTeam(selectedTeam)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit Team
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteTeam(selectedTeam._id)}
                                        disabled={deleting}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {deleting ? 'Deleting...' : 'Delete Team'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Team Modal */}
            <AnimatePresence>
                {showEditModal && selectedTeam && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-4 sm:mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-white">Edit {selectedTeam.name}</h2>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-neutral-400 hover:text-white p-1"
                                >
                                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-2">
                                        Team Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter team name"
                                        className="w-full px-3 py-2.5 sm:py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe your team's purpose and goals"
                                        rows={3}
                                        className="w-full px-3 py-2.5 sm:py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm sm:text-base"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={editForm.category}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full px-3 py-2.5 sm:py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                                        >
                                            <option value="hackathon">Hackathon</option>
                                            <option value="project">Project</option>
                                            <option value="study">Study Group</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-2">
                                            Max Members
                                        </label>
                                        <input
                                            type="number"
                                            min={selectedTeam.members.length}
                                            max="20"
                                            value={editForm.maxMembers}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || selectedTeam.members.length }))}
                                            className="w-full px-3 py-2.5 sm:py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                                        />
                                        <p className="text-xs text-neutral-500 mt-1">Cannot be less than current member count ({selectedTeam.members.length})</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-2">
                                        Skills Required
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.skillsRequired}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, skillsRequired: e.target.value }))}
                                        placeholder="e.g. React, Python, UI/UX Design (comma separated)"
                                        className="w-full px-3 py-2.5 sm:py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">Separate skills with commas</p>
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-2">
                                        Event (Optional)
                                    </label>
                                    <select
                                        value={editForm.event}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, event: e.target.value }))}
                                        className="w-full px-3 py-2.5 sm:py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                                    >
                                        <option value="">No specific event</option>
                                        {events.filter(event => event.category === 'hackathon' || editForm.category === 'hackathon').map(event => (
                                            <option key={event._id} value={event._id}>
                                                {event.name} {event.startDate ? `- ${new Date(event.startDate).toLocaleDateString()}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-neutral-500 mt-1">Select a specific hackathon or event for this team</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="editIsPublic"
                                        checked={editForm.isPublic}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                                        className="w-4 h-4 text-indigo-600 bg-neutral-800 border-neutral-700 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="editIsPublic" className="text-sm text-neutral-300">
                                        Make this team publicly visible
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-neutral-800">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-neutral-400 hover:text-white transition-colors text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateTeam}
                                    disabled={editing || !editForm.name || !editForm.description}
                                    className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    {editing ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Team'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
