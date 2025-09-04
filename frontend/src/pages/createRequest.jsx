import { useState } from "react";
import axios from "../utils/api";

export default function CreateRequest() {
  const [formData, setFormData] = useState({ fromUser: "", toUser: "", status: "pending" });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = { ...formData, createdAt: new Date().toISOString() };
      await axios.post("/request/create", payload, { withCredentials: true });
      alert("Request sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to send request");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-100">
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow w-96">
        <h1 className="text-2xl font-bold mb-6">Create Request</h1>
        <input name="fromUser" placeholder="Your User ID" onChange={handleChange} className="w-full p-2 mb-3 rounded bg-gray-800 border border-gray-700 placeholder:text-gray-400" />
        <input name="toUser" placeholder="User ID to request" onChange={handleChange} className="w-full p-2 mb-3 rounded bg-gray-800 border border-gray-700 placeholder:text-gray-400" />
        <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-700">
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">Send Request</button>
      </form>
    </div>
  );
}
