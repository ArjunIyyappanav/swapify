import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, Filter, Star, MessageCircle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "../utils/api";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring" } } };

const TeamCard = ({ team, hasJoined, onJoinTeam }) => (
  <motion.div
    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-700 transition-colors"
    variants={itemVariants}
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-semibold text-white">{team.name}</h3>
      <div className="flex items-center gap-1 text-amber-400">
        <Star className="w-4 h-4 fill-current" />
        <span>{team.rating || "N/A"}</span>
      </div>
    </div>
    <p className="text-slate-400 mb-4">{team.hackathon} • {team.skills.join(", ")}</p>
    <div className="flex gap-2">
      {hasJoined ? (
        <div className="flex-1 bg-green-600 p-2 rounded-lg font-medium text-center text-white">
          ✓ Joined
        </div>
      ) : (
        <button 
          onClick={() => onJoinTeam(team)}
          className="flex-1 bg-red-600 hover:bg-red-700 p-2 rounded-lg font-medium text-center transition-colors"
        >
          Join Team
        </button>
      )}
      <Link to="/chat" className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg">
        <MessageCircle className="w-5 h-5" />
      </Link>
    </div>
  </motion.div>
);

export default function TeamRequests() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ skills: [], event: "" });
  const [userTeams, setUserTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, userTeamsRes] = await Promise.all([
          axios.get("/teams", { withCredentials: true }),
          axios.get("/team/mine", { withCredentials: true })
        ]);
        setTeams(teamsRes.data || []);
        setUserTeams(userTeamsRes.data?.sent || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const handleJoinTeam = async (team) => {
    setLoading(true);
    try {
      await axios.post("/team/create", {
        toUsername: team.name,
        description: `Request to join team for ${team.hackathon}`,
        status: "pending"
      }, { withCredentials: true });
      alert("Team join request sent successfully!");
      // Refresh data
      const userTeamsRes = await axios.get("/team/mine", { withCredentials: true });
      setUserTeams(userTeamsRes.data?.sent || []);
    } catch (error) {
      console.error("Failed to join team:", error);
      alert("Failed to join team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) && 
    filters.skills.every(s => t.skills.includes(s))
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 md:p-8 bg-slate-900 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-white">
            Find Hackathon Teams
          </motion.h1>
          <motion.div variants={itemVariants}>
            <Link 
              to="/team/create/new" 
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Team
            </Link>
          </motion.div>
        </div>
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search teams by name or skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-100">
            <Filter className="w-5 h-5" /> Filters
          </button>
        </motion.div>
        <motion.div variants={containerVariants} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" layout>
          {filteredTeams.length > 0 ? (
            filteredTeams.map(team => {
              const hasJoined = userTeams.some(userTeam => 
                userTeam.toUser?.name === team.name || userTeam.toTeam?.name === team.name
              );
              return (
                <TeamCard 
                  key={team.id} 
                  team={team} 
                  hasJoined={hasJoined}
                  onJoinTeam={handleJoinTeam}
                />
              );
            })
          ) : (
            <p className="col-span-full text-center py-8 text-slate-500">
              No teams match. <Link to="/team/create/new" className="text-indigo-400 underline">Create a team</Link>
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}