import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, Users, Plus, X, Video, Trash2 } from "lucide-react";
import axios from "../utils/api";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 20 } } };

const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(), 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const bgClass = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  return (
    <div className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg text-white z-50 ${bgClass}`}>
      {message}
    </div>
  );
};

export default function Meet() {
  const [meetings, setMeetings] = useState([]);
  const [availableMatches, setAvailableMatches] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [me, setMe] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    matchId: '',
    title: '',
    description: '',
    date: '',
    duration: 60,
    meetingLink: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meetingsRes, matchesRes, userRes] = await Promise.all([
        axios.get("/meet", { withCredentials: true }),
        axios.get("/meet/available-matches", { withCredentials: true }),
        axios.get("/auth/checkAuth", { withCredentials: true })
      ]);
      setMeetings(meetingsRes.data || []);
      setAvailableMatches(matchesRes.data || []);
      setMe(userRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setNotification({ show: true, message: 'Failed to load meeting data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async () => {
    if (!scheduleForm.matchId || !scheduleForm.title || !scheduleForm.date) {
      setNotification({ show: true, message: 'Please fill in all required fields', type: 'error' });
      return;
    }
    
    // Check if the selected date is in the past
    const selectedDateTime = new Date(scheduleForm.date);
    const now = new Date();
    
    if (selectedDateTime <= now) {
      setNotification({ show: true, message: 'Cannot schedule meetings in the past', type: 'error' });
      return;
    }

    try {
      setScheduling(true);
      await axios.post("/meet", scheduleForm, { withCredentials: true });
      setNotification({ show: true, message: 'Meeting scheduled successfully!', type: 'success' });
      setShowScheduleModal(false);
      setScheduleForm({ matchId: '', title: '', description: '', date: '', duration: 60, meetingLink: '' });
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      setNotification({ 
        show: true, 
        message: error.response?.data?.message || 'Failed to schedule meeting', 
        type: 'error' 
      });
    } finally {
      setScheduling(false);
    }
  };

  const openScheduleModal = (matchId = '') => {
    setScheduleForm({ ...scheduleForm, matchId });
    setShowScheduleModal(true);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  const handleDeleteMeeting = async (meetingId) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) {
      return;
    }
    
    try {
      await axios.delete(`/meet/${meetingId}`, { withCredentials: true });
      setNotification({ show: true, message: 'Meeting cancelled successfully', type: 'success' });
      loadData(); // Refresh meetings
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      setNotification({ 
        show: true, 
        message: error.response?.data?.message || 'Failed to cancel meeting', 
        type: 'error' 
      });
    }
  };
  
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {notification.show && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onDismiss={() => setNotification({ show: false, message: '', type: '' })} 
        />
      )}
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 md:p-8 bg-neutral-900 min-h-screen text-neutral-200"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Meeting Scheduler</h1>
              <p className="text-neutral-400 mt-2">Schedule meetings with your skill swap partners</p>
            </div>
            <button
              onClick={() => openScheduleModal()}
              disabled={availableMatches.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Schedule Meeting
            </button>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {/* Meetings List */}
            <motion.div variants={itemVariants}>
              <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  Your Scheduled Meetings
                </h3>
                
                {meetings.length > 0 ? (
                  <div className="space-y-4">
                    {meetings.map(meeting => {
                      const isOrganizer = meeting.organizer && me && String(meeting.organizer._id) === String(me._id);
                      const otherParticipant = meeting.participants?.find(p => p._id !== meeting.organizer?._id);
                      
                      return (
                        <motion.div
                          key={meeting._id}
                          whileHover={{ scale: 1.02 }}
                          className="p-4 bg-neutral-700/50 border border-neutral-600 rounded-lg hover:border-neutral-500 transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{meeting.title}</h4>
                              <p className="text-neutral-400 text-sm mt-1">{meeting.description}</p>
                              <div className="flex items-center gap-4 mt-3 text-sm text-neutral-300">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="w-4 h-4" />
                                  {formatDateTime(meeting.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {meeting.duration} min
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  with {otherParticipant?.name || 'Partner'}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {meeting.meetingLink && (
                                <a
                                  href={meeting.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium text-sm flex items-center gap-1 transition-colors"
                                >
                                  <Video className="w-4 h-4" />
                                  Join
                                </a>
                              )}
                              {meeting.status === 'scheduled' && isOrganizer && (
                                <button
                                  onClick={() => handleDeleteMeeting(meeting._id)}
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium text-sm flex items-center gap-1 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Cancel
                                </button>
                              )}
                              <span className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                                meeting.status === 'scheduled' ? 'bg-blue-500/20 text-blue-300' :
                                meeting.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {meeting.status}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-16 h-16 mx-auto text-neutral-600 mb-4" />
                    <h4 className="text-lg font-medium text-neutral-300 mb-2">No meetings scheduled</h4>
                    <p className="text-neutral-500 mb-4">Schedule your first meeting with a skill swap partner</p>
                    {availableMatches.length > 0 && (
                      <button
                        onClick={() => openScheduleModal()}
                        className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Schedule First Meeting
                      </button>
                    )}
                  </div>
                )}
                
                {availableMatches.length === 0 && meetings.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 mx-auto text-neutral-600 mb-4" />
                    <h4 className="text-lg font-medium text-neutral-300 mb-2">No swap partners available</h4>
                    <p className="text-neutral-500">You need to have accepted skill swaps to schedule meetings</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Schedule Meeting Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Schedule Meeting</h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Select Swap Partner</label>
                  <select
                    value={scheduleForm.matchId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, matchId: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Choose a partner...</option>
                    {availableMatches.map(match => {
                      const otherUser = match.user1.name !== match.user2.name 
                        ? (match.user1._id !== match.user2._id ? match.user2 : match.user1)
                        : match.user1;
                      return (
                        <option key={match._id} value={match._id}>
                          {otherUser.name} ({match.skillfromuser1} ↔ {match.skillfromuser2})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Meeting Title</label>
                  <input
                    type="text"
                    value={scheduleForm.title}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                    placeholder="e.g., React.js Learning Session"
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    min={getCurrentDateTime()}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Duration (minutes)</label>
                  <select
                    value={scheduleForm.duration}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Meeting Link (Optional)</label>
                  <input
                    type="url"
                    value={scheduleForm.meetingLink}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Description (Optional)</label>
                  <textarea
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                    placeholder="What will you cover in this session?"
                    rows={3}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleScheduleMeeting}
                    disabled={scheduling || !scheduleForm.matchId || !scheduleForm.title || !scheduleForm.date}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {scheduling ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CalendarIcon className="w-4 h-4" />
                    )}
                    {scheduling ? 'Scheduling...' : 'Schedule Meeting'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
