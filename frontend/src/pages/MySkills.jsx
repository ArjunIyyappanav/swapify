import { useEffect, useState } from "react";
import axios from "../utils/api";

export default function MySkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("/auth/checkAuth", { withCredentials: true });
        setSkills(res.data.skills_offered || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-100">
      <h1 className="text-3xl font-bold mb-6">My Skills</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        {skills.length === 0 ? (
          <div className="text-gray-400">No skills listed.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span key={i} className="px-3 py-1 bg-blue-950 text-blue-300 border border-blue-900 rounded-full text-sm">{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 