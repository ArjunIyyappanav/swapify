import { useEffect, useState, useRef } from "react";
import { Search, Bell, User, Layers, LogOut } from "lucide-react";
import logo from "../../image.png";

// Fallback SVG logo component
const LogoIcon = ({ className = "h-8 w-8" }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#logoGradient)" />
    <path d="M8 12h6v2H8v-2zm0 4h6v2H8v-2zm0 4h4v2H8v-2z" fill="white" opacity="0.9" />
    <path d="M18 12h6v2h-6v-2zm0 4h6v2h-6v-2zm0 4h4v2h-4v-2z" fill="white" opacity="0.9" />
    <circle cx="16" cy="16" r="2" fill="white" />
  </svg>
);
import { useNavigate } from "react-router-dom";
import axios from "../utils/api";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/checkAuth", { withCredentials: true });
        setUser(res.data);
      } catch(err) {
        console.log(err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleUserUpdate = () => {
      const fetchUser = async () => {
        try {
          const res = await axios.get("/auth/checkAuth", { withCredentials: true });
          setUser(res.data);
        } catch (err){
          console.log(err);
        }
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

  // --- Click outside to close dropdown ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      setUser(null);
      setDropdownOpen(false);
      navigate("/login");
    } catch (err){
      console.log("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
    }
  };
  
  const DropdownItem = ({ icon: Icon, label, onClick, className = "" }) => (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors rounded-md ${className}`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 bg-neutral-950/80 border-b border-neutral-800 shadow-sm backdrop-blur-lg">
      
      {/* --- Left Section: Logo + Search --- */}
      <div className="flex items-center gap-4 md:gap-6">
        <button className="flex items-center gap-3 flex-shrink-0 group" onClick={() => navigate('/dashboard')}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <img 
                src={logo} 
                alt="PeerPort Logo" 
                className="h-8 w-8 rounded-lg shadow-lg" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:to-purple-300 transition-all duration-300">PeerPort</h1>
            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse group-hover:bg-purple-400 transition-colors duration-300"></div>
          </div>
        </button>

        <div className="relative hidden md:block group">
          <Search className="w-5 h-5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-indigo-400 transition-colors duration-200" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search skills, peers..."
            className="w-full md:w-64 lg:w-80 pl-10 pr-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 placeholder:text-neutral-500 text-neutral-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-neutral-700 outline-none transition-all duration-300 hover:border-neutral-600"
          />
        </div>
      </div>


      <div className="flex items-center gap-2 md:gap-4">
        <button className="md:hidden p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors" onClick={() => navigate('/search')}>
          <Search className="w-5 h-5" />
        </button>
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(v => !v)} className="flex items-center gap-2 p-1.5 rounded-full hover:bg-neutral-800 transition-all duration-200 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18}/>}
              </div>
            </div>
            <span className="hidden md:block font-semibold text-sm text-neutral-200 pr-1 group-hover:text-white transition-colors duration-200">
              {user?.name || 'Account'}
            </span>
          </button>

          <div
            className={`absolute right-0 top-full mt-2 w-56 origin-top-right bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl shadow-black/30 p-2
                       transition-all duration-200 ease-out
                       ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
          >
            <div className="px-4 py-2 border-b border-neutral-800 mb-2">
                <p className="text-sm font-semibold text-white truncate">{user?.name || 'Welcome'}</p>
                <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
            </div>
            <DropdownItem icon={User} label="Profile" onClick={() => { setDropdownOpen(false); navigate('/profile'); }} />
            <DropdownItem icon={Layers} label="My Skills" onClick={() => { setDropdownOpen(false); navigate('/my-skills'); }} />
            <div className="h-px bg-neutral-800 my-2"></div>
            <DropdownItem icon={LogOut} label="Logout" onClick={handleLogout} className="text-red-400 hover:text-red-400" />
          </div>
        </div>
      </div>
    </header>
  );
}