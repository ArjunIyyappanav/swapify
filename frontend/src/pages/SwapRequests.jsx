import { useEffect, useState } from "react";
import axios from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function SwapRequests() {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refresh = async () => {
    const res = await axios.get("/request/mine", { withCredentials: true });
    setSent(res.data.sent || []);
    setReceived(res.data.received || []);
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        await refresh();
      } catch (err) {
        console.error("Failed to fetch requests", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const updateStatus = async (requestId, status) => {
    try {
      const res = await axios.patch("/requests/update", { requestId, status }, { withCredentials: true });
      await refresh();
      if (status === 'accepted') {
        try {
          // Find the corresponding match and navigate directly to it
          const { data: matches } = await axios.get('/chat/matches', { withCredentials: true });
          const updated = sent.concat(received).find(r => r._id === requestId);
          let matchId = null;
          if (updated) {
            matchId = (matches || []).find(m => (
              (String(m.user1?._id) === String(updated.fromUser?._id) && String(m.user2?._id) === String(updated.toUser?._id)) ||
              (String(m.user2?._id) === String(updated.fromUser?._id) && String(m.user1?._id) === String(updated.toUser?._id))
            ))?._id;
          }
          navigate(matchId ? `/chat?matchId=${matchId}` : '/chat');
        } catch (_) {
          navigate('/chat');
        }
      }
    } catch (err) {
      console.error("Failed to update request", err);
      alert("Failed to update request");
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 text-gray-100">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Requests You Sent</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow divide-y divide-gray-800">
          {sent.length === 0 ? (
            <div className="p-4 text-gray-400">No sent requests.</div>
          ) : (
            sent.map(req => (
              <div key={req._id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">To: {req.toUser?.name || 'Unknown'}</div>
                  <div className="text-sm text-gray-400">Offer: {req.skillOffered || '-'} | Want: {req.skillRequested || '-'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm px-2 py-1 rounded-full bg-gray-800">{req.status}</span>
                  {req.status === 'accepted' && (
                    <button
                      onClick={async () => {
                        try {
                          const { data: matches } = await axios.get('/chat/matches', { withCredentials: true });
                          const m = (matches || []).find(m => (
                            (String(m.user1?._id) === String(req.fromUser?._id) && String(m.user2?._id) === String(req.toUser?._id)) ||
                            (String(m.user2?._id) === String(req.fromUser?._id) && String(m.user1?._id) === String(req.toUser?._id))
                          ));
                          navigate(m ? `/chat?matchId=${m._id}` : '/chat');
                        } catch (_) {
                          navigate('/chat');
                        }
                      }}
                      className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >Open chat</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Requests You Received</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow divide-y divide-gray-800">
          {received.length === 0 ? (
            <div className="p-4 text-gray-400">No incoming requests.</div>
          ) : (
            received.map(req => (
              <div key={req._id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="font-medium">From: {req.fromUser?.name || 'Unknown'}</div>
                  <div className="text-sm text-gray-400">Offer: {req.skillOffered || '-'} | Want: {req.skillRequested || '-'}</div>
                </div>
                {req.status === 'accepted' ? (
                  <button
                    onClick={async () => {
                      try {
                        const { data: matches } = await axios.get('/chat/matches', { withCredentials: true });
                        const m = (matches || []).find(m => (
                          (String(m.user1?._id) === String(req.fromUser?._id) && String(m.user2?._id) === String(req.toUser?._id)) ||
                          (String(m.user2?._id) === String(req.fromUser?._id) && String(m.user1?._id) === String(req.toUser?._id))
                        ));
                        navigate(m ? `/chat?matchId=${m._id}` : '/chat');
                      } catch (_) {
                        navigate('/chat');
                      }
                    }}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >Open chat</button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateStatus(req._id, 'accepted')} className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm">Accept</button>
                    <button onClick={() => updateStatus(req._id, 'rejected')} className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm">Reject</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 