import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "../utils/api";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import logo from "../../image.png";

import { loginStart, loginSuccess, loginFailure } from "../redux/authSlice";

const SpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      dispatch(loginFailure("Please enter both email and password."));
      return;
    }

    dispatch(loginStart());

    try {
      const res = await axios.post("/auth/login", formData, { withCredentials: true });
      dispatch(loginSuccess(res.data)); // save user globally
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      dispatch(loginFailure("Login failed. Please check your credentials."));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-neutral-200 font-sans p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Swapify Logo" className="w-16 h-16 mx-auto mb-4 rounded-lg" />
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
          <p className="text-neutral-400 mt-2">Sign in to continue your skill swapping journey.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-neutral-950 border border-neutral-800 p-8 rounded-xl shadow-2xl shadow-black/20 space-y-6"
        >
          {/* Email */}
          <div className="relative">
            <Mail className="w-5 h-5 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 rounded-md bg-neutral-800 border border-neutral-700 placeholder:text-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="w-5 h-5 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              onChange={handleChange}
              className="w-full pl-12 pr-12 py-3 rounded-md bg-neutral-800 border border-neutral-700 placeholder:text-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-md text-sm bg-red-500/10 text-red-300 text-center">
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed"
          >
            {loading ? <SpinnerIcon /> : "Sign In"}
          </button>

          <div className="text-center">
            <p className="text-sm text-neutral-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                Create one
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
