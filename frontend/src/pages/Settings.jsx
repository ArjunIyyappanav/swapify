export default function Settings() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-100">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Appearance</h2>
          <p className="text-gray-400 text-sm">Dark theme is enabled by default.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Account</h2>
          <p className="text-gray-400 text-sm">Profile editing coming soon.</p>
        </div>
      </div>
    </div>
  );
} 