import { useEffect, useState } from "react";
import axios from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Send, Inbox, ArrowRightLeft, Check, X, MessageSquare, Trash2 } from "lucide-react";
import UserRating from "../components/UserRating";

const Spinner = ({ text = "Loading Requests..." }) => (
  <div className="flex flex-col items-center justify-center p-10">
    <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-neutral-400">{text}</p>
  </div>
);

const Toast = ({ message, type = 'error', onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(), 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';

  return (
    <div className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg text-white z-[100] animate-fade-in-up ${bgColor}`}>
      {message}
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-neutral-200 mb-2">{title}</h3>
        <p className="text-neutral-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Clearing...
              </>
            ) : (
              <>Clear All</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusPill = ({ status }) => {
  const styles = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    accepted: "bg-green-500/10 text-green-400 border-green-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${styles[status] || ''}`}>{status}</span>;
};

const RequestCard = ({ req, type, onUpdateStatus, onOpenChat, onDeleteRequest, updatingId, deletingId }) => {
    const otherUser = type === 'sent' ? req.toUser : req.fromUser;
    const isPending = req.status === 'pending';
    const isAccepted = req.status === 'accepted';
    const isLoading = updatingId === req._id;
    const isDeleting = deletingId === req._id;

    return (
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:border-neutral-700">
            <div className="flex-1 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center font-bold text-white text-xl">
                    {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-200 truncate">{otherUser?.name || 'Unknown User'}</span>
                        <StatusPill status={req.status} />
                    </div>
                    <div className="text-sm text-neutral-400 mt-1 flex items-center gap-2">
                        <span>{type === 'sent' ? 'You Offer:' : 'They Offer:'} <strong>{req.skillOffered}</strong></span>
                        <ArrowRightLeft className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                        <span>{type === 'sent' ? 'You Want:' : 'You Give:'} <strong>{req.skillRequested}</strong></span>
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 flex items-center gap-2 self-end sm:self-center">
                {type === 'received' && isPending && (
                    <>
                        <button disabled={isLoading || isDeleting} onClick={() => onUpdateStatus(req._id, 'rejected')} className="px-3 py-1.5 text-sm bg-red-900/50 hover:bg-red-900/80 text-red-300 rounded-md font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? <Spinner text="" /> : <X size={14} />} Reject
                        </button>
                        <button disabled={isLoading || isDeleting} onClick={() => onUpdateStatus(req._id, 'accepted')} className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? <Spinner text="" /> : <Check size={14} />} Accept
                        </button>
                    </>
                )}
                {isAccepted && (
                    <button disabled={isDeleting} onClick={() => onOpenChat(req)} className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <MessageSquare size={14} /> Open Chat
                    </button>
                )}
                {/* Delete button - always visible */}
                <button 
                    disabled={isLoading || isDeleting} 
                    onClick={() => onDeleteRequest(req._id)} 
                    className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete request"
                >
                    {isDeleting ? (
                        <>
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </>
                    ) : (
                        <Trash2 size={14} />
                    )}
                </button>
            </div>
        </div>
    );
};

export default function SwapRequests() {
    const [sent, setSent] = useState([]);
    const [received, setReceived] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [userRatings, setUserRatings] = useState({});
    const [notification, setNotification] = useState({ show: false, message: "", type: "error" });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [clearingRequests, setClearingRequests] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const navigate = useNavigate();

    const refresh = async () => {
        try {
            const res = await axios.get("/request/mine", { withCredentials: true });
            setSent(res.data.sent || []);
            setReceived(res.data.received || []);
        } catch (err) {
            console.error("Failed to refresh requests", err);
            setNotification({ show: true, message: "Could not load requests.", type: "error" });
        }
    };

    useEffect(() => {
        const fetchRequests = async () => {
            await refresh();
            setLoading(false);
        };
        fetchRequests();
    }, []);

    const findMatchAndNavigate = async (request) => {
        try {
            const { data: matches } = await axios.get('/chat/matches', { withCredentials: true });
            const match = (matches || []).find(m =>
                (String(m.user1?._id) === String(request.fromUser?._id) && String(m.user2?._id) === String(request.toUser?._id)) ||
                (String(m.user2?._id) === String(request.fromUser?._id) && String(m.user1?._id) === String(request.toUser?._id))
            );
            navigate(match ? `/chat?matchId=${match._id}` : '/chat');
        } catch (err) {
            console.error("Failed to find match", err);
            navigate('/chat');
        }
    };

    const updateStatus = async (requestId, status) => {
        setUpdatingId(requestId);
        try {
            await axios.patch("/requests/update", { requestId, status }, { withCredentials: true });
            const updatedRequest = received.find(r => r._id === requestId) || sent.find(r => r._id === requestId);
            if (status === 'accepted' && updatedRequest) {
                await findMatchAndNavigate(updatedRequest);
            }
            await refresh();
        } catch (err) {
            console.error("Failed to update request", err);
            setNotification({ show: true, message: "Failed to update request.", type: "error" });
        } finally {
            setUpdatingId(null);
        }
    };

    const deleteRequest = async (requestId) => {
        setDeletingId(requestId);
        try {
            await axios.delete(`/request/delete/${requestId}`, { withCredentials: true });
            await refresh();
            setNotification({ 
                show: true, 
                message: "Request deleted successfully!",
                type: "success"
            });
        } catch (err) {
            console.error("Failed to delete request", err);
            setNotification({ show: true, message: "Failed to delete request.", type: "error" });
        } finally {
            setDeletingId(null);
        }
    };

    const clearAllRequests = async () => {
        setClearingRequests(true);
        try {
            const response = await axios.delete("/requests/clear", { withCredentials: true });
            await refresh();
            setNotification({ 
                show: true, 
                message: `Cleared ${response.data.sentDeleted + response.data.receivedDeleted} requests successfully!`,
                type: "success"
            });
            setShowConfirmModal(false);
        } catch (err) {
            console.error("Failed to clear requests", err);
            setNotification({ show: true, message: "Failed to clear requests.", type: "error" });
        } finally {
            setClearingRequests(false);
        }
    };

    const renderRequestList = (requests, type) => {
        if (requests.length === 0) {
            return (
                <div className="text-center p-10 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-500">
                    <h3 className="text-lg font-medium">No {type} requests here!</h3>
                </div>
            );
        }
        return (
            <div className="space-y-4">
                {requests.map(req => (
                    <RequestCard
                        key={req._id}
                        req={req}
                        type={type}
                        onUpdateStatus={updateStatus}
                        onOpenChat={findMatchAndNavigate}
                        onDeleteRequest={deleteRequest}
                        updatingId={updatingId}
                        deletingId={deletingId}
                    />
                ))}
            </div>
        );
    };

    if (loading) return <Spinner />;

    const hasAnyRequests = sent.length > 0 || received.length > 0;

    return (
        <>
            {notification.show && <Toast message={notification.message} type={notification.type} onDismiss={() => setNotification({ show: false, message: '', type: 'error' })} />}
            <ConfirmModal 
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={clearAllRequests}
                title="Clear All Requests"
                message="Are you sure you want to clear all requests? This will permanently delete all sent and received requests. This action cannot be undone."
                isLoading={clearingRequests}
            />
            <div className="max-w-5xl mx-auto p-4 md:p-6 text-neutral-200 font-sans space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Swap Requests</h1>
                        <p className="text-neutral-400 mt-1">Manage your sent and received skill swap proposals.</p>
                    </div>
                    {hasAnyRequests && (
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <Trash2 size={16} />
                            Clear All
                        </button>
                    )}
                </div>

                <section>
                    <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4">
                        <Send className="w-6 h-6 text-indigo-400" />
                        Requests You Sent
                    </h2>
                    {renderRequestList(sent, 'sent')}
                </section>

                <section>
                    <h2 className="flex items-center gap-3 text-2xl font-semibold mb-4">
                        <Inbox className="w-6 h-6 text-indigo-400" />
                        Requests You Received
                    </h2>
                    {renderRequestList(received, 'received')}
                </section>
            </div>
        </>
    );
}