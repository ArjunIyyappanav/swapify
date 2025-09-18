import { useState } from "react";
import axios from "../utils/api";
import { User, Sparkles, Lightbulb, AlertTriangle } from "lucide-react";

const SpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function PostRequest() {
  const [formData, setFormData] = useState({ toUsername: "", skillOffered: "", skillRequested: "" });
  const [pendingInfo, setPendingInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setNotification({ show: false, message: "", type: "" }); // Clear notification on change

    if (name === 'toUsername') {
      if (value.trim()) {
        try {
          // Debouncing this check in a real app would be a good optimization
          const res = await axios.get(`/request/pending/${encodeURIComponent(value.trim())}`, { withCredentials: true });
          setPendingInfo(res.data.pending ? 'You already have a pending request with this user.' : '');
        } catch (err) {
          setPendingInfo('');
          console.error("Error checking pending requests:", err);
        }
      } else {
        setPendingInfo('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification({ show: false, message: "", type: "" });

    try {
      const payload = { ...formData, status: 'pending', createdAt: new Date().toISOString() };
      await axios.post("/request/create", payload, { withCredentials: true });
      setNotification({ show: true, message: "Request posted successfully!", type: "success" });
      setFormData({ toUsername: "", skillOffered: "", skillRequested: "" }); // Reset form
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Failed to post request. Please try again.";
      setNotification({ show: true, message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ name, placeholder, icon: Icon, value, onChange }) => (
    <div className="relative">
      <Icon className="w-5 h-5 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-12 pr-4 py-3 rounded-md bg-neutral-800 border border-neutral-700 placeholder:text-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
      />
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-neutral-200 font-sans p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">Propose a Skill Swap</h1>
          <p className="text-neutral-400 mt-2">Fill in the details below to send a request to another user.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-neutral-950 border border-neutral-800 p-8 rounded-xl shadow-2xl shadow-black/20 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Recipient's Username</label>
            <InputField name="toUsername" placeholder="e.g., janedoe" icon={User} value={formData.toUsername} onChange={handleChange} />
            {pendingInfo && (
              <div className="mt-2 flex items-center gap-2 text-sm text-amber-400 p-2 bg-amber-500/10 rounded-md">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{pendingInfo}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Skill You'll Offer</label>
            <InputField name="skillOffered" placeholder="e.g., Web Development" icon={Sparkles} value={formData.skillOffered} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Skill You're Requesting</label>
            <InputField name="skillRequested" placeholder="e.g., Graphic Design" icon={Lightbulb} value={formData.skillRequested} onChange={handleChange} />
          </div>

          {notification.show && (
            <div className={`p-3 rounded-md text-sm text-center ${notification.type === 'success' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
              {notification.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!pendingInfo}
            className="w-full flex justify-center items-center bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 focus:ring-indigo-500 transition-colors disabled:bg-indigo-800/50 disabled:cursor-not-allowed"
          >
            {loading ? <SpinnerIcon /> : 'Send Swap Request'}
          </button>
        </form>
      </div>
    </div>
  );
}