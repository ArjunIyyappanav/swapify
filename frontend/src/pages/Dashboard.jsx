import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  DraftingCompass,
  Home,
  Layers,
  Repeat,
  User,
  Settings,
  CheckCircle,
  Send, 
  Inbox,
  ShieldHalf 
} from "lucide-react";
import axios from "../utils/api";
import { useNavigate, useLocation } from "react-router-dom";

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
  <div 
    className="bg-neutral-950 border border-neutral-800 shadow-lg rounded-xl p-6 flex items-center gap-6"
  >
    <div className={`p-3 rounded-lg bg-neutral-800 ${colorClass}`}>
      <Icon className="w-8 h-8" />
    </div>
    <div>
      <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">{title}</h3>
      <p className="text-4xl font-bold text-neutral-100">{value}</p>
    </div>
  </div>
);

const ActivityItem = ({ activity }) => {
    let icon, message;

    switch(activity.type) {
        case 'sent_request':
            icon = <div className="p-2 bg-neutral-800 rounded-full text-blue-400"><Send className="w-5 h-5" /></div>;
            message = <>You sent a swap request to <strong>{activity.user.name}</strong>.</>;
            break;
        case 'received_request':
            icon = <div className="p-2 bg-neutral-800 rounded-full text-amber-400"><Inbox className="w-5 h-5" /></div>;
            message = <>You received a swap request from <strong>{activity.user.name}</strong>.</>;
            break;
        case 'accepted_match':
            icon = <div className="p-2 bg-neutral-800 rounded-full text-emerald-400"><CheckCircle className="w-5 h-5" /></div>;
            message = <>Your swap request with <strong>{activity.user.name}</strong> was accepted!</>;
            break;
        default:
            icon = <div className="p-2 bg-neutral-800 rounded-full text-neutral-400"><Repeat className="w-5 h-5" /></div>;
            message = "An update occurred.";
    }

    return (
        <div className="flex items-center gap-4 p-3 rounded-lg bg-neutral-900/50">
            {icon}
            <div>
                <p className="font-medium text-neutral-200">{message}</p>
                <p className="text-sm text-neutral-500">{formatDistanceToNow(activity.date)}</p>
            </div>
        </div>
    );
};

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ skillsListed: 0, swapRequests: 0, successfulMatches: 0 });
  const [displayName, setDisplayName] = useState("Welcome");
  const [recentActivity, setRecentActivity] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

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
          successfulMatches: [...sentRequests, ...receivedRequests].filter(r => r.status === "accepted").length,
        });

        const combinedRequests = [
            ...sentRequests.map(r => ({ ...r, type: r.status === 'accepted' ? 'accepted_match' : 'sent_request', user: r.toUser })),
            ...receivedRequests.map(r => ({ ...r, type: r.status === 'accepted' ? 'accepted_match' : 'received_request', user: r.fromUser }))
        ];

        const sortedActivity = combinedRequests
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        
        const formattedActivity = sortedActivity.map(item => ({
            id: item._id,
            type: item.type,
            user: item.user,
            date: item.createdAt
        }));

        setRecentActivity(formattedActivity);
        
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    fetchData();
  }, []);

  const navigation = [
    { name: "Dashboard", icon: Home, to: "/dashboard" },
    { name: "My Skills", icon: Layers, to: "/my-skills" },
    { name: "Classes", icon: DraftingCompass, to: "/classes"},
    { name: "Swap Requests", icon: Repeat, to: "/swap-requests" },
    { name: "Team Requests", icon: ShieldHalf , to: "/teams" },
    { name: "Profile", icon: User, to: "/profile" },
    { name: "Settings", icon: Settings, to: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-neutral-900 text-neutral-200 font-sans">
      
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-40 w-64 bg-neutral-950 border-r border-neutral-800 shadow-lg"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                <h1 className="text-2xl font-bold tracking-tight text-white">Swapify</h1>
                <button className="md:hidden p-1" onClick={() => setSidebarOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              <nav className="mt-6 px-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <motion.button
                      key={item.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { navigate(item.to); setSidebarOpen(false); }}
                      className={`w-full flex items-center px-4 py-3 rounded-lg font-semibold transition-colors duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'}`}
                    >
                      <item.icon className="w-5 h-5 mr-4" />
                      <span>{item.name}</span>
                    </motion.button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-20 w-64 bg-neutral-950 border-r border-neutral-800 shadow-lg hidden md:block`}>
        {/* Static Desktop Sidebar Content */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h1 className="text-2xl font-bold tracking-tight text-white">Swapify</h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <motion.button
                key={item.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(item.to)}
                className={`w-full flex items-center px-4 py-3 rounded-lg font-semibold transition-colors duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'}`}
              >
                <item.icon className="w-5 h-5 mr-4" />
                <span>{item.name}</span>
              </motion.button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col md:ml-64">
        <header className="flex items-center justify-between p-4 md:p-6 border-b border-neutral-800">
            <button className="md:hidden p-2 rounded-lg bg-neutral-800/50" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
            <div className="flex-1" />
            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/create-request')}
              className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-indigo-500 transition-colors"
            >
              Create Request
            </motion.button> */}
        </header>

        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 overflow-y-auto p-4 md:p-6"
        >
          <div className="max-w-7xl mx-auto">
            <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight mb-6">{displayName} 👋</motion.h2>

            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
                <StatCard icon={Layers} title="Skills Listed" value={stats.skillsListed} colorClass="text-sky-400" />
              </motion.div>
              <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
                <StatCard icon={Repeat} title="Swap Requests" value={stats.swapRequests} colorClass="text-amber-400" />
              </motion.div>
              <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
                <StatCard icon={CheckCircle} title="Successful Matches" value={stats.successfulMatches} colorClass="text-emerald-400" />
              </motion.div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-neutral-950 border border-neutral-800 shadow-lg rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <motion.div variants={containerVariants} className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map(activity => (
                    <motion.div key={activity.id} variants={itemVariants}>
                      <ActivityItem activity={activity} />
                    </motion.div>
                  ))
                ) : (
                  <p className="text-neutral-500 text-center py-4">No recent activity to show.</p>
                )}
              </motion.div>
            </motion.div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}