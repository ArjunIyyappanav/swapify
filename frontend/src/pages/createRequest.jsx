import { useState } from "react";
import axios from "../utils/api";

const SpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function CreateRequest() {
  const [formData, setFormData] = useState({ fromUser: "", toUser: "", status: "pending" });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.fromUser || !formData.toUser) {
      setNotification({ show: true, message: "Please fill out both user IDs.", type: "error" });
      return;
    }

    setLoading(true);
    setNotification({ show: false, message: "", type: "" }); // Clear previous notification

    try {
      const payload = { ...formData, createdAt: new Date().toISOString() };
      await axios.post("/request/create", payload, { withCredentials: true });
      setNotification({ show: true, message: "Request sent successfully!", type: "success" });
      setFormData({ fromUser: "", toUser: "", status: "pending" }); // Reset form
    } catch (err) {
      console.error(err);
      setNotification({ show: true, message: "Failed to send request. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-neutral-200 font-sans p-4">
      <div className="w-full max-w-md">
        <form 
          onSubmit={handleSubmit} 
          className="bg-neutral-950 border border-neutral-800 p-8 rounded-xl shadow-2xl shadow-black/20 space-y-6"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Create a Swap Request</h1>
            <p className="text-neutral-400 mt-2">Enter the details below to initiate a skill swap.</p>
          </div>
          
          {/* Form Fields */}
          <div className="space-y-5">
            <div>
              <label htmlFor="fromUser" className="block text-sm font-medium text-neutral-300 mb-2">Your User ID</label>
              <input 
                id="fromUser"
                name="fromUser" 
                value={formData.fromUser}
                placeholder="e.g., 60d21b4667d0d8992e610c85" 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 rounded-md bg-neutral-800 border border-neutral-700 placeholder:text-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
              />
            </div>
            
            <div>
              <label htmlFor="toUser" className="block text-sm font-medium text-neutral-300 mb-2">Recipient's User ID</label>
              <input 
                id="toUser"
                name="toUser"
                value={formData.toUser} 
                placeholder="e.g., 60d21b4667d0d8992e610c86" 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 rounded-md bg-neutral-800 border border-neutral-700 placeholder:text-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
              />
            </div>

            {/* The status field is often set by the backend, but keeping it as per your original code */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-neutral-300 mb-2">Status</label>
              <select 
                id="status"
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 rounded-md bg-neutral-800 border border-neutral-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition appearance-none"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          {/* --- Notification Area --- */}
          {notification.show && (
            <div className={`p-3 rounded-md text-sm ${notification.type === 'success' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
              {notification.message}
            </div>
          )}

          {/* --- Submit Button --- */}
          <button 
            type="submit"
            disabled={loading} 
            className="w-full flex justify-center items-center bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 focus:ring-indigo-500 transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed"
          >
            {loading ? <SpinnerIcon /> : 'Send Request'}
          </button>
        </form>
      </div>
    </div>
  );
}