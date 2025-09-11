import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Home,
  Layers,
  Repeat,
  User,
  Settings,
  CheckCircle,
  Send, // Icon for sent requests
  Inbox, // Icon for received requests
} from "lucide-react";
import axios from "../utils/api";
import { useNavigate, useLocation } from "react-router-dom";

// --- Helper function for relative time ---
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

// --- Stat Card Component (No changes) ---
const StatCard = ({ icon: Icon, title, value, colorClass, animationDelay }) => (
  <div 
    className="bg-neutral-950 border border-neutral-800 shadow-lg rounded-xl p-6 flex items-center gap-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/20"
    style={{ animation: `fade-in-up 0.5s ${animationDelay}s ease-out forwards`, opacity: 0 }}
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

// --- Activity Item Component ---
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


export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ skillsListed: 0, swapRequests: 0, successfulMatches: 0 });
  const [displayName, setDisplayName] = useState("Welcome");
  const [recentActivity, setRecentActivity] = useState([]); // State for dynamic activity
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

        // --- Dynamically generate recent activity ---
        const combinedRequests = [
            ...sentRequests.map(r => ({ ...r, type: r.status === 'accepted' ? 'accepted_match' : 'sent_request', user: r.toUser })),
            ...receivedRequests.map(r => ({ ...r, type: r.status === 'accepted' ? 'accepted_match' : 'received_request', user: r.fromUser }))
        ];

        const sortedActivity = combinedRequests
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5); // Get latest 5 activities
        
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
    { name: "Swap Requests", icon: Repeat, to: "/swap-requests" },
    { name: "Profile", icon: User, to: "/profile" },
    { name: "Settings", icon: Settings, to: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-neutral-900 text-neutral-200 font-sans">
      
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-neutral-950 border-r border-neutral-800 shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h1 className="text-2xl font-bold tracking-tight text-white">Swapify</h1>
          <button className="md:hidden p-1" onClick={() => setSidebarOpen(false)}><X className="w-6 h-6" /></button>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <button key={item.name} onClick={() => { navigate(item.to); setSidebarOpen(false); }} className={`w-full flex items-center px-4 py-3 rounded-lg font-semibold transition-colors duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'}`}>
                <item.icon className="w-5 h-5 mr-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col md:ml-64">
        <header className="flex items-center justify-between p-4 md:p-6 border-b border-neutral-800">
            <button className="md:hidden p-2 rounded-lg bg-neutral-800/50" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
            <div className="flex-1" />
            <button onClick={() => navigate('/create-request')} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-indigo-500 transition-colors">
              Create Request
            </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-6">{displayName} 👋</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard icon={Layers} title="Skills Listed" value={stats.skillsListed} colorClass="text-sky-400" animationDelay={0.1} />
              <StatCard icon={Repeat} title="Swap Requests" value={stats.swapRequests} colorClass="text-amber-400" animationDelay={0.2} />
              <StatCard icon={CheckCircle} title="Successful Matches" value={stats.successfulMatches} colorClass="text-emerald-400" animationDelay={0.3} />
            </div>

            <div className="bg-neutral-950 border border-neutral-800 shadow-lg rounded-xl p-6" style={{ animation: `fade-in-up 0.5s 0.4s ease-out forwards`, opacity: 0 }}>
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                    recentActivity.map(activity => <ActivityItem key={activity.id} activity={activity} />)
                ) : (
                    <p className="text-neutral-500 text-center py-4">No recent activity to show.</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}