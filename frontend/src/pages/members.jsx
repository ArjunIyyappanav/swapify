import { React, useEffect, useState } from 'react';
import axios from '../utils/api';
import { useParams } from 'react-router-dom';
import { Users, Frown } from 'lucide-react'; // Using icons for better UI

const Members = () => {
  const [members, setMembers] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    async function fetchMembers() {
      try {
        const parti = await axios.get(`/auth/${id}`, { withCredentials: true });
        setMembers(parti.data);
      } catch (err) {
        console.error("Failed to fetch members:", err);
        // Avoid using alert() in production apps.
        // A toast notification system is a better user experience.
      }
    }
    fetchMembers();
  }, [id]);

  return (
    // Main container with a dark background and centered content
    <div className="bg-neutral-900 min-h-screen p-4 sm:p-6 md:p-8 flex justify-center font-sans">
      <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-lg p-6 h-fit">
        
        {/* --- Header --- */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-neutral-800">
          <Users className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-bold text-neutral-100 tracking-tight">
            Class Members
          </h1>
        </div>

        {/* --- Members List --- */}
        {members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => (
              // Individual member card with hover effect
              <div
                key={member._id}
                className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800 flex items-center justify-between transition-all duration-200 hover:bg-neutral-800/50 hover:border-indigo-500/40"
              >
                <div>
                  <p className="font-semibold text-lg text-neutral-100">{member.name}</p>
                  <p className="text-sm text-neutral-400">{member.email}</p>
                </div>
                
                {/* Avatar placeholder with the member's initial */}
                <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-indigo-400 font-bold select-none">
                  {member.name.charAt(0).toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // --- "No Members Found" State ---
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Frown className="w-12 h-12 text-neutral-600 mb-4" />
            <p className="text-neutral-400 font-medium text-lg">No Members Found</p>
            <p className="text-neutral-500 text-sm mt-1">There are currently no members to display.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;