import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/api";
import { Mail, Sparkles, Lightbulb, Send, UserX, Star } from "lucide-react";
import UserRating from "../components/UserRating";

// --- Reusable Spinner Component ---
const Spinner = () => (
  <div className="flex flex-col items-center justify-center p-10">
    <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-neutral-400">Loading Profile...</p>
  </div>
);

export default function ProfileView() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // First get user data
        const userRes = await axios.get(`/users/${name}`, { withCredentials: true });
        const userData = userRes.data;
        setUser(userData);
        
        // Then get rating using the user's ID  
        if (userData._id) {
          try {
            const ratingRes = await axios.get(`/rating/user/${userData._id}`, { withCredentials: true });
            setUserRating(ratingRes.data);
          } catch (error) {
            // Use default values from User model
            setUserRating({ 
              averageRating: userData.rating || 5.0, 
              totalRatings: userData.totalRatings || 0 
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (name) {
        load();
    }
  }, [name]);

  if (loading) {
    return (
      <div className="p-6">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 text-neutral-400">
        <UserX className="w-16 h-16 mb-4 text-red-500/50" />
        <h2 className="text-2xl font-bold text-neutral-200">User Not Found</h2>
        <p>We couldn't find a profile for this user.</p>
      </div>
    );
  }
  
  // The navigate function for the button could be enhanced to pre-fill the username
  // For example: navigate(`/post-request?username=${user.username}`)
  const handleProposeSwap = () => {
    navigate('/post-request'); 
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 text-neutral-200 font-sans">
      {/* --- Profile Header --- */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 mb-6 shadow-lg flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="relative w-32 h-32 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white text-5xl font-bold ring-4 ring-neutral-800">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-bold tracking-tight">{user.name}</h1>
          <div className="flex flex-col gap-2 mt-3">
            <div className="flex items-center justify-center md:justify-start gap-2 text-neutral-400">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex justify-center md:justify-start">
              <UserRating 
                rating={userRating?.averageRating} 
                totalRatings={userRating?.totalRatings} 
                size="sm" 
                showCount={true}
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleProposeSwap}
          className="flex-shrink-0 flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 focus:ring-indigo-500 transition-colors"
        >
          <Send className="w-4 h-4" />
          Propose a Swap
        </button>
      </div>

      {/* --- Skills Sections --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 shadow-lg">
          <h2 className="flex items-center gap-3 text-xl font-semibold mb-4 text-sky-300">
            <Sparkles className="w-6 h-6" />
            Skills Offered
          </h2>
          <div className="flex flex-wrap gap-3">
            {(user.skills_offered || []).length > 0 ? (
              user.skills_offered.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 bg-sky-500/10 text-sky-300 border border-sky-500/20 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-neutral-500">This user hasn't listed any skills to offer.</p>
            )}
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 shadow-lg">
          <h2 className="flex items-center gap-3 text-xl font-semibold mb-4 text-amber-300">
            <Lightbulb className="w-6 h-6" />
            Skills Wanted
          </h2>
          <div className="flex flex-wrap gap-3">
            {(user.skills_wanted || []).length > 0 ? (
              user.skills_wanted.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-neutral-500">This user hasn't listed any skills they want.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}