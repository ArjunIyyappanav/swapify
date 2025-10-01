import { motion } from "framer-motion";
import { ArrowRight, Repeat, MessageCircle, Users, Star, Code, Palette, BookOpen, Zap, Shield, Calendar, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };
const itemVariants = { hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 10 } } };
const floatVariants = { y: [-10, 10], transition: { repeat: Infinity, repeatType: "reverse", duration: 2, ease: "easeInOut" } };

export default function Landing() {
  const [activeUsers, setActiveUsers] = useState(25);

  useEffect(() => {
    // Increment active users every 10-30 seconds randomly
    const interval = setInterval(() => {
      const randomDelay = Math.random() * 20000 + 10000; // 10-30 seconds
      
      setTimeout(() => {
        setActiveUsers(prev => prev + 1);
      }, randomDelay);
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-indigo-950/50 text-neutral-100 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            rotate: { duration: 50, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 7, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
        {/* Additional floating particles */}
        <motion.div 
          animate={{ 
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-400 rounded-full blur-sm"
        />
        <motion.div 
          animate={{ 
            y: [20, -20, 20],
            x: [10, -10, 10],
            opacity: [0.4, 0.9, 0.4]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-3/4 right-1/3 w-3 h-3 bg-pink-400 rounded-full blur-sm"
        />
      </div>
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1 }}
        className="relative py-20 px-4 text-center min-h-screen flex flex-col justify-center"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Exclusive for VIT Chennai Students
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-neutral-200 to-indigo-300 bg-clip-text text-transparent">
              Connect,
            </span>
            <br />
            <motion.span 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8, type: "spring", stiffness: 200 }}
              className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent inline-block"
            >
              Collaborate
            </motion.span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-12 max-w-3xl mx-auto text-neutral-300 leading-relaxed px-4 sm:px-0"
          >
            Connect with fellow VITians to exchange skills, form hackathon teams, and grow together. From coding to design, music to languages – find your perfect skill match.
          </motion.p>
          
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-md sm:max-w-none mx-auto"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link 
                to="/signup" 
                className="w-full sm:w-auto group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-red-500/25 text-sm sm:text-base relative overflow-hidden"
              >
                <span className="relative z-10">Get Started Free</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold border-2 border-neutral-600 hover:border-indigo-500 text-neutral-300 hover:text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-neutral-800/50 hover:to-indigo-900/20 text-center text-sm sm:text-base backdrop-blur-sm"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-8 sm:mt-16 text-neutral-500 text-xs sm:text-sm text-center px-4"
          >
            ✨ Join {activeUsers}+ VIT Chennai students already collaborating
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        variants={containerVariants} 
        initial="hidden" 
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-24 px-4 relative"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
              A complete platform designed for VIT Chennai students to exchange knowledge and collaborate effectively.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              { 
                icon: Repeat, 
                title: "Smart Skill Matching", 
                desc: "Our algorithm connects you with students who have the skills you need and want what you offer.",
                gradient: "from-blue-500 to-cyan-500"
              },
              { 
                icon: MessageCircle, 
                title: "Real-Time Chat", 
                desc: "Coordinate learning sessions with built-in chat, video calls, and meeting scheduling.",
                gradient: "from-green-500 to-emerald-500"
              },
              { 
                icon: Users, 
                title: "Team Formation", 
                desc: "Find teammates for hackathons and projects based on complementary skills and interests.",
                gradient: "from-purple-500 to-violet-500"
              },
              { 
                icon: Calendar, 
                title: "Meeting Scheduler", 
                desc: "Schedule and manage learning sessions with integrated calendar and reminder system.",
                gradient: "from-red-500 to-pink-500"
              },
            ].map((feat, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.05 }}
                className="group bg-neutral-900/50 backdrop-blur border border-neutral-800 p-6 rounded-2xl text-center hover:border-neutral-700 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feat.gradient} flex items-center justify-center`}>
                  <feat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neutral-300 group-hover:bg-clip-text transition-all duration-300">
                  {feat.title}
                </h3>
                <p className="text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Popular Skills Section */}
          <motion.div variants={itemVariants} className="text-center">
            <h3 className="text-2xl font-bold mb-8 text-neutral-200">Popular Skills Being Shared</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "React.js", "Python", "UI/UX Design", "Machine Learning", "Photography", 
                "Digital Marketing", "Graphic Design", "Data Science", "Mobile Development", 
                "Video Editing", "Music Production", "Content Writing"
              ].map((skill, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="px-4 py-2 bg-gradient-to-r from-neutral-800 to-neutral-700 border border-neutral-600 rounded-full text-sm text-neutral-300 hover:border-indigo-500/50 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* How It Works Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="py-24 px-4 bg-neutral-900/30"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              How PeerPort Works
            </h2>
            <p className="text-xl text-neutral-400">
              Get started in just 3 simple steps
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                desc: "Sign up with your VIT email and list the skills you can teach and want to learn.",
                icon: BookOpen
              },
              {
                step: "02",
                title: "Find Your Match",
                desc: "Browse and connect with fellow students who have complementary skills.",
                icon: Zap
              },
              {
                step: "03",
                title: "Start Learning",
                desc: "Schedule sessions, chat in real-time, and begin your skill exchange journey.",
                icon: Star
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="relative text-center"
              >
                <div className="mb-6">
                  <span className="text-6xl font-bold text-transparent bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text">
                    {step.step}
                  </span>
                </div>
                <div className="mb-4">
                  <step.icon className="w-12 h-12 mx-auto text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{step.title}</h3>
                <p className="text-neutral-400">{step.desc}</p>
                
                {i < 2 && (
                  <div className="hidden md:block absolute top-20 -right-4 w-8 h-0.5 bg-gradient-to-r from-neutral-600 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="py-24 px-4 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 backdrop-blur" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
              Join the growing community of VIT Chennai students who are learning, growing, and building together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link 
                to="/signup" 
                className="group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
              >
                Join PeerPort Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="text-neutral-500 text-sm">
                <Shield className="w-4 h-4 inline mr-2" />
                Secure • VIT Email Required • Free Forever
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-neutral-800">
              {[
                { number: `${activeUsers}+`, label: "Active Students", color: "from-indigo-400 to-purple-400" },
                { number: "500+", label: "Skills Exchanged", color: "from-green-400 to-emerald-400" },
                { number: "50+", label: "Teams Formed", color: "from-blue-400 to-cyan-400" },
                { number: "4.8★", label: "Average Rating", color: "from-yellow-400 to-orange-400" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center group cursor-pointer"
                >
                  <div className={`text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                    {stat.number}
                  </div>
                  <div className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-neutral-800 bg-neutral-950">
        <div className="max-w-4xl mx-auto text-center text-neutral-500 text-sm">
          <p className="mb-2">Made with ❤️ for VIT Chennai students</p>
          <p>© 2024 PeerPort. Connecting minds, building futures.</p>
        </div>
      </footer>
    </div>
  );
}
