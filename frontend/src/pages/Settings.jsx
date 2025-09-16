import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/api";
import { User, Palette, Bell, Shield, Trash2, X } from "lucide-react";


const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(), 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  const typeClasses = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  return (
    <div className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg text-white z-[100] animate-fade-in-up ${typeClasses}`}>
      {message}
    </div>
  );
};

const ToggleSwitch = ({ enabled, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 focus:ring-indigo-500 ${enabled ? 'bg-indigo-600' : 'bg-neutral-700'}`}
  >
    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const SettingsRow = ({ icon: Icon, title, description, children }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b border-neutral-800 last:border-b-0">
    <div className="flex items-start gap-4">
      <Icon className="w-5 h-5 mt-1 text-neutral-400" />
      <div>
        <h3 className="font-semibold text-neutral-100">{title}</h3>
        <p className="text-sm text-neutral-400">{description}</p>
      </div>
    </div>
    <div className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
      {children}
    </div>
  </div>
);

export default function Settings() {
  const navigate = useNavigate();
  // Mock settings state, you would fetch this from your user object
  const [notificationSettings, setNotificationSettings] = useState({ messages: true, requests: true });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [conpassword,setConPassword] = useState("");

   async function updateProfile(){    
      if(conpassword!==password){
        return;
      }   
      try{
        const updateData = {"name":name,"email":email,"password":password};
        let confirm = await axios.patch('/auth/updateProfile', updateData, { withCredentials: true });
        setIsOpen(false);
        if(!confirm){
          alert("Update Failed");
        }
      }catch(err){ 
        console.error("Failed to update profile", err);
        alert("Update Failed");
      }
    }
  
    function editprofile(){
      setIsOpen(true);
    }

  const showToast = (message, type = 'error') => {
    setNotification({ show: true, message, type });
  };
  
  const handleToggleNotification = async (key) => {
    const originalSettings = { ...notificationSettings };
    const newSettings = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(newSettings); // Optimistic update

    try {
      // --- API CALL ---
      await axios.patch("/auth/settings/notifications", newSettings, { withCredentials: true });
      showToast("Notification settings updated.", 'success');
    } catch (error) {
      console.error("Failed to update settings", error);
      setNotificationSettings(originalSettings); // Revert on failure
      showToast("Failed to update settings.");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      showToast("Confirmation text does not match.");
      return;
    }
    setIsDeleting(true);
    try {
      // --- API CALL ---
      await axios.delete("/auth/account", { withCredentials: true });
      navigate("/login", { state: { successMessage: "Account deleted successfully." } });
    } catch (error) {
      console.error("Failed to delete account", error);
      showToast("Failed to delete account. Please try again.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      {notification.show && <Toast message={notification.message} type={notification.type} onDismiss={() => setNotification({ show: false, message: '', type: '' })} />}
      <div className="max-w-4xl mx-auto p-4 md:p-6 text-neutral-200 font-sans">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-neutral-400 mt-1">Manage your account and application preferences.</p>
        </div>

        <div className="space-y-8">
          {/* Account Settings */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl shadow-lg">
            <div className="p-6 border-b border-neutral-800"><h2 className="text-xl font-semibold">Account</h2></div>
            <div className="p-2 md:p-4">
              <SettingsRow icon={User} title="Edit Profile" description="Update your name, profile information and password.">
                <button onClick={editprofile} className="px-3 py-1.5 text-sm bg-neutral-800 hover:bg-neutral-700 rounded-md font-semibold transition-colors">Edit</button>
              </SettingsRow>
            </div>
          </div>

          {/* Notifications Settings */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl shadow-lg">
            <div className="p-6 border-b border-neutral-800"><h2 className="text-xl font-semibold">Notifications</h2></div>
            <div className="p-2 md:p-4">
              <SettingsRow icon={Bell} title="New Messages" description="Receive an email for new chat messages.">
                <ToggleSwitch enabled={notificationSettings.messages} onToggle={() => handleToggleNotification('messages')} />
              </SettingsRow>
              <SettingsRow icon={Bell} title="Swap Requests" description="Get notified for new or updated swap requests.">
                <ToggleSwitch enabled={notificationSettings.requests} onToggle={() => handleToggleNotification('requests')} />
              </SettingsRow>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-950/20 border border-red-500/30 rounded-xl shadow-lg">
            <div className="p-6 border-b border-red-500/30"><h2 className="text-xl font-semibold text-red-300">Danger Zone</h2></div>
            <div className="p-2 md:p-4">
              <SettingsRow icon={Trash2} title="Delete Account" description="Permanently delete your account and all your data.">
                <button onClick={() => setShowDeleteModal(true)} className="px-3 py-1.5 text-sm bg-red-600/80 hover:bg-red-600 text-white rounded-md font-semibold transition-colors">Delete</button>
              </SettingsRow>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md mx-4 animate-fade-in-up shadow-2xl">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-red-400">Delete Account</h3>
                <button onClick={() => setShowDeleteModal(false)} className="p-1 rounded-full hover:bg-neutral-700"><X/></button>
            </div>
            <p className="text-neutral-400 mt-2 text-sm">This action is irreversible. All your data, including profile, skills, and matches, will be permanently deleted. To confirm, please type <strong className="text-red-400">DELETE</strong> in the box below.</p>
            <input 
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full mt-4 p-2 rounded-md bg-neutral-800 border border-neutral-700 focus:ring-2 focus:ring-red-500 outline-none"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 px-4 bg-neutral-700 text-white font-semibold rounded-md hover:bg-neutral-600 transition-colors">Cancel</button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== "DELETE"}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:bg-red-800/50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      )}

    {isOpen && (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={updateProfile}
        className="relative flex flex-col bg-neutral-900 p-6 rounded-2xl shadow-xl space-y-5 
                   w-full max-w-md max-h-screen overflow-y-auto"
      >
        <button
          onClick={() => setIsOpen(false)}
          type="button"
          className="absolute top-3 right-3 text-white text-lg font-bold hover:text-red-400 transition"
        >
          ✕
        </button>
          
        <h2 className="text-white text-2xl font-semibold text-center mb-2">
          Update Profile
        </h2>

        <div className="flex flex-col space-y-1">
          <label className="text-sm text-gray-300">Name</label>
          <input
            onChange={(e) => setName(e.target.value)}
            type="text"
            className="px-3 py-2 rounded-xl bg-neutral-800 text-white border 
                       border-neutral-700 focus:border-indigo-500 
                       focus:ring focus:ring-indigo-500/30 outline-none"
          />
        </div>
          
        <div className="flex flex-col space-y-1">
          <label className="text-sm text-gray-300">Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="px-3 py-2 rounded-xl bg-neutral-800 text-white border 
                       border-neutral-700 focus:border-indigo-500 
                       focus:ring focus:ring-indigo-500/30 outline-none"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm text-gray-300">Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="px-3 py-2 rounded-xl bg-neutral-800 text-white border 
                       border-neutral-700 focus:border-indigo-500 
                       focus:ring focus:ring-indigo-500/30 outline-none"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm text-gray-300">Confirm Password</label>
          <input
            onChange={(e) => setConPassword(e.target.value)}
            type="password"
            className="px-3 py-2 rounded-xl bg-neutral-800 text-white border 
                       border-neutral-700 focus:border-indigo-500 
                       focus:ring focus:ring-indigo-500/30 outline-none"
          />
          {conpassword !== password && (
            <span className="text-red-500 text-xs">
              Passwords do not match
            </span>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 
                     to-purple-600 text-white font-medium hover:from-indigo-600 
                     hover:to-purple-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  )}
    </>
  )}