import './App.css'
import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/signup";
import Login from "./pages/Login";
import CreateRequest from "./pages/createRequest";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import PostRequest from "./pages/PostRequest";
import SwapRequests from "./pages/SwapRequests";
import Settings from "./pages/Settings";
import MySkills from "./pages/MySkills";
import Chat from "./pages/Chat";
import Search from "./pages/Search";
import ProfileView from "./pages/ProfileView";
import Classes from "./pages/Classes";
import Members from "./pages/members"
import TeamRequests from './pages/teams';
import CreateTeam from './pages/CreateTeam';

export default function Root() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <Routes>
        <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>}/>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/users/:name" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
        <Route path="/auth/:id" element={<ProtectedRoute><Members /></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute><TeamRequests/></ProtectedRoute>}/>
        <Route path="/team/create" element={<ProtectedRoute><CreateTeam/></ProtectedRoute>}/>
        <Route path='/classes' element={<ProtectedRoute><Classes/></ProtectedRoute>}/> 
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
        <Route path="/create-request" element={<ProtectedRoute><CreateRequest /></ProtectedRoute>}/>
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
        <Route path="/post-request" element={<ProtectedRoute><PostRequest /></ProtectedRoute>}/>
        <Route path="/swap-requests" element={<ProtectedRoute><SwapRequests /></ProtectedRoute>}/>
        {/* <Route path="/createclasses"element={<ProtectedRoute><Classes /></ProtectedRoute>}/> */}
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>}/>
        <Route path="/my-skills" element={<ProtectedRoute><MySkills /></ProtectedRoute>}/>
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>}/>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}


