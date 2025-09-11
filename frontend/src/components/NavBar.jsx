import { useEffect, useState, useRef } from "react";
import { Search, Bell, User, Layers, LogOut } from "lucide-react";
import logo from "../../image.png";
import { useNavigate } from "react-router-dom";
import axios from "../utils/api";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null); // Ref for the dropdown menu

  // --- Data Fetching and Event Listeners (No changes needed here) ---
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
        <button className="flex items-center gap-2 flex-shrink-0" onClick={() => navigate('/dashboard')}>
          <img src={logo} alt="Swapify Logo" className="h-8 w-8 rounded-md" />
          <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">Swapify</h1>
        </button>

        <div className="relative hidden md:block">
          <Search className="w-5 h-5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search skills..."
            className="w-full md:w-64 lg:w-80 pl-10 pr-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 placeholder:text-neutral-500 text-neutral-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>
      </div>

      {/* --- Right Section: Actions + Profile --- */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile search */}
        <button className="md:hidden p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors" onClick={() => navigate('/search')}>
          <Search className="w-5 h-5" />
        </button>
        
        {/* Notifications */}
        <button className="relative p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          {/* Example notification dot */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-neutral-950"></span>
        </button>

        {/* --- User Dropdown --- */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(v => !v)} className="flex items-center gap-2 p-1.5 rounded-full hover:bg-neutral-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18}/>}
            </div>
            <span className="hidden md:block font-semibold text-sm text-neutral-200 pr-1">
              {user?.name || 'Account'}
            </span>
          </button>
          
          {/* Dropdown Menu with Animation */}
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