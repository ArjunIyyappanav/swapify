import { useEffect, useState } from "react";
import axios from "../utils/api";
import { Edit, Sparkles, Lightbulb, X } from "lucide-react";

// --- Reusable Components for this page ---

const Spinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center p-10">
    <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-neutral-400">{text}</p>
  </div>
);

const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const baseClasses = "fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg text-white z-[100] animate-fade-in-up";
  const typeClasses = type === 'success' ? 'bg-green-600' : 'bg-red-600';

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {message}
    </div>
  );
};


export default function MySkills() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ skills_offered: "", skills_wanted: "" });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

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
      setNotification({ show: true, message: "Skills updated successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      // Here you can set an error state inside the modal if you prefer
      setNotification({ show: true, message: "Failed to update skills.", type: "error" });
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
  
  if (loading) return <div className="p-6"><Spinner /></div>;

  return (
    <>
      {notification.show && (
        <Toast 
            message={notification.message} 
            type={notification.type} 
            onDismiss={() => setNotification({ show: false, message: '', type: '' })}
        />
      )}
      <div className="max-w-4xl mx-auto p-4 md:p-6 text-neutral-200 font-sans">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">My Skills</h1>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-indigo-500 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Skills
          </button>
        </div>

        <div className="space-y-6">
          {/* Skills Offered */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 shadow-lg">
            <h2 className="flex items-center gap-3 text-xl font-semibold mb-4 text-sky-300">
              <Sparkles className="w-6 h-6" />
              Skills I Can Offer
            </h2>
            <div className="flex flex-wrap gap-3">
              {user?.skills_offered?.length > 0 ? (
                user.skills_offered.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-sky-500/10 text-sky-300 border border-sky-500/20 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-neutral-500">You haven't listed any skills you can offer yet.</p>
              )}
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 shadow-lg">
            <h2 className="flex items-center gap-3 text-xl font-semibold mb-4 text-amber-300">
              <Lightbulb className="w-6 h-6" />
              Skills I Want to Learn
            </h2>
            <div className="flex flex-wrap gap-3">
              {user?.skills_wanted?.length > 0 ? (
                user.skills_wanted.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-neutral-500">You haven't listed any skills you want to learn yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* --- Edit Modal with Animation --- */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-lg mx-4 transition-transform duration-300 animate-fade-in-up shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Edit Skills</h3>
                <button onClick={handleCancel} className="p-1 rounded-full hover:bg-neutral-700"><X/></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-sky-300">Skills I Can Offer</label>
                  <textarea
                    value={editData.skills_offered}
                    onChange={(e) => setEditData({...editData, skills_offered: e.target.value})}
                    placeholder="e.g., JavaScript, Python, Design..."
                    className="w-full p-3 rounded-md bg-neutral-800 border border-neutral-700 placeholder:text-neutral-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition h-24 resize-none"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Separate skills with commas.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-amber-300">Skills I Want to Learn</label>
                  <textarea
                    value={editData.skills_wanted}
                    onChange={(e) => setEditData({...editData, skills_wanted: e.target.value})}
                    placeholder="e.g., React, Machine Learning, Cooking..."
                    className="w-full p-3 rounded-md bg-neutral-800 border border-neutral-700 placeholder:text-neutral-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition h-24 resize-none"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Separate skills with commas.</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2.5 px-4 bg-neutral-700 text-white font-semibold rounded-md hover:bg-neutral-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}