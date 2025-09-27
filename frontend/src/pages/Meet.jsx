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
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  useEffect(() => {
    // Fetch meetings from API
    axios.get("/meet", { withCredentials: true }).then(res => setMeetings(res.data));
  }, []);

  const handleSchedule = () => {
    // POST to /meet with date, user, details
    axios.post("/meet", { date, details: selectedMeeting }, { withCredentials: true });
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
            <h3 className="text-xl font-semibold mb-4 text-white">Pick a Date</h3>
            <Calendar
              onChange={setDate}
              value={date}
              className="bg-slate-800 text-slate-100 rounded-lg border-slate-700"
            />
          </div>
          <div className="bg-slate-800/50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-4 text-white">Available Meetings</h3>
            {meetings.length > 0 ? (
              meetings.map(m => (
                <motion.div
                  key={m.id}
                  className="p-4 bg-slate-700/50 rounded-lg mb-2 cursor-pointer hover:bg-slate-600"
                  onClick={() => setSelectedMeeting(m)}
                >
                  <p className="font-medium">{m.title} with {m.user.name}</p>
                  <p className="text-sm text-slate-400">{new Date(m.date).toLocaleString()}</p>
                </motion.div>
              ))
            ) : (
              <p className="text-slate-400">No meetings scheduled.</p>
            )}
            <button
              onClick={handleSchedule}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 p-3 rounded-lg font-medium flex items-center gap-3 justify-center"
            >
              <CalendarIcon className="w-5 h-5" /> Schedule Meet
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}