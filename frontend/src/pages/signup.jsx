import { useState } from "react";
import axios from "../utils/api";

export default function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", skills_offered: "", skills_wanted: "" });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        skills_offered: formData.skills_offered.split(",").map(s => s.trim()).filter(Boolean),
        skills_wanted: formData.skills_wanted.split(",").map(s => s.trim()).filter(Boolean),
      };
      await axios.post("/auth/signup", payload, { withCredentials: true });
      alert("Signup successful!");
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-100">
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow w-96">
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>
        <input name="name" placeholder="Name" onChange={handleChange} className="w-full p-2 mb-3 rounded bg-gray-800 border border-gray-700 placeholder:text-gray-400" />
        <input name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 mb-3 rounded bg-gray-800 border border-gray-700 placeholder:text-gray-400" />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-2 mb-3 rounded bg-gray-800 border border-gray-700 placeholder:text-gray-400" />
        <input name="skills_offered" placeholder="Skills you can teach (comma separated)" onChange={handleChange} className="w-full p-2 mb-3 rounded bg-gray-800 border border-gray-700 placeholder:text-gray-400" />
        <input name="skills_wanted" placeholder="Skills you want to learn (comma separated)" onChange={handleChange} className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-700 placeholder:text-gray-400" />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Sign Up</button>
      </form>
    </div>
  );
}
