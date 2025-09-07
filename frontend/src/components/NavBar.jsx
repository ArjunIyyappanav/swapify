import { useEffect, useState } from "react";
import { Search, Bell, User } from "lucide-react";
import logo from "../../image.png";
import { useNavigate } from "react-router-dom";
import axios from "../utils/api";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/checkAuth", { withCredentials: true });
        setUser(res.data);
      } catch {}
    };
    fetchUser();
  }, []);

  // Listen for storage events and custom login events to update user
  useEffect(() => {
    const handleUserUpdate = () => {
      const fetchUser = async () => {
        try {
          const res = await axios.get("/auth/checkAuth", { withCredentials: true });
          setUser(res.data);
        } catch {}
      };
      fetchUser();
    };

    window.addEventListener('storage', handleUserUpdate);
    window.addEventListener('userLogin', handleUserUpdate);
    return () => {
      window.removeEventListener('storage', handleUserUpdate);
      window.removeEventListener('userLogin', handleUserUpdate);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      navigate("/login");
    } catch {}
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gray-900 text-gray-100 shadow">
      {/* Left Section: Logo + Search */}
      <div className="flex items-center space-x-4">
        {/* Logo */}
        <button className="flex items-center space-x-2" onClick={() => navigate('/dashboard')}>
          <img src={logo} alt="Swapify" className="h-8 w-8 rounded" />
          <h1 className="text-xl font-bold">Swapify</h1>
        </button>

        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            onKeyDown={(e)=>{ if(e.key==='Enter'){ navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search'); } }}
            placeholder="Search skills..."
            className="pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 placeholder:text-gray-400 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Right Section: Notifications + Profile */}
      <div className="relative flex items-center space-x-6">
        {/* Notifications */}
        <button className="relative">
          <Bell className="w-6 h-6 text-gray-300 hover:text-blue-400" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        {/* Mobile search trigger */}
        <button className="md:hidden" onClick={()=>navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search')}>
          <Search className="w-6 h-6 text-gray-300 hover:text-blue-400" />
        </button>

        {/* User Dropdown */}
        <button onClick={() => setOpen(v => !v)} className="flex items-center space-x-2">
          <User className="w-7 h-7 text-gray-300" />
          <span className="hidden md:block font-medium text-gray-200">
            {user?.name || 'User'}
          </span>
        </button>
        {open && (
          <div className="absolute right-0 top-12 w-44 bg-gray-900 border border-gray-800 rounded-xl shadow">
            <button onClick={() => { setOpen(false); navigate('/profile'); }} className="w-full text-left px-4 py-2 hover:bg-gray-800">Profile</button>
            <button onClick={() => { setOpen(false); navigate('/my-skills'); }} className="w-full text-left px-4 py-2 hover:bg-gray-800">My Skills</button>
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800">Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}
