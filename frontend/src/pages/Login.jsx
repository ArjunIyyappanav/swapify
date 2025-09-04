import { useState } from "react";
import { useNavigate } from "react-router-dom";   // ✅ import
import axios from "../utils/api";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();   // ✅ hook

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post("/auth/login", formData, { withCredentials: true });
      // alert("Login successfull!");
      navigate("/dashboard");   // ✅ redirect after login
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow w-96"
      >
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full p-2 mb-3 rounded bg-gray-800 border border-gray-700 placeholder:text-gray-400"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-700 placeholder:text-gray-400"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
