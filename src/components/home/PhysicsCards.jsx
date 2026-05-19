import { motion } from "framer-motion";
import { Activity, Gauge, Magnet, RadioTower } from "lucide-react";

const cards = [
  {
    icon: Activity,
    title: "Current Flow",
    text: "Trace charge movement through circuits with visual checkpoints.",
    accent: "text-electric",
  },
  {
    icon: Gauge,
    title: "Ohm's Law",
    text: "Build intuition for voltage, current, resistance, and power.",
    accent: "text-primary",
  },
  {
    icon: Magnet,
    title: "Magnetism",
    text: "Understand fields, force direction, solenoids, and motors.",
    accent: "text-electric",
  },
  {
    icon: RadioTower,
    title: "Electromagnetic Waves",
    text: "Connect changing fields with waves and real-world technology.",
    accent: "text-primary",
  },
];

function PhysicsCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase text-electric">Learning modules</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white md:text-5xl">
            Physics that looks alive.
          </h2>
        </div>
        <p className="max-w-xl text-slate-600 dark:text-slate-300">
          Every module is designed like a mission: short lessons, visual intuition,
          AI checks, and a quiz burst that converts practice into XP.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.08 }}
              className="premium-surface group relative overflow-hidden rounded-3xl p-6 transition hover:-translate-y-1 hover:border-electric/50"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className={`mb-8 grid h-14 w-14 place-items-center rounded-2xl border border-current/25 bg-current/10 ${card.accent}`}>
                <Icon size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">{card.title}</h3>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{card.text}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export default PhysicsCards;
