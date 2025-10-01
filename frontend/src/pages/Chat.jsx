import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "../utils/api";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import UserRating from "../components/UserRating";

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

const BlockIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

const EndChatIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
  </svg>
);

const StarIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const PaperClipIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
  </svg>
);

const DocumentIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const PhotoIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const DownloadIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
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
  const [showEndChatModal, setShowEndChatModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [endingChat, setEndingChat] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [rating, setRating] = useState({ stars: 5, review: '', skillRated: '', matchId: null });
  const [userRatings, setUserRatings] = useState({});
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const socketRef = useRef(null);
  const activeRef = useRef(null);
  const bottomRef = useRef(null);
  const location = useLocation();

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
    const userIds = [...new Set(list.flatMap(m => [m.user1._id, m.user2._id]))];
    
    if (userIds.length > 0) {
      try {
        const ratingsRes = await axios.post('/rating/bulk', { userIds }, { withCredentials: true });
        setUserRatings(ratingsRes.data);
      } catch (error) {
        console.error('Error loading bulk ratings:', error);
        // Fallback to default ratings
        const ratingsMap = {};
        userIds.forEach(userId => {
          ratingsMap[userId] = { averageRating: 5.0, totalRatings: 0 };
        });
        setUserRatings(ratingsMap);
      }
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
    
    setEndingChat(true);
    try {
      const currentMatchId = active._id;
      const response = await axios.post(`/chat/${active._id}/end`, {}, { withCredentials: true });
      
      setNotification({ show: true, message: 'Chat ended successfully', type: 'success' });
      setShowEndChatModal(false);
      const otherUser = String(active.user1._id) === String(me._id) ? active.user2 : active.user1;
      const skillToRate = String(active.user1._id) === String(me._id) ? active.skillfromuser2 : active.skillfromuser1;

      loadMatches();
      setActive(null);

      if (response.data.needsRating) {
        setRating({ 
          stars: 5, 
          review: '', 
          skillRated: skillToRate || 'General skill exchange',
          matchId: currentMatchId
        });
        setShowRatingModal(true);
      }
    } catch (error) {
      console.error('Error ending chat:', error);
      setNotification({ 
        show: true, 
        message: error.response?.data?.message || 'Failed to end chat', 
        type: 'error' 
      });
    } finally {
      setEndingChat(false);
    }
  };
  
  const handleBlockUser = async () => {
    if (!active) return;
    
    const otherUser = String(active.user1._id) === String(me._id) ? active.user2 : active.user1;
    
    setBlocking(true);
    try {
      await axios.post('/block', {
        blockedUserId: otherUser._id,
        reason: 'Blocked from chat'
      }, { withCredentials: true });
      
      setNotification({ show: true, message: `${otherUser.name} has been blocked`, type: 'success' });
      setShowBlockModal(false);

      loadMatches();
      setActive(null);
    } catch (error) {
      console.error('Error blocking user:', error);
      setNotification({ 
        show: true, 
        message: error.response?.data?.message || 'Failed to block user', 
        type: 'error' 
      });
    } finally {
      setBlocking(false);
    }
  };
  
  const handleSubmitRating = async () => {

    if (!rating.matchId || !rating.stars || !rating.skillRated) {
      setNotification({ 
        show: true, 
        message: 'Missing rating information. Please try again.', 
        type: 'error' 
      });
      return;
    }
    
    try {
      await axios.post('/rating', {
        matchId: rating.matchId,
        rating: rating.stars,
        review: rating.review,
        skillRated: rating.skillRated
      }, { withCredentials: true });
      
      setNotification({ show: true, message: 'Rating submitted successfully!', type: 'success' });
      setShowRatingModal(false);
      setRating({ stars: 5, review: '', skillRated: '', matchId: null });
 
      loadMatches();
    } catch (error) {
      console.error('Error submitting rating:', error);
      setNotification({ 
        show: true, 
        message: error.response?.data?.message || 'Failed to submit rating', 
        type: 'error' 
      });
    }
  };
  
  const handleFileUpload = async (file) => {
    if (!active || !file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    try {
      const { data } = await axios.post(`/chat/${active._id}/upload`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error uploading file:', error);
      setNotification({ 
        show: true, 
        message: error.response?.data?.message || 'Failed to upload file', 
        type: 'error' 
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setNotification({ 
          show: true, 
          message: 'File size must be less than 10MB', 
          type: 'error' 
        });
        return;
      }
      handleFileUpload(file);
    }
  };
  
  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return <PhotoIcon className="w-5 h-5" />;
    return <DocumentIcon className="w-5 h-5" />;
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const handleFileDownload = async (messageId, filename) => {
    try {
      const response = await axios.get(`/chat/download/${messageId}`, {
        withCredentials: true,
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      setNotification({ 
        show: true, 
        message: 'Failed to download file', 
        type: 'error' 
      });
    }
  };
  const renderContent = (message) => {
    if (message.messageType === 'file' && message.file) {
      const isImage = message.file.mimetype.startsWith('image/');
      return (
        <div className="file-message">
          {isImage ? (
            <div className="mb-2">
              <img 
                src={`http://localhost:3000/uploads/${message.file.filename}`}
                alt={message.file.originalName}
                className="max-w-xs max-h-48 rounded-lg cursor-pointer"
                onClick={() => handleFileDownload(message._id, message.file.originalName)}
              />
            </div>
          ) : null}
          <div className="flex items-center gap-2 bg-black/20 rounded-lg p-2">
            {getFileIcon(message.file.mimetype)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.file.originalName}</p>
              <p className="text-xs opacity-70">{formatFileSize(message.file.size)}</p>
            </div>
            <button 
              onClick={() => handleFileDownload(message._id, message.file.originalName)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Download file"
            >
              <DownloadIcon className="w-4 h-4" />
            </button>
          </div>
          {message.content && (
            <p className="text-sm mt-2 opacity-90">{message.content}</p>
          )}
        </div>
      );
    }
    
    try {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = String(message.content).split(urlRegex);
      return parts.map((part, idx) => {
        if (urlRegex.test(part)) {
          return <a key={idx} href={part} target="_blank" rel="noreferrer" className="underline text-indigo-300 break-words hover:text-indigo-200 transition-colors">{part}</a>;
        }
        return <span key={idx}>{part}</span>;
      });
    } catch {
      return message.content || '';
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
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{other?.name || 'User'}</p>
                      <UserRating 
                        rating={userRatings[other?._id]?.averageRating} 
                        totalRatings={userRatings[other?._id]?.totalRatings} 
                        size="xs" 
                        className="flex-shrink-0"
                      />
                    </div>
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
                        <UserRating 
                          rating={userRatings[activeMatchUser?._id]?.averageRating} 
                          totalRatings={userRatings[activeMatchUser?._id]?.totalRatings} 
                          size="sm" 
                          showCount={true}
                        />
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
                    onClick={() => setShowBlockModal(true)} 
                    className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-700 rounded-full transition-colors"
                    aria-label="Block User"
                  >
                    <BlockIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setShowEndChatModal(true)} 
                    className="p-2 text-neutral-400 hover:text-orange-400 hover:bg-neutral-700 rounded-full transition-colors"
                    aria-label="End Chat"
                  >
                    <EndChatIcon className="w-5 h-5" />
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
                      <div className="whitespace-pre-wrap break-words">{renderContent(msg)}</div>
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
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                />
                <label
                  htmlFor="file-upload"
                  className="p-3 rounded-full bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white transition-colors cursor-pointer"
                  title="Upload file"
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PaperClipIcon className="w-5 h-5" />
                  )}
                </label>
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
      
      {/* Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white z-50 ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {notification.message}
            <button 
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="ml-3 hover:opacity-70"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* End Chat Modal */}
      <AnimatePresence>
        {showEndChatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEndChatModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">End Chat</h3>
              <p className="text-neutral-300 mb-6">Are you sure you want to end this chat with {activeMatchUser?.name}? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndChatModal(false)}
                  className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndChat}
                  disabled={endingChat}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {endingChat ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <EndChatIcon className="w-4 h-4" />
                  )}
                  {endingChat ? 'Ending...' : 'End Chat'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Block User Modal */}
      <AnimatePresence>
        {showBlockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBlockModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Block User</h3>
              <p className="text-neutral-300 mb-6">Are you sure you want to block {activeMatchUser?.name}? You won't be able to send or receive messages from this user.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockUser}
                  disabled={blocking}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {blocking ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <BlockIcon className="w-4 h-4" />
                  )}
                  {blocking ? 'Blocking...' : 'Block User'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-4">Rate Your Experience</h3>
              <p className="text-neutral-300 mb-4">How was your skill exchange with {activeMatchUser?.name}?</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRating({ ...rating, stars: star })}
                        className={`p-1 transition-colors ${
                          star <= rating.stars ? 'text-yellow-400' : 'text-neutral-500 hover:text-yellow-300'
                        }`}
                      >
                        <StarIcon className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Review (Optional)</label>
                  <textarea
                    value={rating.review}
                    onChange={e => setRating({ ...rating, review: e.target.value })}
                    placeholder="Share your experience..."
                    rows={3}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowRatingModal(false)}
                    className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleSubmitRating}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <StarIcon className="w-4 h-4" />
                    Submit Rating
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
