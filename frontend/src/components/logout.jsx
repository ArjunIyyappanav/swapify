import axios from "../utils/api";

export default function LogoutButton() {
  const handleLogout = async () => {
    await axios.post("/auth/logout", {}, { withCredentials: true });
    alert("Logged out");
  };

  return (
    <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
      Logout
    </button>
  );
}
