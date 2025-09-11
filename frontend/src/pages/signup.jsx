import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/api";
import { User, Mail, Lock, Eye, EyeOff, Sparkles, Lightbulb, AlertTriangle } from 'lucide-react';
import logo from "../../image.png"; // Make sure this path is correct

// --- Reusable Components ---
const SpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const InputField = ({ name, type = "text", placeholder, icon: Icon, value, onChange, autoComplete }) => (
  <div className="relative">
    <Icon className="w-5 h-5 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      className="w-full pl-12 pr-4 py-3 rounded-md bg-neutral-800 border border-neutral-700 placeholder:text-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
    />
  </div>
);

export default function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", skills_offered: "", skills_wanted: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(""); // Clear error on new input
  };

  const validateForm = () => {
    if (!formData.email.endsWith("@vitstudent.ac.in")) {
      setError("Please use your VIT student email (@vitstudent.ac.in).");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    if (!formData.name.trim()) {
        setError("Please enter your full name.");
        return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        skills_offered: formData.skills_offered.split(",").map(s => s.trim()).filter(Boolean),
        skills_wanted: formData.skills_wanted.split(",").map(s => s.trim()).filter(Boolean),
      };
      await axios.post("/auth/signup", payload, { withCredentials: true });
      // Redirect with a success message state
      navigate('/login', { state: { successMessage: "Signup successful! Please log in." } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-neutral-200 font-sans p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <img src={logo} alt="Swapify Logo" className="w-16 h-16 mx-auto mb-4 rounded-lg" />
          <h1 className="text-3xl font-bold tracking-tight text-white">Join Swapify</h1>
          <p className="text-neutral-400 mt-2">Start your skill swapping journey today.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-neutral-950 border border-neutral-800 p-8 rounded-xl shadow-2xl shadow-black/20 space-y-6">
          
          {/* --- Step 1 --- */}
          <div>
              <h2 className="text-lg font-semibold text-indigo-400 mb-4">Step 1: Account Details</h2>
              <div className="space-y-4">
                  <InputField name="name" placeholder="Full Name" icon={User} value={formData.name} onChange={handleChange} autoComplete="name" />
                  <InputField name="email" type="email" placeholder="VIT Student Email" icon={Mail} value={formData.email} onChange={handleChange} autoComplete="email" />
                  <div className="relative">
                      <InputField name="password" type={showPassword ? "text" : "password"} placeholder="Password (min. 6 characters)" icon={Lock} value={formData.password} onChange={handleChange} autoComplete="new-password"/>
                      <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 p-1"><Eye className="w-5 h-5"/></button>
                  </div>
                  <div className="relative">
                      <InputField name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" icon={Lock} value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password"/>
                      <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 p-1"><Eye className="w-5 h-5"/></button>
                  </div>
              </div>
          </div>
          
          {/* --- Step 2 --- */}
          <div>
              <h2 className="text-lg font-semibold text-indigo-400 mb-4">Step 2: Your Skills</h2>
              <div className="space-y-4">
                  <InputField name="skills_offered" placeholder="Skills you can offer (comma-separated)" icon={Sparkles} value={formData.skills_offered} onChange={handleChange} />
                  <InputField name="skills_wanted" placeholder="Skills you want to learn (comma-separated)" icon={Lightbulb} value={formData.skills_wanted} onChange={handleChange} />
              </div>
          </div>

          {error && (
            <div className="p-3 rounded-md text-sm bg-red-500/10 text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5"/>
                <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 focus:ring-indigo-500 transition-colors disabled:bg-indigo-800/50 disabled:cursor-not-allowed"
          >
            {loading ? <SpinnerIcon /> : 'Create Account'}
          </button>
          
          <div className="text-center">
            <p className="text-sm text-neutral-400">
              Already have an account?{' '}
              <button type="button" onClick={() => navigate('/login')} className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                Sign In
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}