import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../utils/api";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestLoading, setRequestLoading] = useState({});
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [requestData, setRequestData] = useState({ skillOffered: "", skillRequested: "" });
  const navigate = useNavigate();

  const runSearch = async (query) => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      setError("");
      const { data } = await axios.get(`/users/search`, { params: { q: query }, withCredentials: true });
      setResults(data || []);
    } catch (e) {
      console.error(e);
      setResults([]);
      setError(e?.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const query = params.get('q') || '';
    setQ(query);
    runSearch(query);
  }, [params]);

  const onSubmit = (e) => {
    e.preventDefault();
    setParams(q ? { q } : {});
  }

  const handleSendRequest = (user) => {
    setSelectedUser(user);
    setRequestData({ skillOffered: "", skillRequested: "" });
    setShowRequestModal(true);
  }

  const handleSubmitRequest = async () => {
    if (!selectedUser) return;
    
    setRequestLoading(prev => ({ ...prev, [selectedUser._id]: true }));
    try {
      const payload = {
        toUsername: selectedUser.name,
        status: 'pending',
        createdAt: new Date().toISOString(),
        skillOffered: requestData.skillOffered,
        skillRequested: requestData.skillRequested
      };
      await axios.post("/request/create", payload, { withCredentials: true });
      alert(`Request sent to ${selectedUser.name}!`);
      setShowRequestModal(false);
      setSelectedUser(null);
      setRequestData({ skillOffered: "", skillRequested: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to send request");
    } finally {
      setRequestLoading(prev => ({ ...prev, [selectedUser._id]: false }));
    }
  }

  // Debounced search on input change
  useEffect(() => {
    const handle = setTimeout(() => {
      if (q !== (params.get('q') || '')) setParams(q ? { q } : {});
    }, 300);
    return () => clearTimeout(handle);
  }, [q]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 text-gray-100">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name or skills" className="flex-1 px-3 py-2 rounded bg-gray-900 border border-gray-800 placeholder:text-gray-400" />
        <button className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700">Search</button>
      </form>
      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}
      {loading ? (
        <div className="text-gray-400">Searching...</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800">
          {results.length === 0 ? (
            <div className="p-4 text-gray-400">No results</div>
          ) : results.map(u => (
            <div key={u._id} className="p-4 hover:bg-gray-800 border-b border-gray-800 last:border-b-0">
              <button onClick={()=>navigate(`/user/${u._id}`)} className="w-full text-left">
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-gray-400">Offered: {(u.skills_offered||[]).join(', ') || '-'}</div>
                <div className="text-xs text-gray-400">Wanted: {(u.skills_wanted||[]).join(', ') || '-'}</div>
              </button>
              <div className="mt-3 flex gap-2">
                <button 
                  onClick={() => handleSendRequest(u)}
                  disabled={requestLoading[u._id]}
                  className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                >
                  {requestLoading[u._id] ? 'Sending...' : 'Send Request'}
                </button>
                <button 
                  onClick={()=>navigate(`/user/${u._id}`)}
                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Send Request to {selectedUser.name}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">What skill can you offer?</label>
                <input
                  type="text"
                  value={requestData.skillOffered}
                  onChange={(e) => setRequestData({...requestData, skillOffered: e.target.value})}
                  placeholder="e.g., JavaScript, Python, Design..."
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">What skill do you want to learn?</label>
                <input
                  type="text"
                  value={requestData.skillRequested}
                  onChange={(e) => setRequestData({...requestData, skillRequested: e.target.value})}
                  placeholder="e.g., React, Machine Learning, Photography..."
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedUser(null);
                  setRequestData({ skillOffered: "", skillRequested: "" });
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={requestLoading[selectedUser._id] || !requestData.skillOffered.trim() || !requestData.skillRequested.trim()}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {requestLoading[selectedUser._id] ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


