import { useEffect, useState } from "react";
import axios from "../utils/api";
import { Mail, Sparkles, Lightbulb } from "lucide-react";

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

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [conpassword,setConPassword] = useState("");

  async function updateProfile(){    
    if(conpassword!==password){
      return;
    }   
    try{
      const updateData = {"name":name,"email":email,"password":password};
      let confirm = await axios.patch('/auth/updateProfile', updateData, { withCredentials: true });
      setIsOpen(false);
      if(!confirm){
        alert("Update Failed");
      }
    }catch(err){ 
      console.error("Failed to update profile", err);
      alert("Update Failed");
    }
  }

  function editprofile(){
    setIsOpen(true);
  } 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/checkAuth", { withCredentials: true });
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-neutral-400">
        Unable to load profile. Please try again later.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 text-neutral-200 font-sans">
      {/* --- Profile Header --- */}
      <button
        onClick={editprofile}
        className="fixed top-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300"
        >
          Edit Profile
        </button>

      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 mb-6 shadow-lg flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="relative w-32 h-32 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white text-5xl font-bold ring-4 ring-neutral-800">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-bold tracking-tight">{user.name}</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-neutral-400">
            <Mail className="w-4 h-4" />
            <span>{user.email}</span>
          </div>
        </div>
      </div>

      {/* --- Skills Sections --- */}
      <div className="space-y-6">
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
              <p className="text-neutral-500">No skills offered yet.</p>
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
              <p className="text-neutral-500">No skills wanted yet.</p>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    {/* Close button */}
    <button
      onClick={() => setIsOpen(false)}
      className="absolute top-34 left-230 text-white text-xl font-bold hover:text-red-400 transition"
    >
      ✕
    </button>

    {/* Form Container */}
    <form
      onSubmit={updateProfile}
      className="flex flex-col bg-neutral-900 p-8 rounded-2xl shadow-xl space-y-5 w-[400px] max-w-[90%]"
    >
      <h2 className="text-white text-2xl font-semibold text-center mb-2">
        Update Profile
      </h2>

      {/* Name */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm text-gray-300">Name</label>
        <input
          onChange={(e) => setName(e.target.value)}
          type="text"
          className="px-3 py-2 rounded-xl bg-neutral-800 text-white border border-neutral-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/30 outline-none"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm text-gray-300">Email</label>
        <input
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="px-3 py-2 rounded-xl bg-neutral-800 text-white border border-neutral-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/30 outline-none"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm text-gray-300">Password</label>
        <input
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="px-3 py-2 rounded-xl bg-neutral-800 text-white border border-neutral-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/30 outline-none"
        />
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col space-y-1">
        <label className="text-sm text-gray-300">Confirm Password</label>
        <input
          onChange={(e) => setConPassword(e.target.value)}
          type="password"
          className="px-3 py-2 rounded-xl bg-neutral-800 text-white border border-neutral-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/30 outline-none"
        />
        {conpassword !== password && (
          <span className="text-red-500 text-xs">
            Passwords do not match
          </span>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-2 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition"
      >
        Submit
      </button>
    </form>
  </div>
)}
    </div>
  );
}