import { motion } from "framer-motion";
import { Atom, Calculator, Cpu, Sparkles, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const subjects = [
  {
    title: "Physics Sensei",
    icon: Cpu,
    text: "Master mechanics, electricity, and modern physics with visual intuition.",
    theme: "from-blue-500/20 via-blue-500/5 to-transparent",
    accent: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    shadow: "shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    link: "/learn?subject=physics",
    Animation: () => (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <motion.div
          animate={{ x: ["0%", "100%", "0%"], y: ["0%", "100%", "0%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]"
        />
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M 10 50 Q 50 10 90 50 T 170 50" fill="transparent" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" className="opacity-30" />
        </svg>
      </div>
    ),
  },
  {
    title: "Maths Sensei",
    icon: Calculator,
    text: "Conquer calculus, algebra, and geometry through step-by-step guidance.",
    theme: "from-purple-500/20 via-purple-500/5 to-transparent",
    accent: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    shadow: "shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    link: "/learn?subject=maths",
    Animation: () => (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path
            d="M0,50 Q25,10 50,50 T100,50"
            fill="none"
            stroke="#a855f7"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
          />
          <motion.path
            d="M0,50 Q25,90 50,50 T100,50"
            fill="none"
            stroke="#a855f7"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 3, delay: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
          />
        </svg>
      </div>
    ),
  },
  {
    title: "Chemistry Sensei",
    icon: Atom,
    text: "Visualize reactions, bonds, and organic mechanisms in real-time.",
    theme: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    accent: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    shadow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    link: "/learn?subject=chemistry",
    Animation: () => (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="relative w-24 h-24"
        >
          <div className="absolute inset-0 rounded-full border border-emerald-500/30" />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-1/2 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"
          />
          <div className="absolute top-1/2 left-1/2 w-4 h-4 -ml-2 -mt-2 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981]" />
        </motion.div>
      </div>
    ),
  },
];

function SubjectCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="mb-16 text-center">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-electric"
        >
          Adaptive Learning Core
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-4xl font-black text-white md:text-6xl tracking-tight"
        >
          Choose Your <span className="text-electric glow-text">Sensei</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Proprietary AI engines dedicated to the JEE ecosystem. 
          Select a subject to initialize your immersive classroom.
        </motion.p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {subjects.map((subject, index) => {
          const Icon = subject.icon;
          return (
            <Link key={subject.title} to={subject.link}>
              <motion.article
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: "circOut" }}
                whileHover={{ y: -12 }}
                className={`group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-10 backdrop-blur-3xl transition-all duration-500 hover:border-white/20`}
              >
                {/* Neon Hover Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${subject.theme} opacity-0 transition-opacity duration-500 group-hover:opacity-40`} />
                
                {/* Tech Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
                
                <subject.Animation />
                
                <div className="relative z-10">
                  <div className={`mb-8 grid h-16 w-16 place-items-center rounded-2xl bg-white/5 border border-white/10 ${subject.accent} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-white flex items-center gap-3">
                    {subject.title}
                  </h3>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-slate-400 transition-colors group-hover:text-slate-300">
                    {subject.text}
                  </p>
                  
                  <div className="mt-10 flex items-center justify-between">
                    <div className={`text-[10px] font-black uppercase tracking-widest ${subject.accent}`}>
                      Initialising...
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all duration-300 group-hover:bg-white group-hover:text-slate-950`}>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </motion.article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default SubjectCards;
