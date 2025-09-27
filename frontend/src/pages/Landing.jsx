import { motion } from "framer-motion";
import { ArrowRight, Repeat, MessageCircle, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring" } } };

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 text-slate-100">
      {/* Hero */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 px-4 text-center">
        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold mb-6">
          Swapify: Skill Swaps for VIT Chennai
        </motion.h1>
        <motion.p variants={itemVariants} className="text-xl mb-8 max-w-2xl mx-auto">
          Trade Python for UI/UX, form hackathon teams, and connect with peers. Exclusive for VITians.
        </motion.p>
        <motion.div variants={itemVariants}>
          <Link to="/signup" className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-semibold flex items-center gap-2 mx-auto w-fit">
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </motion.section>

      {/* Features Grid */}
      <motion.section variants={containerVariants} initial="hidden" whileInView="visible" className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          {[
            { icon: Repeat, title: "Skill Swaps", desc: "Trade skills instantly." },
            { icon: MessageCircle, title: "Real-Time Chat", desc: "Coordinate swaps seamlessly." },
            { icon: Users, title: "Hackathon Teams", desc: "Match for events." },
            { icon: Star, title: "Ratings", desc: "Build trust with reviews." },
          ].map((feat, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-slate-800/50 p-6 rounded-xl text-center hover:bg-slate-700 transition-colors">
              <feat.icon className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
              <p className="text-slate-400">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Footer */}
      <motion.section variants={itemVariants} className="py-12 text-center bg-slate-800/30">
        <p className="text-lg mb-4">Join 25+ VIT Chennai students swapping skills.</p>
        <Link to="/signup" className="text-red-400 hover:text-red-300 underline">Sign up with VIT email →</Link>
      </motion.section>
    </div>
  );
}