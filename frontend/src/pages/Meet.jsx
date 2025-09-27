import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon } from "lucide-react";
import Calendar from "react-calendar"; // npm install react-calendar
import axios from "../utils/api";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring" } } };

export default function Meet() {
  const [date, setDate] = useState(new Date());
  const [meetings, setMeetings] = useState([]);
  const [availableMatches, setAvailableMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch meetings and available matches from API
    const fetchData = async () => {
      try {
        const [meetingsRes, matchesRes] = await Promise.all([
          axios.get("/meet", { withCredentials: true }),
          axios.get("/meet/matches", { withCredentials: true })
        ]);
        setMeetings(meetingsRes.data || []);
        setAvailableMatches(matchesRes.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSchedule = async () => {
    if (!title.trim()) {
      alert("Please enter a meeting title");
      return;
    }
    
    if (!selectedMatch) {
      alert("Please select a skill swap partner");
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post("/meet", { 
        title: title.trim(),
        description: description.trim(),
        date: date.toISOString(),
        duration: parseInt(duration),
        matchId: selectedMatch._id
      }, { withCredentials: true });
      
      setMeetings(prev => [...prev, res.data]);
      setTitle("");
      setDescription("");
      setDuration(60);
      setSelectedMatch(null);
      alert("Meeting scheduled successfully!");
    } catch (error) {
      console.error("Failed to schedule meeting:", error);
      alert(error.response?.data?.message || "Failed to schedule meeting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 md:p-8 bg-slate-900 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-8 text-white">
          Schedule a Meet
        </motion.h1>
        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-4 text-white">Schedule New Meeting</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Select Skill Swap Partner</label>
                {availableMatches.length > 0 ? (
                  <select
                    value={selectedMatch?._id || ""}
                    onChange={(e) => {
                      const match = availableMatches.find(m => m._id === e.target.value);
                      setSelectedMatch(match);
                    }}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="">Choose a skill swap partner...</option>
                    {availableMatches.map(match => {
                      const otherUser = match.user1?.name ? match.user2 : match.user1;
                      return (
                        <option key={match._id} value={match._id}>
                          {otherUser?.name} - {match.skillfromuser1} ⇄ {match.skillfromuser2}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <div className="p-4 bg-slate-700/50 rounded-lg text-slate-400 text-center">
                    No active skill swaps found. You need to have accepted skill swaps to schedule meetings.
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Meeting Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Skill Swap Session"
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will you discuss?"
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Duration (minutes)</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Date & Time</label>
            <Calendar
              onChange={setDate}
              value={date}
              className="bg-slate-800 text-slate-100 rounded-lg border-slate-700"
            />
              </div>
              <button
                onClick={handleSchedule}
                disabled={loading || !title.trim() || !selectedMatch}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed p-3 rounded-lg font-medium flex items-center gap-3 justify-center transition-colors"
              >
                <CalendarIcon className="w-5 h-5" /> 
                {loading ? 'Scheduling...' : 'Schedule Meeting'}
              </button>
            </div>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-4 text-white">Your Meetings</h3>
            {meetings.length > 0 ? (
              <div className="space-y-3">
                {meetings.map(m => (
                  <motion.div
                    key={m._id}
                    className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-600 transition-colors"
                    variants={itemVariants}
                  >
                    <p className="font-medium text-white">{m.title}</p>
                    <p className="text-sm text-slate-400 mt-1">{m.description}</p>
                    <div className="mt-2 text-sm text-slate-300">
                      <p>With: {m.participants?.[0]?.name || 'Unknown'}</p>
                      <p>Skills: {m.match?.skillfromuser1} ⇄ {m.match?.skillfromuser2}</p>
                      <p>{new Date(m.date).toLocaleString()} • {m.duration} minutes</p>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Status: <span className="capitalize">{m.status}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No meetings scheduled yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}