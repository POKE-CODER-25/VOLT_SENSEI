import { motion } from "framer-motion";
import { Box, Layers, Shapes } from "lucide-react";
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
      <div className="mb-10 text-center">
        <p className="text-sm font-black uppercase text-electric">Visual Intuition</p>
        <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white md:text-5xl">
          3D Models
        </h2>
        <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Deepen your understanding with interactive 3D visualizations designed for JEE concepts.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {modelCategories.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <Link key={cat.title} to={cat.link}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`group relative overflow-hidden rounded-[2.5rem] border ${cat.border} bg-slate-900/40 p-10 backdrop-blur-xl transition-all duration-300 hover:bg-slate-900/60`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                    <Icon size={40} className={cat.accent} />
                  </div>
                  <h3 className="text-2xl font-black text-white">{cat.title}</h3>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-slate-400">
                    {cat.desc}
                  </p>
                  <div className={`mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest ${cat.accent}`}>
                    Explore Models &rarr;
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
