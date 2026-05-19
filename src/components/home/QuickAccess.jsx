import { motion } from "framer-motion";
import { Zap, Trophy, Target, BarChart3 } from "lucide-react";
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
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {accessCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.link}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`group relative overflow-hidden rounded-[2rem] border ${card.border} bg-white/50 p-6 backdrop-blur-xl transition-all hover:bg-white/80 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]`}
              >
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${card.bg} ${card.color} shadow-sm group-hover:shadow-glow transition-shadow`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{card.title}</h3>
                <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">{card.subtitle}</p>
                <div className={`mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-0 transition-all transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 ${card.color}`}>
                  Launch Now &rarr;
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