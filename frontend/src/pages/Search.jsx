import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../utils/api";
import { Search as SearchIcon, X, Sparkles, Lightbulb, User, Send, SearchX, AlertTriangle } from "lucide-react";

// --- Reusable Components for this page ---
const Spinner = ({ text })  => (
  <div className="flex flex-col items-center justify-center p-10">
    <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    {text && <p className="mt-4 text-neutral-400">{text}</p>}
  </div>
);

const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(), 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const typeClasses = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  return (
    <div className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg text-white z-[100] animate-fade-in-up ${typeClasses}`}>
      {message}
    </div>
  );
};


export default function Search() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [requestData, setRequestData] = useState({ skillOffered: "", skillRequested: "" });
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  // Debounced search on input change
  useEffect(() => {
    const handler = setTimeout(() => {
      if (q !== (params.get('q') || '')) {
        setParams(q ? { q } : {}, { replace: true });
      }
    }, 500); // 500ms delay
    return () => clearTimeout(handler);
  }, [q, params, setParams]);

  // Run search when URL params change
  useEffect(() => {
    const runSearch = async (query) => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`/users/search`, { params: { q: query }, withCredentials: true });
        setResults(data || [])
      } catch (e) {
        console.error(e);
        setResults([]);
        setError(e?.response?.data?.message || 'Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    const queryFromParams = params.get('q') || '';
    setQ(queryFromParams);
    runSearch(queryFromParams);
  }, [params]);

  const handleSendRequest = (user) => {
    setSelectedUser(user);
    setShowRequestModal(true);
  };

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
  
  const renderContent = () => {
    if (loading) {
      return <Spinner text="Searching for users..." />;
    }
    if (error) {
      return <div className="p-4 text-center text-red-400 bg-red-500/10 rounded-lg flex items-center justify-center gap-2"><AlertTriangle size={18}/> {error}</div>;
    }
    if (results.length === 0) {
        if (!q.trim()) {
             return <div className="text-center p-10 text-neutral-500">
                <h3 className="text-lg font-medium">Start by searching for a skill or user.</h3>
            </div>
        }
      return (
        <div className="text-center p-10 text-neutral-500">
          <SearchX className="w-16 h-16 mx-auto mb-4 text-neutral-600"/>
          <h3 className="text-xl font-bold text-neutral-300">No Users Found</h3>
          <p>Try adjusting your search terms to find what you're looking for.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {results.map(u => (
          <div key={u._id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 transition-all hover:border-neutral-700 hover:shadow-lg">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center font-bold text-white text-xl">
                        {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <button onClick={() => navigate(`/users/${u.name}`)} className="text-lg font-bold hover:underline truncate">{u.name}</button>
                        <div className="text-sm text-neutral-400 truncate">{u.email}</div>
                    </div>
                </div>
                 <div className="flex-shrink-0 flex items-center gap-2">
                    <button onClick={() => navigate(`/team/create/${u.name}`)} className="px-3 py-1.5 text-sm bg-neutral-800 hover:bg-neutral-700 rounded-md font-semibold transition-colors flex items-center gap-2"><User size={14}/> Team Request</button>
                    <button onClick={() => handleSendRequest(u)} className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors flex items-center gap-2"><Send size={14}/> Propose Swap</button>
                </div>
            </div>
             <div className="mt-4 border-t border-neutral-800 pt-4 space-y-3">
                <div className="text-xs text-sky-300 font-semibold uppercase flex items-center gap-2"><Sparkles size={14}/> SKILLS OFFERED</div>
                <div className="flex flex-wrap gap-2">
                    {(u.skills_offered||[]).length > 0 ? u.skills_offered.map((s,i) => <span key={i} className="px-2.5 py-1 bg-sky-500/10 text-sky-300 border border-sky-500/20 rounded-full text-xs font-medium">{s}</span>) : <span className="text-neutral-500 text-xs">None listed.</span>}
                </div>
             </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {notification.show && <Toast message={notification.message} type={notification.type} onDismiss={() => setNotification({ show: false, message: '', type: '' })} />}
      <div className="max-w-4xl mx-auto p-4 md:p-6 text-neutral-200 font-sans space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Find a Skill Swap</h1>
            <p className="text-neutral-400 mt-1">Search for other users by their name or the skills they offer.</p>
        </div>
        <div className="relative">
          <SearchIcon className="w-5 h-5 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            value={q} 
            onChange={e => setQ(e.target.value)} 
            placeholder="Search by name or skills like 'React', 'Photography'..." 
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 placeholder:text-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
          />
        </div>
        <div>
          {renderContent()}
        </div>
      </div>

      {showRequestModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-lg mx-4 transition-transform duration-300 animate-fade-in-up shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Send Request to {selectedUser.name}</h3>
              <button onClick={handleCloseModal} className="p-1 rounded-full hover:bg-neutral-700"><X /></button>
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
    </>
  );
}