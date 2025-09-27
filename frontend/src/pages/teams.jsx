import { useEffect, useState } from "react";
import axios from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Send, Inbox, ArrowRightLeft, Check, X, MessageSquare, Users } from "lucide-react";

const Spinner = ({ text = "Loading Team Requests..." }) => (
    <div className="flex flex-col items-center justify-center p-10">
        <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-neutral-400">{text}</p>
    </div>
);

const Toast = ({ message, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(), 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg text-white z-[100] animate-fade-in-up bg-red-600">
            {message}
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

const RequestCard = ({ req, type, onUpdateStatus, onOpenChat, onViewRequest, updatingId }) => {
    const otherParty = type === 'sent' ? (req.toTeam || req.toUser) : (req.fromTeam || req.fromUser);
    const isTeamRequest = !!(req.toTeam || req.fromTeam);
    const isPending = req.status === 'pending';
    const isChattable = req.status === 'accepted' && req.matchId;
    const isLoading = updatingId === req._id;

    return (
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:border-neutral-700">
            <div className="flex-1 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${isTeamRequest ? 'bg-purple-500' : 'bg-indigo-500'} flex-shrink-0 flex items-center justify-center font-bold text-white text-xl`}>
                    {isTeamRequest ? <Users size={24} /> : otherParty?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-neutral-200 truncate">{otherParty?.name || 'Unknown'}</span>
                        {isTeamRequest && <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Team</span>}
                        <StatusPill status={req.status} />
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 self-end sm:self-center">
                {type === 'received' && isPending && (
                    <>
                        <button
                            onClick={() => onViewRequest(req)}
                            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors flex items-center gap-2"
                        >
                            View
                        </button>
                        <button disabled={isLoading} onClick={() => onUpdateStatus(req._id, 'rejected')} className="px-3 py-1.5 text-sm bg-red-900/50 hover:bg-red-900/80 text-red-300 rounded-md font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? <Spinner text="" /> : <X size={14} />} Reject
                        </button>
                        <button disabled={isLoading} onClick={() => onUpdateStatus(req._id, 'accepted')} className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? <Spinner text="" /> : <Check size={14} />} Accept
                        </button>
                    </>
                )}
                {isChattable && (
                    <button onClick={() => onOpenChat(req)} className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors flex items-center gap-2">
                        <MessageSquare size={14} /> Open Chat
                    </button>
                )}
            </div>
        </div>
    );
};

export default function TeamRequests() {
    const [sent, setSent] = useState([]);
    const [received, setReceived] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: "" });
    const [viewingRequest, setViewingRequest] = useState(null); // For modal
    const navigate = useNavigate();

    const refresh = async () => {
        try {
            const res = await axios.get("/team/mine", { withCredentials: true });
            setSent(res.data.sent || []);
            setReceived(res.data.received || []);
        } catch (err) {
            console.error("Failed to refresh team requests", err);
            setNotification({ show: true, message: "Could not load team requests." });
        }
    };

    useEffect(() => {
        const fetchRequests = async () => {
            await refresh();
            setLoading(false);
        };
        fetchRequests();
    }, []);

    const handleOpenChat = (request) => {
        if (request.matchId) {
            navigate(`/chat?matchId=${request.matchId}`);
        } else {
            console.error("Attempted to open chat for a request with no matchId:", request);
            setNotification({ show: true, message: "Could not find the associated chat." });
        }
    };

    const handleViewRequest = (req) => {
        setViewingRequest(req);
    };

    const updateStatus = async (requestId, status) => {
        setUpdatingId(requestId);
        try {
            await axios.patch("/team/update", { requestId, status }, { withCredentials: true });
            await refresh();
        } catch (err) {
            console.error("Failed to update team request", err);
            setNotification({ show: true, message: "Failed to update team request." });
        } finally {
            setUpdatingId(null);
        }
    };

    const renderRequestList = (requests, type) => {
        if (requests.length === 0) {
            return (
                <div className="text-center p-10 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-500">
                    <h3 className="text-lg font-medium">No {type} team requests here!</h3>
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
                        onOpenChat={handleOpenChat}
                        onViewRequest={handleViewRequest}
                        updatingId={updatingId}
                    />
                ))}
            </div>
        );
    };

    if (loading) return <Spinner />;

    return (
        <>
            {notification.show && <Toast message={notification.message} onDismiss={() => setNotification({ show: false, message: '' })} />}
            <div className="max-w-5xl mx-auto p-4 md:p-6 text-neutral-200 font-sans space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Requests</h1>
                    <p className="text-neutral-400 mt-1">Manage your sent and received team proposals.</p>
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

            {/* Modal for viewing request description */}
            {viewingRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-neutral-950 p-6 rounded-xl max-w-lg w-full">
                        <h3 className="text-xl font-bold mb-4">{viewingRequest.fromTeam?.name || viewingRequest.fromUser?.name || "Team Request"}</h3>
                        <p className="text-neutral-300 mb-6">{viewingRequest.description || "No description provided."}</p>
                        <button
                            onClick={() => setViewingRequest(null)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
