import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "../utils/api";
import { io } from "socket.io-client";
import { Star, X } from "lucide-react";

// --- SVG Icon Components for a cleaner UI ---

const VideoCameraIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
  </svg>
);

const SendIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
  </svg>
);

const XMarkIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


export default function Chat() {
  const [matches, setMatches] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showMeetInput, setShowMeetInput] = useState(false);
  const [meetUrl, setMeetUrl] = useState("");
  const [me, setMe] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const socketRef = useRef(null);
  const activeRef = useRef(null);
  const bottomRef = useRef(null);
  const location = useLocation();

  // --- All your logic functions (loadMatches, loadMe, etc.) remain the same ---
  // --- No changes needed for the useEffect hooks or logic functions ---
  const loadMatches = async () => {
    const res = await axios.get('/chat/matches', { withCredentials: true });
    const list = res.data || [];
    setMatches(list);
    if (!active && list.length > 0) {
      const params = new URLSearchParams(location.search);
      const q = params.get('matchId');
      const toSelect = q ? list.find(m => String(m._id) === String(q)) : list[0];
      setActive(toSelect || list[0]);
    }
  };
  const loadMe = async () => {
    const res = await axios.get('/auth/checkAuth', { withCredentials: true });
    setMe(res.data);
  };
  const loadMessages = async (matchId) => {
    const res = await axios.get(`/chat/${matchId}/messages`, { withCredentials: true });
    setMessages(res.data || []);
    await axios.post(`/chat/${matchId}/read`, {}, { withCredentials: true });
  };
  const sendMessage = async () => {
    if (!active || !input.trim()) return;
    try {
      const { data } = await axios.post(`/chat/${active._id}/messages`, { content: input }, { withCredentials: true });
      setMessages(prev => [...prev, data]);
      setInput("");
    } catch (e) {
      console.error(e);
    }
  };
  const sendMeetInvite = async () => {
    if (!active || !meetUrl.trim()) return;
    try {
      const url = meetUrl.trim();
      const text = url.startsWith('http') ? url : `https://${url}`;
      const { data } = await axios.post(`/chat/${active._id}/messages`, { content: text }, { withCredentials: true });
      setMessages(prev => [...prev, data]);
      setMeetUrl("");
      setShowMeetInput(false);
    } catch (e) {
      console.error(e);
    }
  };
  const handleStartMeet = () => {
    window.open('https://meet.new', '_blank', 'noopener');
    setShowMeetInput(true);
  };

  const handleEndChat = async () => {
    if (!active) return;
    try {
      const res = await axios.post(`/chat/${active._id}/end`, {}, { withCredentials: true });
      setRatingData(res.data);
      setShowRatingModal(true);
      // Remove the match from the list
      setMatches(prev => prev.filter(m => m._id !== active._id));
      setActive(null);
      setMessages([]);
    } catch (e) {
      console.error('Failed to end chat:', e);
      alert('Failed to end chat. Please try again.');
    }
  };

  const handleSubmitRating = async () => {
    if (!ratingData || rating === 0) return;
    setSubmittingRating(true);
    try {
      await axios.post('/ratings', {
        toUserId: ratingData.otherUser,
        stars: rating,
        comment: ratingComment,
        swapId: active?._id
      }, { withCredentials: true });
      setShowRatingModal(false);
      setRatingData(null);
      setRating(0);
      setRatingComment("");
      alert('Rating submitted successfully!');
    } catch (e) {
      console.error('Failed to submit rating:', e);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };
  const renderContent = (text) => {
    try {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = String(text).split(urlRegex);
      return parts.map((part, idx) => {
        if (urlRegex.test(part)) {
          return <a key={idx} href={part} target="_blank" rel="noreferrer" className="underline text-indigo-300 break-words hover:text-indigo-200 transition-colors">{part}</a>;
        }
        return <span key={idx}>{part}</span>;
      });
    } catch {
      return text;
    }
  };
  useEffect(() => {
    loadMe();
    loadMatches();
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    const s = io(socketUrl, { withCredentials: true });
    socketRef.current = s;
    s.on('message', (msg) => {
      const currentMatchId = activeRef.current;
      setMessages(prev => {
        if (prev.some(m => String(m._id) === String(msg._id))) return prev;
        if (currentMatchId && String(msg.match) === String(currentMatchId)) return [...prev, msg];
        return prev;
      });
    });
    return () => { s.close(); };
  }, []);
  useEffect(() => {
    if (active && socketRef.current) {
      activeRef.current = active._id;
      socketRef.current.emit('join', { matchId: active._id });
      loadMessages(active._id);
    }
  }, [active]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, active]);

  const activeMatchUser = me && active ? (String(active.user1._id) === String(me._id) ? active.user2 : active.user1) : null;

  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-12 bg-neutral-900 text-neutral-200 font-sans">
      
      {/* --- Matches Sidebar --- */}
      <aside className="col-span-12 md:col-span-4 lg:col-span-3 bg-neutral-950/50 border-r border-neutral-800 flex flex-col">
        <div className="px-4 py-3 border-b border-neutral-800">
          <h2 className="text-xl font-bold tracking-tight">Matches</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {matches.map(m => {
            const other = me && (String(m.user1._id) === String(me._id) ? m.user2 : m.user1);
            return (
              <button 
                key={m._id} 
                onClick={() => setActive(m)} 
                className={`w-full flex items-center gap-3 text-left p-3 rounded-lg transition-colors duration-200 ${active?._id === m._id ? 'bg-neutral-800' : 'hover:bg-neutral-800/50'}`}
              >
                <div className="relative w-12 h-12 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center font-bold text-white">
                  {other?.name?.charAt(0).toUpperCase()}
                  {/* You can add an online status indicator here */}
                  {/* <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-neutral-900" /> */}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{other?.name || 'User'}</p>
                    <p className="text-xs text-neutral-400 truncate">{m.skillfromuser1} ⇄ {m.skillfromuser2}</p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* --- Main Chat Section --- */}
      <section className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col bg-neutral-900">
        {!active ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-neutral-500">
              <h3 className="text-xl font-medium">Welcome to Swapify Chat</h3>
              <p>Select a match to start a conversation.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-3 border-b border-neutral-800 bg-neutral-950/50 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center font-bold text-white">
                        {activeMatchUser?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold">{activeMatchUser?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleStartMeet} 
                    className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-full transition-colors"
                    aria-label="Start Google Meet"
                  >
                    <VideoCameraIcon />
                  </button>
                  <button 
                    onClick={handleEndChat} 
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-full transition-colors"
                    aria-label="End Chat"
                    title="End Chat & Rate"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="flex flex-col gap-4">
                {messages.map(msg => (
                  <div 
                    key={msg._id} 
                    className={`flex flex-col max-w-[75%] md:max-w-[60%] ${String(msg.sender) === String(me?._id) ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <div className={`rounded-xl px-4 py-3 shadow-md ${String(msg.sender) === String(me?._id) ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-neutral-700 text-neutral-100 rounded-bl-none'}`}>
                      <div className="whitespace-pre-wrap break-words">{renderContent(msg.content)}</div>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1.5">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ))}
              </div>
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-neutral-800 p-3 md:p-4 bg-neutral-950/50 space-y-2">
              {showMeetInput && (
                <div className="flex items-center gap-2 bg-neutral-800 p-2 rounded-lg animate-fade-in-down">
                  <input 
                    value={meetUrl} 
                    onChange={e => setMeetUrl(e.target.value)} 
                    placeholder="Paste Google Meet link here..." 
                    className="flex-1 px-3 py-2 rounded-md bg-neutral-700 border border-neutral-600 placeholder:text-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                  />
                  <button onClick={sendMeetInvite} className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 font-semibold transition-colors">Invite</button>
                  <button onClick={() => { setShowMeetInput(false); setMeetUrl(''); }} className="p-2 rounded-md bg-neutral-600 hover:bg-neutral-500 transition-colors">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} 
                  placeholder="Type a message..." 
                  className="flex-1 px-4 py-2 rounded-full bg-neutral-800 border border-transparent placeholder:text-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
                />
                <button 
                  onClick={sendMessage} 
                  className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed transition-colors"
                  disabled={!input.trim()}
                  aria-label="Send Message"
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Rating Modal */}
      {showRatingModal && ratingData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Rate Your Skill Swap</h3>
              <button 
                onClick={() => setShowRatingModal(false)} 
                className="p-1 rounded-full hover:bg-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-neutral-800 p-4 rounded-lg">
                <p className="text-sm text-neutral-400 mb-2">You swapped with:</p>
                <p className="font-semibold">{ratingData.otherUser?.name}</p>
                <div className="mt-2 text-sm">
                  <p><span className="text-green-400">You offered:</span> {ratingData.skillOffered}</p>
                  <p><span className="text-blue-400">You received:</span> {ratingData.skillReceived}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rate this swap (1-5 stars)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 ${star <= rating ? 'text-yellow-400' : 'text-neutral-400'} hover:text-yellow-400 transition-colors`}
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Optional comment</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="How was the skill swap experience?"
                  className="w-full p-3 rounded-md bg-neutral-800 border border-neutral-700 placeholder:text-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-2.5 px-4 bg-neutral-700 text-white font-semibold rounded-md hover:bg-neutral-600 transition-colors"
              >
                Skip Rating
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={rating === 0 || submittingRating}
                className="flex-1 py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors"
              >
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
