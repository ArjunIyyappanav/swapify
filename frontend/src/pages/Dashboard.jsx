import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Layers, Repeat, CheckCircle, Send, Inbox, Users, Star, Calendar } from "lucide-react";
import axios from "../utils/api";
import { Link } from "react-router-dom";

function formatDistanceToNow(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}

const StatCard = ({ icon: Icon, title, value, colorClass }) => (
  <motion.div
    className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-lg rounded-2xl p-6 flex items-center gap-6 hover:shadow-xl transition-shadow duration-300"
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
  >
    <motion.div
      className={`p-3 rounded-full bg-slate-800/50 ${colorClass}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Icon className="w-8 h-8" />
    </motion.div>
    <div>
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{title}</h3>
      <p className="text-4xl font-bold text-white mt-1">{value}</p>
    </div>
  </motion.div>
);

const ActivityItem = ({ activity }) => {
  let icon, message;

  switch (activity.type) {
    case "sent_request":
      icon = (
        <motion.div
          className="p-3 bg-slate-800/50 rounded-full text-blue-400"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Send className="w-5 h-5" />
        </motion.div>
      );
      message = (
        <>
          You sent a swap request to <strong>{activity.user.name}</strong>.
        </>
      );
      break;
    case "received_request":
      icon = (
        <motion.div
          className="p-3 bg-slate-800/50 rounded-full text-amber-400"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Inbox className="w-5 h-5" />
        </motion.div>
      );
      message = (
        <>
          You received a swap request from <strong>{activity.user.name}</strong>.
        </>
      );
      break;
    case "accepted_match":
      icon = (
        <motion.div
          className="p-3 bg-slate-800/50 rounded-full text-emerald-400"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <CheckCircle className="w-5 h-5" />
        </motion.div>
      );
      message = (
        <>
          Your swap request with <strong>{activity.user.name}</strong> was accepted!
        </>
      );
      break;
    default:
      icon = (
        <motion.div
          className="p-3 bg-slate-800/50 rounded-full text-slate-400"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Repeat className="w-5 h-5" />
        </motion.div>
      );
      message = "An update occurred.";
  }

  return (
    <motion.div
      className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-5 flex items-center gap-5 hover:bg-slate-800/30 transition-all duration-300 cursor-pointer shadow-sm"
      whileHover={{ scale: 1.01, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)" }}
      whileTap={{ scale: 0.99 }}
    >
      {icon}
      <div>
        <p className="font-medium text-slate-100">{message}</p>
        <p className="text-xs text-slate-400 mt-1">{formatDistanceToNow(activity.date)}</p>
      </div>
    </motion.div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 20 } },
};

export default function Dashboard() {
  const [stats, setStats] = useState({ skillsListed: 0, swapRequests: 0, successfulMatches: 0 });
  const [displayName, setDisplayName] = useState("Welcome");
  const [recentActivity, setRecentActivity] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get("/auth/checkAuth", { withCredentials: true });
        const user = userRes.data;
        setDisplayName(`Welcome back, ${user.name}`);

        const requestsRes = await axios.get(`/request/mine`, { withCredentials: true });
        const sentRequests = requestsRes.data.sent || [];
        const receivedRequests = requestsRes.data.received || [];

        setStats({
          skillsListed: Array.isArray(user.skills_offered) ? user.skills_offered.length : 0,
          swapRequests: sentRequests.length + receivedRequests.length,
          successfulMatches: [...sentRequests, ...receivedRequests].filter((r) => r.status === "accepted").length,
        });

        const combinedRequests = [
          ...sentRequests.map((r) => ({
            ...r,
            type: r.status === "accepted" ? "accepted_match" : "sent_request",
            user: r.toUser,
          })),
          ...receivedRequests.map((r) => ({
            ...r,
            type: r.status === "accepted" ? "accepted_match" : "received_request",
            user: r.fromUser,
          })),
        ];

        const sortedActivity = combinedRequests
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        const formattedActivity = sortedActivity.map((item) => ({
          id: item._id,
          type: item.type,
          user: item.user,
          date: item.createdAt,
        }));

        setRecentActivity(formattedActivity);

        // Fetch hackathons
        const hackathonsRes = await axios.get("/events", { withCredentials: true });
        setHackathons(hackathonsRes.data || []);
      } catch (err) {
        // setError("Failed to load dashboard data. Please try again.");
        console.error("Failed to load dashboard data", err);
      }
    };
    fetchData();
  }, []);

  return (
    <motion.main
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {error && (
          <motion.p variants={itemVariants} className="text-red-400 mb-6 text-center">
            {error}
          </motion.p>
        )}
        <motion.h2
          variants={itemVariants}
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-8"
        >
          {displayName} 👋
        </motion.h2>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
        >
          <motion.div variants={itemVariants}>
            <StatCard icon={Layers} title="Skills Listed" value={stats.skillsListed} colorClass="text-blue-400" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard icon={Repeat} title="Swap Requests" value={stats.swapRequests} colorClass="text-amber-400" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard icon={CheckCircle} title="Successful Matches" value={stats.successfulMatches} colorClass="text-emerald-400" />
          </motion.div>
        </motion.div>

        <motion.section variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-slate-800/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/teams" className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-lg font-medium flex items-center gap-3">
                <Users className="w-5 h-5" /> Find Hackathon Team
              </Link>
              <Link to="/ratings" className="w-full bg-emerald-600 hover:bg-emerald-700 p-3 rounded-lg font-medium flex items-center gap-3">
                <Star className="w-5 h-5" /> Rate Recent Swap
              </Link>
              <Link to="/meet" className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-medium flex items-center gap-3">
                <Calendar className="w-5 h-5" /> Schedule a Meet
              </Link>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Upcoming Hackathons</h3>
            {hackathons.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-400">
                {hackathons.map((event) => (
                  <li key={event.id}>
                    {event.name} - {new Date(event.date).toLocaleDateString()}{" "}
                    <span className="text-amber-400">• {event.spots} spots open</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400">No upcoming hackathons.</p>
            )}
          </div>
        </motion.section>

        <motion.div variants={itemVariants} className="bg-slate-900/50 border border-slate-800/50 shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-5">Recent Activity</h3>
          <motion.div variants={containerVariants} className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => <ActivityItem key={activity.id} activity={activity} />)
            ) : (
              <p className="text-slate-400 text-center py-6">No recent activity to show.</p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.main>
  );
}