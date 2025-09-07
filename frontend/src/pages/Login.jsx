import { useState } from "react";
import { useNavigate } from "react-router-dom";   // ✅ import
import axios from "../utils/api";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();   // ✅ hook

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post("/auth/login", formData, { withCredentials: true });
      // Trigger a custom event to update navbar
      window.dispatchEvent(new Event('userLogin'));
      navigate("/dashboard");   // ✅ redirect after login
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-100 p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Login</h1>
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 mb-4 rounded-lg bg-gray-800 border border-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
          />
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full p-3 pr-10 rounded-lg bg-gray-800 border border-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Login
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 mb-3">Don't have an account?</p>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium border border-gray-700"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
