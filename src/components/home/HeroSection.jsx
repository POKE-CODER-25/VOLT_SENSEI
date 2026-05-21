import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, ChevronRight, X, Atom, Calculator, Cpu, MessageSquare, Box, BookOpen, Trophy } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ButtonLink from "../common/ButtonLink";
import InteractivePhysicsHero from "../visuals/InteractivePhysicsHero";

function HeroSection() {
  const { currentUser, profile } = useAuth();
  const [modalStep, setModalStep] = useState(0); // 0: closed, 1: subject, 2: activity
  const [selectedSubject, setSelectedSubject] = useState(null);
  const navigate = useNavigate();

  const subjects = [
    { id: "physics", name: "Physics Sensei", icon: Cpu, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { id: "maths", name: "Maths Sensei", icon: Calculator, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    { id: "chemistry", name: "Chemistry Sensei", icon: Atom, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
  ];

  const activities = [
    { name: "AI Classroom", icon: MessageSquare, desc: "Interactive concept learning", path: "/learn" },
    { name: "3D Models", icon: Box, desc: "Visual intuition & spatial logic", path: "/models" },
    { name: "Formulae with Fun", icon: BookOpen, desc: "Equation mastery system", path: "/formulae" },
    { name: "Battle Ground", icon: Trophy, desc: "Groq-powered quiz arena", path: "/quiz" },
  ];

  const handleOpenModal = () => {
    setModalStep(1);
    setSelectedSubject(null);
  };

  const handleCloseModal = () => {
    setModalStep(0);
    setSelectedSubject(null);
  };

  const handleSubjectSelect = (sub) => {
    setSelectedSubject(sub);
    setModalStep(2);
  };

  const handleActivitySelect = (act) => {
    if (!selectedSubject) return;
    
    if (act.path === "/models") {
      navigate(`/models/${selectedSubject.id}`);
    } else {
      const query = `?subject=${selectedSubject.id}`;
      navigate(`${act.path}${query}`);
    }
    handleCloseModal();
  };

  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-96px)] max-w-7xl flex-col items-center justify-center px-4 py-20 md:px-8 overflow-hidden">
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-12 w-full">
        
        {/* Left Side: Content */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 shadow-2xl backdrop-blur-2xl"
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
                <button
                  onClick={handleOpenModal}
                  className="rounded-full bg-white px-5 py-1.5 text-[10px] font-black text-slate-950 transition hover:bg-electric hover:text-white"
                >
                  Get Started
                </button>
              </div>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-6xl font-black tracking-tighter text-white md:text-8xl lg:text-9xl leading-[0.85]"
          >
            <span className="block opacity-90">Master JEE</span>
            <span className="text-electric glow-text-strong block">with AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-8 max-w-xl text-lg font-medium leading-relaxed text-slate-400 md:text-xl"
          >
            The most advanced AI learning ecosystem for Physics, Maths, and Chemistry. 
            Visual intuition meets algorithmic precision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-12 flex flex-col items-center lg:items-start gap-6 sm:flex-row"
          >
            <button 
              onClick={handleOpenModal}
              className="group relative flex min-w-[220px] items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white px-8 py-5 text-lg font-black text-slate-950 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-electric/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">Start Learning</span>
              <ChevronRight className="relative z-10 transition-transform group-hover:translate-x-1" size={20} />
            </button>
            <Link 
              to="/quiz" 
              className="group flex min-w-[220px] items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-5 text-lg font-black text-white backdrop-blur-xl transition-all hover:bg-white/[0.08] hover:border-white/20 active:scale-95"
            >
              <Zap size={20} className="text-electric group-hover:fill-electric" />
              Battle Ground
            </Link>
          </motion.div>
        </div>

        {/* Right Side: Interactive Physics Visual */}
        <div className="flex-1 w-full relative h-[400px] md:h-[600px] group">
           <div className="absolute inset-0 bg-electric/5 blur-[100px] rounded-full group-hover:bg-electric/10 transition-all duration-1000" />
           <div className="relative h-full w-full">
              <InteractivePhysicsHero />
              
              {/* Floating Data Tags */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 right-0 md:right-10 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-2xl hidden md:block"
              >
                 <div className="flex items-center gap-2 mb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-electric" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Quantum State</span>
                 </div>
                 <p className="text-xs font-black text-white uppercase tracking-tighter">Ψ(x,t) Resolved</p>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-1/4 left-0 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-2xl hidden md:block"
              >
                 <div className="flex items-center gap-2 mb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Momentum</span>
                 </div>
                 <p className="text-xs font-black text-white uppercase tracking-tighter">p = h/λ Active</p>
              </motion.div>
           </div>
        </div>

      </div>
      
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(0,245,255,0.08),transparent_70%)] pointer-events-none" />


      {/* Onboarding Flow Modal */}
      <AnimatePresence mode="wait">
        {modalStep > 0 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            <motion.div
              key={modalStep}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/50 p-8 md:p-12 shadow-2xl backdrop-blur-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-electric/5 to-purple-500/5 pointer-events-none" />
              
              <button
                onClick={handleCloseModal}
                className="absolute right-6 top-6 rounded-full bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="relative z-10">
                {modalStep === 1 ? (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-electric/10 px-4 py-1.5 border border-electric/20 mb-6">
                      <Sparkles size={14} className="text-electric" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-electric">Initialize Onboarding</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Choose Your <span className="text-electric">Path</span></h2>
                    <p className="text-slate-400 font-medium mb-10">Select a subject to begin your personalized JEE journey.</p>

                    <div className="grid gap-4">
                      {subjects.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => handleSubjectSelect(sub)}
                          className={`group flex items-center justify-between rounded-2xl border ${sub.border} ${sub.bg} p-6 transition-all hover:scale-[1.02] active:scale-[0.98]`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                              <sub.icon size={24} className={sub.color} />
                            </div>
                            <span className="text-lg font-black text-white">{sub.name}</span>
                          </div>
                          <ChevronRight size={20} className="text-slate-500 group-hover:text-white transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-1.5 border border-purple-500/20 mb-6">
                      {selectedSubject && <selectedSubject.icon size={14} className={selectedSubject.color} />}
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Activity Selection</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">What do you want to <span className="text-purple-400">do?</span></h2>
                    <p className="text-slate-400 font-medium mb-10">
                      Explore {selectedSubject?.name} through our specialized tools.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activities.map((act) => (
                        <button
                          key={act.name}
                          onClick={() => handleActivitySelect(act)}
                          className="group flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/5 bg-white/[0.03] p-6 transition-all hover:border-white/10 hover:bg-white/[0.06] hover:scale-[1.03] active:scale-[0.97]"
                        >
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950/50 shadow-inner">
                            <act.icon size={28} className="text-electric group-hover:scale-110 transition-transform" />
                          </div>
                          <div>
                            <p className="text-base font-black text-white">{act.name}</p>
                            <p className="mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{act.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => setModalStep(1)}
                      className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                      ← Back to Subjects
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default HeroSection;