import { motion } from "framer-motion";
import { Box, Layers, Shapes, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const modelCategories = [
  {
    title: "Physics Models",
    icon: Box,
    desc: "Visualize wave optics, mechanics, and EM fields in interactive 3D.",
    link: "/models/physics",
    color: "from-blue-600/20 to-cyan-400/20",
    accent: "text-cyan-400",
    border: "border-cyan-500/30",
  },
  {
    title: "Chemistry Models",
    icon: Shapes,
    desc: "Explore molecular geometry, crystal lattices, and orbital shapes.",
    link: "/models/chemistry",
    color: "from-emerald-600/20 to-teal-400/20",
    accent: "text-teal-400",
    border: "border-teal-500/30",
  },
  {
    title: "Maths Models",
    icon: Layers,
    desc: "Interactive surfaces, 3D calculus, and vector visualizations.",
    link: "/models/maths",
    color: "from-purple-600/20 to-pink-400/20",
    accent: "text-pink-400",
    border: "border-pink-500/30",
  },
];

function ModelSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="mb-16 text-center">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-electric"
        >
          Spatial Intelligence
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-4xl font-black text-white md:text-6xl"
        >
          3D Model <span className="text-electric glow-text">Vault</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          A curated repository of interactive spatial concepts. 
          Bridge the gap between theoretical equations and physical reality.
        </motion.p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {modelCategories.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <Link key={cat.title} to={cat.link}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -10 }}
                className={`group relative overflow-hidden rounded-[2.5rem] border ${cat.border} bg-slate-900/40 p-10 backdrop-blur-3xl transition-all duration-500`}
              >
                {/* Dynamic Gradient Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 transition-opacity duration-700 group-hover:opacity-100`} />
                
                {/* Geometric Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(45deg,#fff_1px,transparent_1px),linear-gradient(-45deg,#fff_1px,transparent_1px)] [background-size:30px_30px]" />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/5 border border-white/10 shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-[360deg] group-hover:bg-white/10`}>
                    <Icon size={44} className={cat.accent} />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">{cat.title}</h3>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-slate-400 transition-colors group-hover:text-white/80">
                    {cat.desc}
                  </p>
                  
                  <div className="mt-10 flex items-center gap-3">
                    <div className={`h-1.5 w-1.5 rounded-full bg-current ${cat.accent} animate-pulse`} />
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${cat.accent}`}>
                      Ready to Render
                    </span>
                  </div>

                  <div className={`mt-8 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white/40 transition-all duration-300 group-hover:text-white group-hover:gap-4`}>
                    Explore Gallery <ChevronRight size={14} />
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default ModelSection;
