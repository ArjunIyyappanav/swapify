import { Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { navigation } from "./utils/navigation";
import Navbar from "./components/NavBar";
import Landing from "./pages/Landing";
import Signup from "./pages/signup";
import Login from "./pages/Login";
import CreateRequest from "./pages/createRequest";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import PostRequest from "./pages/PostRequest";
import SwapRequests from "./pages/SwapRequests";
import Settings from "./pages/Settings";
import MySkills from "./pages/MySkills";
import Chat from "./pages/Chat";
import Meet from "./pages/Meet";
import Ratings from "./pages/Ratings";
import Search from "./pages/Search";
import ProfileView from "./pages/ProfileView";
import Classes from "./pages/Classes";
import Members from "./pages/Members";
import TeamRequests from "./pages/TeamRequests";
import CreateTeam from "./pages/CreateTeam";
import axios from "./utils/api";
import "./App.css";

export default function Root() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("/auth/checkAuth", { withCredentials: true });
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      setIsAuthenticated(false);
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed", err);
      alert("Logout failed. Please try again.");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <p className="text-neutral-200">Loading...</p>
    </div>;
  }

  const isPublicRoute = ["/", "/signup", "/login"].includes(window.location.pathname);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans antialiased">
      <Navbar />
      {/* Sidebar (Desktop, only for authenticated users) */}
      {isAuthenticated && !isPublicRoute && (
        <aside className="fixed inset-y-0 left-0 z-20 w-72 bg-gradient-to-b from-neutral-950 to-neutral-900 border-r border-neutral-800 shadow-2xl hidden md:block overflow-y-auto pt-16">
          <nav className="mt-6 px-4 space-y-1.5">
            {navigation.map((item) => (
              <motion.button
                key={item.name}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => (window.location.href = item.to)}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  window.location.pathname === item.to
                    ? "bg-red-500 text-white shadow-md"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.name}</span>
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-neutral-800 hover:text-red-300"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </motion.button>
          </nav>
        </aside>
      )}

      {/* Sidebar (Mobile, only for authenticated users) */}
      <AnimatePresence>
        {isAuthenticated && !isPublicRoute && sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-neutral-950 to-neutral-900 border-r border-neutral-800 shadow-2xl md:hidden overflow-y-auto pt-16"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/50">
                <h1 className="text-2xl font-extrabold tracking-tight text-white">Swapify</h1>
                <button
                  className="p-2 rounded-lg hover:bg-neutral-800/50 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-6 h-6 text-neutral-300" />
                </button>
              </div>
              <nav className="mt-6 px-4 space-y-1.5">
                {navigation.map((item) => (
                  <motion.button
                    key={item.name}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      window.location.href = item.to;
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      window.location.pathname === item.to
                        ? "bg-red-500 text-white shadow-md"
                        : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.name}</span>
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    handleLogout();
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-neutral-800 hover:text-red-300"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span>Logout</span>
                </motion.button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Nav (Mobile, only for authenticated users) */}
      {isAuthenticated && !isPublicRoute && (
        <nav className="fixed bottom-0 left-0 right-0 z-20 bg-neutral-950 border-t border-neutral-800 md:hidden">
          <div className="flex justify-around py-2">
            {navigation.slice(0, 4).concat({ name: "Logout", icon: LogOut, to: "/login" }).map((item) => (
              <motion.button
                key={item.name}
                whileTap={{ scale: 0.9 }}
                onClick={() => item.name === "Logout" ? handleLogout() : (window.location.href = item.to)}
                className={`flex flex-col items-center p-2 ${
                  window.location.pathname === item.to ? "text-red-500" : "text-neutral-400"
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs">{item.name}</span>
              </motion.button>
            ))}
          </div>
        </nav>
      )}

      {/* Main Content */}
      <div className={`pt-16 ${isAuthenticated && !isPublicRoute ? "md:ml-72" : ""} min-h-screen`}>
        {isAuthenticated && !isPublicRoute && (
          <header className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 bg-neutral-900/95 sticky top-16 z-10 md:hidden">
            <button
              className="p-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/70 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-neutral-300" />
            </button>
          </header>
        )}
        <main className="p-4 sm:p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/users/:name" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
            <Route path="/auth/:id" element={<ProtectedRoute><Members /></ProtectedRoute>} />
            <Route path="/teams" element={<ProtectedRoute><TeamRequests /></ProtectedRoute>} />
            <Route path="/team/create/:name" element={<ProtectedRoute><CreateTeam /></ProtectedRoute>} />
            <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/create-request" element={<ProtectedRoute><CreateRequest /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/post-request" element={<ProtectedRoute><PostRequest /></ProtectedRoute>} />
            <Route path="/swap-requests" element={<ProtectedRoute><SwapRequests /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/my-skills" element={<ProtectedRoute><MySkills /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/meet" element={<ProtectedRoute><Meet /></ProtectedRoute>} />
            <Route path="/ratings" element={<ProtectedRoute><Ratings /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}