import { useState } from "react";
import axios from "../utils/api";

export default function PostRequest() {
  const [formData, setFormData] = useState({ toUsername: "", skillOffered: "", skillRequested: "" });
  const [pendingInfo, setPendingInfo] = useState("");

  const handleChange = async e => {
    const next = { ...formData, [e.target.name]: e.target.value };
    setFormData(next);
    if (e.target.name === 'toUsername' && next.toUsername.trim()) {
      try {
        const res = await axios.get(`/request/pending/${encodeURIComponent(next.toUsername.trim())}`, { withCredentials: true });
        setPendingInfo(res.data.pending ? 'You already have a pending request to this user.' : '');
      } catch (err) {
        setPendingInfo('');
      }
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = { ...formData, status: 'pending', createdAt: new Date().toISOString() };
      await axios.post("/request/create", payload, { withCredentials: true });
      alert("Request posted!");
    } catch (err) {
      console.error(err);
      alert("Failed to post request");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-100">
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow w-96">
        <h1 className="text-2xl font-bold mb-6">Post a Request</h1>
        <input name="toUsername" placeholder="Recipient username" onChange={handleChange} className="w-full p-2 mb-1 rounded bg-gray-800 border border-gray-700 placeholder:text-gray-400" />
        {pendingInfo && <div className="text-sm text-amber-400 mb-2">{pendingInfo}</div>}
        <input name="skillOffered" placeholder="Skill you offer" onChange={handleChange} className="w-full p-2 mb-3 rounded bg-gray-800 border border-gray-700 placeholder:text-gray-400" />
        <input name="skillRequested" placeholder="Skill you want" onChange={handleChange} className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-700 placeholder:text-gray-400" />
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Submit</button>
      </form>
    </div>
  );
} 