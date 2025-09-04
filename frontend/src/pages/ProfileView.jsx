import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/api";

export default function ProfileView() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/users/${id}`, { withCredentials: true });
        setUser(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return null;
  if (!user) return <div className="max-w-3xl mx-auto p-6 text-gray-100">User not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 text-gray-100">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="text-2xl font-semibold">{user.name}</div>
        <div className="text-sm text-gray-400">{user.email}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="font-medium mb-2">Skills Offered</div>
          <div className="text-sm text-gray-300">{(user.skills_offered||[]).join(', ') || '-'}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="font-medium mb-2">Skills Wanted</div>
          <div className="text-sm text-gray-300">{(user.skills_wanted||[]).join(', ') || '-'}</div>
        </div>
      </div>
    </div>
  );
}


