import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../utils/api";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
            <button key={u._id} onClick={()=>navigate(`/user/${u._id}`)} className="w-full text-left p-4 hover:bg-gray-800">
              <div className="font-medium">{u.name}</div>
              <div className="text-xs text-gray-400">Offered: {(u.skills_offered||[]).join(', ') || '-'}</div>
              <div className="text-xs text-gray-400">Wanted: {(u.skills_wanted||[]).join(', ') || '-'}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


