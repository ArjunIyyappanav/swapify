import { useEffect, useState } from "react";
import axios from "../utils/api";

export default function MySkills() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ skills_offered: "", skills_wanted: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("/auth/checkAuth", { withCredentials: true });
        setUser(res.data);
        setEditData({
          skills_offered: (res.data.skills_offered || []).join(", "),
          skills_wanted: (res.data.skills_wanted || []).join(", ")
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        skills_offered: editData.skills_offered.split(",").map(s => s.trim()).filter(Boolean),
        skills_wanted: editData.skills_wanted.split(",").map(s => s.trim()).filter(Boolean)
      };
      
      const res = await axios.put("/auth/updateSkills", payload, { withCredentials: true });
      setUser(res.data);
      setShowEditModal(false);
      alert("Skills updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update skills");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      skills_offered: (user?.skills_offered || []).join(", "),
      skills_wanted: (user?.skills_wanted || []).join(", ")
    });
    setShowEditModal(false);
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto p-6 text-gray-100">
      <div className="text-center">Loading...</div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Skills</h1>
        <button
          onClick={handleEdit}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Edit Skills
        </button>
      </div>

      <div className="space-y-6">
        {/* Skills Offered */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Skills I Can Offer</h2>
          {user?.skills_offered?.length === 0 ? (
            <div className="text-gray-400">No skills listed.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user?.skills_offered?.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-green-950 text-green-300 border border-green-900 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Skills Wanted */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Skills I Want to Learn</h2>
          {user?.skills_wanted?.length === 0 ? (
            <div className="text-gray-400">No skills listed.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user?.skills_wanted?.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-blue-950 text-blue-300 border border-blue-900 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Edit Skills</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-green-400">Skills I Can Offer</label>
                <textarea
                  value={editData.skills_offered}
                  onChange={(e) => setEditData({...editData, skills_offered: e.target.value})}
                  placeholder="e.g., JavaScript, Python, Design, Photography..."
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 placeholder:text-gray-400 focus:border-green-500 focus:outline-none transition-colors h-20 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">Separate skills with commas</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-blue-400">Skills I Want to Learn</label>
                <textarea
                  value={editData.skills_wanted}
                  onChange={(e) => setEditData({...editData, skills_wanted: e.target.value})}
                  placeholder="e.g., React, Machine Learning, Cooking, Music..."
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors h-20 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">Separate skills with commas</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 