import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import axios from "../utils/api";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring" } } };

const RatingCard = ({ rating }) => (
  <motion.div
    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
    variants={itemVariants}
  >
    <div className="flex justify-between items-start mb-2">
      <p className="font-medium text-slate-100">Rated {rating.user.name}</p>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`w-5 h-5 ${i <= rating.stars ? 'text-amber-400 fill-current' : 'text-slate-500'}`} />
        ))}
      </div>
    </div>
    <p className="text-sm text-slate-400">{rating.comment}</p>
    <p className="text-xs text-slate-500 mt-2">{formatDistanceToNow(rating.createdAt)}</p>
  </motion.div>
);

export default function Ratings() {
  const [ratings, setRatings] = useState([]);
  const [newRating, setNewRating] = useState({ stars: 0, comment: "", userId: "" });

  useEffect(() => {
    axios.get("/ratings", { withCredentials: true }).then(res => setRatings(res.data));
  }, []);

  const handleSubmit = () => {
    axios.post("/ratings", newRating, { withCredentials: true }).then(() => {
      setNewRating({ stars: 0, comment: "", userId: "" });
      // Refresh ratings
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 md:p-8 bg-slate-900 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-8 text-white">
          Your Ratings
        </motion.h1>
        <motion.div variants={itemVariants} className="bg-slate-800/50 p-6 rounded-xl mb-8">
          <h3 className="text-xl font-semibold mb-4 text-white">Rate a Swap</h3>
          <div className="flex gap-1 mb-4">
            {[1,2,3,4,5].map(i => (
              <button key={i} onClick={() => setNewRating({ ...newRating, stars: i })}>
                <Star className={`w-8 h-8 ${i <= newRating.stars ? 'text-amber-400 fill-current' : 'text-slate-500'}`} />
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="User ID to rate"
            value={newRating.userId}
            onChange={e => setNewRating({ ...newRating, userId: e.target.value })}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 mb-4"
          />
          <textarea
            placeholder="What went well? (Optional)"
            value={newRating.comment}
            onChange={e => setNewRating({ ...newRating, comment: e.target.value })}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 mb-4"
            rows={3}
          />
          <button
            onClick={handleSubmit}
            className="w-full bg-emerald-600 hover:bg-emerald-700 p-3 rounded-lg font-semibold"
          >
            Submit Rating
          </button>
        </motion.div>
        <motion.div variants={containerVariants} className="space-y-4">
          {ratings.length > 0 ? (
            ratings.map(rating => <RatingCard key={rating.id} rating={rating} />)
          ) : (
            <p className="text-slate-400 text-center py-6">No ratings yet.</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}