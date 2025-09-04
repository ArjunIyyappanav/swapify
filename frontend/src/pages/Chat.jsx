import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "../utils/api";
import { io } from "socket.io-client";

export default function Chat() {
  const [matches, setMatches] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showMeetInput, setShowMeetInput] = useState(false);
  const [meetUrl, setMeetUrl] = useState("");
  const [me, setMe] = useState(null);
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
      // Optimistically append; socket will also deliver to other participant
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

  const renderContent = (text) => {
    try {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = String(text).split(urlRegex);
      return parts.map((part, idx) => {
        if (urlRegex.test(part)) {
          return <a key={idx} href={part} target="_blank" rel="noreferrer" className="underline text-blue-200 break-words">{part}</a>;
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
    const s = io('http://localhost:3000', { withCredentials: true });
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
    // Auto-scroll to the newest message
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, active]);

  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-12 bg-gray-950 text-gray-100">
      <aside className="col-span-4 border-r border-gray-800 overflow-y-auto">
        <h2 className="px-4 py-3 text-lg font-semibold">Matches</h2>
        {matches.map(m => {
          const other = me && (String(m.user1._id) === String(me._id) ? m.user2 : m.user1);
          return (
            <button key={m._id} onClick={() => setActive(m)} className={`w-full text-left px-4 py-3 hover:bg-gray-900 ${active?._id===m._id?'bg-gray-900':''}`}>
              <div className="font-medium">{other?.name || 'User'}</div>
              <div className="text-xs text-gray-400">{m.skillfromuser1} ⇄ {m.skillfromuser2}</div>
            </button>
          );
        })}
      </aside>
      <section className="col-span-8 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!active ? (
            <div className="text-gray-400">Select a match to start chatting</div>
          ) : (
            messages.map(msg => (
              <div key={msg._id} className={`max-w-[75%] rounded-2xl px-4 py-2 ${String(msg.sender)===String(me?._id)?'bg-blue-600 text-white ml-auto':'bg-gray-800 text-gray-100'}`}>
                <div className="whitespace-pre-wrap break-words">{renderContent(msg.content)}</div>
                <div className="text-[10px] opacity-70 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-gray-800 p-3 flex flex-col gap-2">
          {showMeetInput && (
            <div className="flex gap-2">
              <input value={meetUrl} onChange={e=>setMeetUrl(e.target.value)} placeholder="Paste Google Meet link and press Send invite" className="flex-1 px-3 py-2 rounded bg-gray-900 border border-gray-800 placeholder:text-gray-400" />
              <button onClick={sendMeetInvite} className="px-4 py-2 rounded bg-green-600 hover:bg-green-700">Send invite</button>
              <button onClick={()=>{ setShowMeetInput(false); setMeetUrl(''); }} className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600">Cancel</button>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={handleStartMeet} className="px-3 py-2 rounded bg-purple-600 hover:bg-purple-700">Start Meet</button>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') sendMessage(); }} placeholder="Type a message..." className="flex-1 px-3 py-2 rounded bg-gray-900 border border-gray-800 placeholder:text-gray-400" />
            <button onClick={sendMessage} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700">Send</button>
          </div>
        </div>
      </section>
    </div>
  );
} 