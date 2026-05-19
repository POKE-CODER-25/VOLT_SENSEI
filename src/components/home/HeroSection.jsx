import { motion } from "framer-motion";
import { Atom, BatteryCharging, BrainCircuit, CircuitBoard, Sparkles, Zap } from "lucide-react";
import ButtonLink from "../common/ButtonLink";

function HeroSection() {
  return (
    <section className="relative mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-10 px-4 py-14 md:grid-cols-[1fr_1fr] md:px-8 lg:py-20">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(0,245,255,0.22),transparent_62%)]" />
      <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-electric/18 blur-[150px]" />
      <div className="absolute right-0 top-28 hidden h-72 w-72 rounded-full bg-primary/12 blur-[120px] lg:block" />

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-electric/25 bg-white/55 px-4 py-2 text-sm font-black text-slate-950 shadow-[0_14px_35px_rgba(15,23,42,0.1)] backdrop-blur-xl dark:bg-electric/10 dark:text-electric"
        >
          <Sparkles size={16} />
          Contest-grade AI JEE mentor for classes 11-12
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl text-5xl font-black leading-[0.95] tracking-normal text-slate-950 drop-shadow-sm dark:text-white md:text-7xl lg:text-8xl"
        >
          Turn JEE panic into{" "}
          <span className="glow-text text-electric">AI-powered clarity</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.65 }}
          className="mt-7 max-w-2xl text-lg font-medium leading-8 text-slate-700 dark:text-slate-300 md:text-xl"
        >
          Volt Sensei blends anime energy, Groq-powered tutoring, and futuristic visual labs
          so Physics, Maths, and Chemistry finally feel addictive.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.65 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row"
        >
          <ButtonLink to="/learn?subject=physics">Start AI Lesson</ButtonLink>
          <ButtonLink to="/quiz" variant="ghost">
            Try Battle Ground
          </ButtonLink>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.55 }}
          className="mt-6 flex flex-wrap gap-2"
        >
          {["Powered by Groq", "Realtime AI JEE Mentor", "Physics + Maths + Chem", "Rank Growth System"].map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-black text-slate-300"
            >
              {badge}
            </span>
          ))}
        </motion.div>

        <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
          {[
            ["12K+", "practice sparks"],
            ["94%", "concept clarity"],
            ["24/7", "AI tutor"],
          ].map(([value, label]) => (
            <motion.div
              key={label}
              whileHover={{ y: -4 }}
              className="premium-surface rounded-2xl p-4"
            >
              <p className="text-2xl font-black text-slate-950 dark:text-white">{value}</p>
              <p className="mt-1 text-xs font-black uppercase text-slate-600 dark:text-slate-400">
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="relative z-10"
      >
        <div className="premium-surface hud-line relative mx-auto aspect-square max-w-[550px] rounded-[2rem] p-5 shadow-[0_35px_100px_rgba(0,94,130,0.22)]">
          <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_50%_28%,rgba(0,245,255,0.22),transparent_42%),linear-gradient(135deg,rgba(255,217,61,0.1),transparent_32%)]" />
          <motion.div
            animate={{ x: ["-20%", "115%"] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 h-px w-40 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
          />
          <div className="relative h-full overflow-hidden rounded-[1.5rem] border border-electric/20 bg-darkbg/95 p-5">
            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.08)_42%,transparent_58%)]" />
            <div className="absolute inset-x-8 top-20 h-px bg-gradient-to-r from-transparent via-electric/50 to-transparent" />
            <div className="absolute bottom-24 left-8 h-px w-1/2 bg-gradient-to-r from-electric/70 to-transparent" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-electric">Live Concept Lab</p>
                <p className="mt-1 text-xs text-slate-400">Multi-subject simulation</p>
              </div>
              <BatteryCharging className="text-primary" />
            </div>

            <div className="relative mt-10 grid place-items-center">
              <motion.div
                animate={{ opacity: [0.25, 0.7, 0.25] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                className="absolute h-64 w-64 rounded-full border border-electric/20"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="h-56 w-56 rounded-full border border-dashed border-electric/40"
              />
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 2.6, repeat: Infinity }}
                className="absolute grid h-32 w-32 place-items-center rounded-full border border-electric/50 bg-electric/10 text-electric shadow-glow"
              >
                <Atom size={58} />
              </motion.div>
              <motion.div
                animate={{ x: [0, 70, 0, -70, 0], y: [0, -35, -70, -35, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-4 w-4 rounded-full bg-primary shadow-[0_0_20px_rgba(255,217,61,0.9)]"
              />
              <motion.div
                animate={{ x: [-80, 80, -80], opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-1 w-36 rounded-full bg-gradient-to-r from-transparent via-electric to-transparent"
              />
              {[0, 1, 2, 3].map((particle) => (
                <motion.span
                  key={particle}
                  animate={{
                    x: [0, 110 - particle * 18, 0],
                    y: [0, -22 + particle * 12, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 2.8 + particle * 0.25, repeat: Infinity, delay: particle * 0.35 }}
                  className="absolute h-1.5 w-1.5 rounded-full bg-electric shadow-[0_0_16px_rgba(0,245,255,0.95)]"
                />
              ))}
            </div>

            <div className="mt-9 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs text-slate-400">Voltage</p>
                <p className="mt-1 text-2xl font-black text-primary">12 V</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs text-slate-400">Current</p>
                <p className="mt-1 text-2xl font-black text-electric">2.4 A</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-4">
              <BrainCircuit className="shrink-0 text-primary" size={24} />
              <p className="text-sm leading-6 text-slate-200">
                AI hint: increase resistance and current drops because I = V/R.
              </p>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-electric/30 bg-white/90 p-3 text-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur dark:bg-slate-900 dark:text-white sm:block"
          >
            <div className="flex items-center gap-2 text-xs font-black uppercase text-electric">
              <CircuitBoard size={14} />
              Formula Boost
            </div>
            <p className="mt-1 font-mono text-sm font-black">P = VI = I²R</p>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 3.4, repeat: Infinity }}
            className="absolute -right-3 top-12 hidden rounded-2xl border border-primary/30 bg-white/90 p-3 text-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur dark:bg-slate-900 dark:text-white sm:block"
          >
            <div className="flex items-center gap-2 text-xs font-black uppercase text-primary">
              <Zap size={14} />
              XP Surge
            </div>
            <p className="mt-1 text-sm font-black">+240 clarity points</p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
