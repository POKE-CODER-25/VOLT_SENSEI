import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ButtonLink from "../common/ButtonLink";

function HeroSection() {
  const { currentUser, profile } = useAuth();

  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-96px)] max-w-5xl flex-col items-center justify-center px-4 py-20 text-center md:px-8">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(0,245,255,0.15),transparent_70%)]" />
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200/50 bg-white/50 p-1.5 text-sm font-bold text-slate-800 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200"
      >
        {currentUser ? (
          <div className="flex items-center gap-2 px-3 py-1">
            <Sparkles size={16} className="text-electric" />
            <span>Welcome back, {profile?.name || currentUser.displayName || "Student"}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pl-3">
              <Sparkles size={16} className="text-electric" />
              <span>Login to start your JEE journey</span>
            </div>
            <Link
              to="/login"
              className="rounded-full bg-electric px-4 py-1.5 text-xs font-black text-slate-950 transition hover:bg-electric/80"
            >
              Login
            </Link>
          </div>
        )}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="relative z-10 text-5xl font-black tracking-tight text-slate-950 dark:text-white md:text-7xl lg:text-8xl"
      >
        Master JEE <span className="text-electric glow-text">with AI</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative z-10 mt-6 max-w-2xl text-lg font-medium leading-relaxed text-slate-600 dark:text-slate-400 md:text-xl"
      >
        Physics + Maths + Chemistry in one personalized AI mentor.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative z-10 mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <ButtonLink to="/learn" className="min-w-[200px] justify-center text-lg">
          Start Learning
        </ButtonLink>
        <ButtonLink to="/quiz" variant="ghost" className="min-w-[200px] justify-center text-lg bg-slate-100 dark:bg-white/5">
          <Zap size={18} className="mr-2 inline-block" />
          Battle Ground
        </ButtonLink>
      </motion.div>
    </section>
  );
}

export default HeroSection;