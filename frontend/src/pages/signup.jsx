import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/api";

export default function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", skills_offered: "", skills_wanted: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // Validate password confirmation
    if (name === 'confirmPassword' || name === 'password') {
      if (newFormData.password && newFormData.confirmPassword) {
        if (newFormData.password !== newFormData.confirmPassword) {
          setPasswordError("Passwords do not match");
        } else {
          setPasswordError("");
        }
      } else if (newFormData.password && newFormData.confirmPassword === "") {
        setPasswordError("");
      }
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        skills_offered: formData.skills_offered.split(",").map(s => s.trim()).filter(Boolean),
        skills_wanted: formData.skills_wanted.split(",").map(s => s.trim()).filter(Boolean),
      };
      await axios.post("/auth/signup", payload, { withCredentials: true });
      alert("Signup successful! Please login to continue.");
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-100 p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Create Account</h1>
          
          <input 
            name="name" 
            placeholder="Full Name" 
            onChange={handleChange} 
            className="w-full p-3 mb-4 rounded-lg bg-gray-800 border border-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors" 
          />
          
          <input 
            name="email" 
            placeholder="Email (@vitstudent.ac.in)" 
            onChange={handleChange} 
            className="w-full p-3 mb-4 rounded-lg bg-gray-800 border border-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors" 
          />
          
          <div className="relative mb-4">
            <input 
              type={showPassword ? "text" : "password"}
              name="password" 
              placeholder="Password (min 6 characters)" 
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
          
          <div className="relative mb-4">
            <input 
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword" 
              placeholder="Confirm Password" 
              onChange={handleChange} 
              className="w-full p-3 pr-10 rounded-lg bg-gray-800 border border-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors" 
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>
          
          {passwordError && (
            <div className="text-red-400 text-sm mb-4">{passwordError}</div>
          )}
          
          <input 
            name="skills_offered" 
            placeholder="Skills you can teach (comma separated)" 
            onChange={handleChange} 
            className="w-full p-3 mb-4 rounded-lg bg-gray-800 border border-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors" 
          />
          
          <input 
            name="skills_wanted" 
            placeholder="Skills you want to learn (comma separated)" 
            onChange={handleChange} 
            className="w-full p-3 mb-6 rounded-lg bg-gray-800 border border-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors" 
          />
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Account
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 mb-3">Already have an account?</p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium border border-gray-700"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
