import { React, useEffect, useState } from 'react';
import axios from '../utils/api';
import { useParams } from 'react-router-dom';
import { Users, Frown, Send } from 'lucide-react';

const Spinner = ({ text }) => (
  <div className="flex flex-col items-center justify-center p-10">
    <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    {text && <p className="mt-4 text-neutral-400">{text}</p>}
  </div>
); 

const Members = () => {
  const [members, setMembers] = useState([]);
  const { id } = useParams();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [requestData, setRequestData] = useState({ skillOffered: "", skillRequested: "" });
  const [requestLoading, setRequestLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

    const handleSubmitRequest = async () => {
      if (!selectedUser || !requestData.skillOffered.trim() || !requestData.skillRequested.trim()) return;
      
      setRequestLoading(true);
      try {
        const payload = {
          toUsername: selectedUser.name,
          status: 'pending',
          createdAt: new Date().toISOString(),
          ...requestData
        };
        await axios.post("/request/create", payload, { withCredentials: true });
        setNotification({ show: true, message: `Request sent to ${selectedUser.name}!`, type: 'success' });
        setShowRequestModal(false);
      } catch (err) {
        console.error(err);
        setNotification({ show: true, message: "Failed to send request.", type: 'error' });
      } finally {
        setRequestLoading(false);
      }
    };
  
    const handleCloseModal = () => {
      setShowRequestModal(false);
      setSelectedUser(null);
      setRequestData({ skillOffered: "", skillRequested: "" });
    };
  

  useEffect(() => {
    async function fetchMembers() {
      try {
        const parti = await axios.get(`/auth/${id}`, { withCredentials: true });
        setMembers(parti.data);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      }
    }
    fetchMembers();
  }, [id]);

    const handleSendRequest = (user) => {
    setSelectedUser(user);
    setShowRequestModal(true);
  };

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

        {members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                className="bg-neutral-900/60 p-4 rounded-lg border border-neutral-800 flex items-center justify-between transition-all duration-200 hover:bg-neutral-800/50 hover:border-indigo-500/40"
              >
                <div>
                  <p className="font-semibold text-lg text-neutral-100">{member.name}</p>
                  <p className="text-sm text-neutral-400">{member.email}</p>
                </div>

                <button onClick={() => handleSendRequest(member)} className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors flex items-center gap-2"><Send size={14}/> Propose Swap</button>
                
                <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-indigo-400 font-bold select-none">
                  {member.name.charAt(0).toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        ) : (

          <div className="flex flex-col items-center justify-center text-center py-16">
            <Frown className="w-12 h-12 text-neutral-600 mb-4" />
            <p className="text-neutral-400 font-medium text-lg">No Members Found</p>
            <p className="text-neutral-500 text-sm mt-1">There are currently no members to display.</p>
          </div>
        )}
      </div>

            {showRequestModal && selectedUser && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-lg mx-4 transition-transform duration-300 animate-fade-in-up shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Send Request to {selectedUser.name}</h3>
                    <button onClick={handleCloseModal} className="p-1 rounded-full hover:bg-neutral-700">X</button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-sky-300">What skill will you offer?</label>
                      <input
                        type="text"
                        value={requestData.skillOffered}
                        onChange={(e) => setRequestData({ ...requestData, skillOffered: e.target.value })}
                        placeholder="e.g., JavaScript, Python, Design..."
                        className="w-full p-3 rounded-md bg-neutral-800 border border-neutral-700 placeholder:text-neutral-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-amber-300">What skill do you want in return?</label>
                      <input
                        type="text"
                        value={requestData.skillRequested}
                        onChange={(e) => setRequestData({ ...requestData, skillRequested: e.target.value })}
                        placeholder="e.g., React, Machine Learning..."
                        className="w-full p-3 rounded-md bg-neutral-800 border border-neutral-700 placeholder:text-neutral-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleCloseModal} className="flex-1 py-2.5 px-4 bg-neutral-700 text-white font-semibold rounded-md hover:bg-neutral-600 transition-colors">Cancel</button>
                    <button
                      onClick={handleSubmitRequest}
                      disabled={requestLoading || !requestData.skillOffered.trim() || !requestData.skillRequested.trim()}
                      className="flex-1 py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-800/50 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
                    >
                      {requestLoading ? <Spinner text={null}/> : 'Send Request'}
                    </button>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
};

export default Members;