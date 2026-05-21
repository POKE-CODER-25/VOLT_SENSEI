import { motion } from "framer-motion";
import { Zap, Trophy, Target, BarChart3, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const accessCards = [
  {
    title: "Physics Battle Ground",
    subtitle: "AI Quiz Arena",
    icon: Target,
    link: "/quiz?subject=physics",
    color: "text-electric",
    bg: "bg-electric/10",
    border: "border-electric/20",
  },
  {
    title: "Maths Battle Ground",
    subtitle: "Mastery Challenge",
    icon: Zap,
    link: "/quiz?subject=maths",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    title: "Chemistry Battle Ground",
    subtitle: "Molecular Speed Test",
    icon: Trophy,
    link: "/quiz?subject=chemistry",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    title: "Check Your Level",
    subtitle: "XP & Rank Analytics",
    icon: BarChart3,
    link: "/dashboard",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
];

function QuickAccess() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {accessCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.link}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: "backOut" }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/30 p-8 backdrop-blur-2xl transition-all duration-300 hover:border-white/10 hover:bg-slate-900/50 shadow-2xl`}
              >
                <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 ${card.color} shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-white/10 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]`}>
                  <Icon size={32} />
                </div>
                <h3 className="text-xl font-black text-white leading-tight tracking-tight group-hover:text-electric transition-colors">{card.title}</h3>
                <p className="mt-3 text-xs font-bold text-slate-500 uppercase tracking-widest">{card.subtitle}</p>
                
                <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "40%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                    className={`h-full bg-current ${card.color} opacity-40`} 
                   />
                </div>

                <div className={`mt-6 flex items-center justify-between opacity-0 transition-all duration-500 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0`}>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${card.color}`}>Active Mission</span>
                   <ChevronRight size={16} className="text-white" />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default QuickAccess;