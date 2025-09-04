import { useEffect, useState } from "react";
import axios from "../utils/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/checkAuth", { withCredentials: true });
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return null;
  if (!user) return <div className="p-6 text-gray-100">Unable to load profile.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-100">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="bg-gray-900 border border-gray-800 shadow rounded-2xl p-6 space-y-4">
        <div>
          <div className="text-gray-400">Name</div>
          <div className="text-lg font-semibold">{user.name}</div>
        </div>
        <div>
          <div className="text-gray-400">Email</div>
          <div className="text-lg">{user.email}</div>
        </div>
        <div>
          <div className="text-gray-400">Skills Offered</div>
          <div className="flex flex-wrap gap-2">
            {(user.skills_offered || []).length === 0 ? (
              <span className="text-gray-400">None</span>
            ) : (
              user.skills_offered.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-blue-950 text-blue-300 border border-blue-900 rounded-full text-sm">{s}</span>
              ))
            )}
          </div>
        </div>
        <div>
          <div className="text-gray-400">Skills Wanted</div>
          <div className="flex flex-wrap gap-2">
            {(user.skills_wanted || []).length === 0 ? (
              <span className="text-gray-400">None</span>
            ) : (
              user.skills_wanted.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-green-950 text-green-300 border border-green-900 rounded-full text-sm">{s}</span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 