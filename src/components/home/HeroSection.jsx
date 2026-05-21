import { motion } from "framer-motion";
import { Sparkles, Zap, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ButtonLink from "../common/ButtonLink";
import InteractivePhysicsHero from "../visuals/InteractivePhysicsHero";

function HeroSection() {
  const { currentUser, profile } = useAuth();

  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-96px)] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center md:px-8 overflow-hidden">
      <InteractivePhysicsHero />
      
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(0,245,255,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 shadow-2xl backdrop-blur-2xl"
      >
        {currentUser ? (
          <div className="flex items-center gap-2 px-4 py-1.5">
            <Sparkles size={14} className="text-electric" />
            <span>Welcome back, <span className="text-white">{profile?.name || currentUser.displayName || "Student"}</span></span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pl-4 pr-2">
              <Sparkles size={14} className="text-electric" />
              <span>Next-Gen JEE Preparation</span>
            </div>
            <Link
              to="/login"
              className="rounded-full bg-white px-5 py-1.5 text-[10px] font-black text-slate-950 transition hover:bg-electric hover:text-white"
            >
              Get Started
            </Link>
          </div>
        )}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8 }}
        className="relative z-10 text-6xl font-black tracking-tighter text-white md:text-8xl lg:text-9xl"
      >
        <span className="block opacity-90">Master JEE</span>
        <span className="text-electric glow-text-strong block -mt-2">with AI</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="relative z-10 mt-8 max-w-2xl text-lg font-medium leading-relaxed text-slate-400 md:text-xl lg:text-2xl"
      >
        The most advanced AI learning ecosystem for Physics, Maths, and Chemistry. 
        Visual intuition meets algorithmic precision.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-10 mt-12 flex flex-col items-center gap-6 sm:flex-row"
      >
        <Link 
          to="/learn" 
          className="group relative flex min-w-[220px] items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white px-8 py-5 text-lg font-black text-slate-950 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-electric/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10">Start Learning</span>
          <ChevronRight className="relative z-10 transition-transform group-hover:translate-x-1" size={20} />
        </Link>
        <Link 
          to="/quiz" 
          className="group flex min-w-[220px] items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-5 text-lg font-black text-white backdrop-blur-xl transition-all hover:bg-white/[0.08] hover:border-white/20 active:scale-95"
        >
          <Zap size={20} className="text-electric group-hover:fill-electric" />
          Battle Ground
        </Link>
      </motion.div>
    </section>
  );
}

export default HeroSection;