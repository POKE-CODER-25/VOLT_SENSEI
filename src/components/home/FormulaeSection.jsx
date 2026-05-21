import { motion } from "framer-motion";
import { Sparkles, BookOpen, ChevronRight, Calculator, Atom, Cpu } from "lucide-react";
import { Link } from "react-router-dom";

function FormulaeSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 md:px-8 py-12 md:py-24">
      <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-slate-900/40 p-8 md:p-16 backdrop-blur-3xl">
        {/* Glow Effects */}
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-electric/20 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Content Area */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 border border-white/10 mb-6">
              <Sparkles size={16} className="text-electric" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">The Heart of Volt Sensei</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Formulae with <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-purple-500">Fun</span>
            </h2>
            
            <p className="text-lg md:text-xl text-slate-400 font-medium mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Stop memorizing blindly. Master JEE equations through our elite AI teaching system. Experience step-by-step logical breakdowns, dynamic variable highlighting, and visual understanding designed for real exam application.
            </p>
            
            <Link to="/formulae">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center gap-4 overflow-hidden rounded-2xl bg-white px-8 py-4 text-slate-950 font-black shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:bg-slate-200"
              >
                <BookOpen size={20} className="transition-transform group-hover:scale-110" />
                <span>Explore Formulae</span>
                <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>
          </div>

          {/* Visual/Card Showcase */}
          <div className="flex-1 w-full max-w-lg relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-electric/10 to-transparent rounded-[2rem] transform rotate-3" />
            <div className="relative bg-slate-950/80 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500">
              
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex gap-3">
                  <Cpu size={16} className="text-cyan-400" />
                  <Calculator size={16} className="text-pink-400" />
                  <Atom size={16} className="text-teal-400" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="h-4 w-1/3 bg-white/10 rounded-full animate-pulse" />
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                  <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-electric to-purple-400 tracking-wider">
                    F = ma
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-electric/20 flex items-center justify-center">
                      <Sparkles size={10} className="text-electric" />
                    </div>
                    <div className="h-2 w-3/4 bg-white/10 rounded-full" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <BookOpen size={10} className="text-purple-400" />
                    </div>
                    <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FormulaeSection;
