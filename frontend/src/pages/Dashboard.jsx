import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Home,
  Layers,
  Repeat,
  User,
  Settings,
  Bell,
  Search,
} from "lucide-react";
import axios from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ skillsListed: 0, swapRequests: 0, successfulMatches: 0 });
  const [displayName, setDisplayName] = useState("Welcome");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get("/auth/checkAuth", { withCredentials: true });
        const user = userRes.data;
        setDisplayName(`Welcome back, ${user.name}`);
        const requestsRes = await axios.get(`/request/getreq/${user._id}`, { withCredentials: true });
        const requests = requestsRes.data || [];
        setStats({
          skillsListed: Array.isArray(user.skills_offered) ? user.skills_offered.length : 0,
          swapRequests: requests.length,
          successfulMatches: requests.filter(r => r.status === "accepted").length,
        });
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    fetchData();
  }, []);

  const navigation = [
    { name: "Dashboard", icon: Home, to: "/dashboard" },
    { name: "My Skills", icon: Layers, to: "/dashboard" },
    { name: "Swap Requests", icon: Repeat, to: "/swap-requests" },
    { name: "Profile", icon: User, to: "/profile" },
    { name: "Settings", icon: Settings, to: "/settings" },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-16 left-0 z-30 w-64 bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Swapify</h1>
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.to)}
              className="w-full text-left flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <button className="md:hidden px-3 py-2 rounded bg-gray-900 border border-gray-800" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search skills..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-900 border border-gray-800 placeholder:text-gray-400 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/post-request')} className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">Create Request</button>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-6">{displayName} 👋</h2>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-900 border border-gray-800 shadow rounded-2xl p-6">
              <h3 className="text-gray-400">Skills Listed</h3>
              <p className="text-3xl font-bold text-blue-400">{stats.skillsListed}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 shadow rounded-2xl p-6">
              <h3 className="text-gray-400">Swap Requests</h3>
              <p className="text-3xl font-bold text-green-400">{stats.swapRequests}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 shadow rounded-2xl p-6">
              <h3 className="text-gray-400">Successful Matches</h3>
              <p className="text-3xl font-bold text-purple-400">{stats.successfulMatches}</p>
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-gray-900 border border-gray-800 shadow rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <ul className="space-y-3">
              <li className="flex justify-between">
                <span className="text-gray-300">No recent activity</span>
                <span className="text-sm text-gray-500">—</span>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
