import { motion } from "framer-motion";
import {
  Award,
  BatteryCharging,
  BookOpenCheck,
  Brain,
  Flame,
  Gamepad2,
  GraduationCap,
  Magnet,
  MessageCircle,
  RadioTower,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import ButtonLink from "../components/common/ButtonLink";
import HeroSection from "../components/home/HeroSection";
import SubjectCards from "../components/home/SubjectCards";

const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-90px" },
  transition: { duration: 0.55 },
};

const loveFeatures = [
  { icon: Brain, title: "AI tutoring", text: "Friendly anime explanations that adapt to your exact doubt." },
  { icon: BookOpenCheck, title: "Instant clarity", text: "Short, visual answers built for classes 8-12." },
  { icon: Gamepad2, title: "Gamified practice", text: "Quiz bursts, XP, streaks, and tiny wins after every concept." },
  { icon: Flame, title: "Daily streaks", text: "Momentum loops that make revision feel rewarding." },
  { icon: RadioTower, title: "Visual learning", text: "Circuits, fields, and formulas shown like a sci-fi HUD." },
  { icon: MessageCircle, title: "No judgement", text: "Ask the same doubt three ways and Sensei still helps." },
];

const leaderboard = [
  { name: "Aarav", rank: 1, xp: "18,420 XP", streak: "31 days" },
  { name: "Mira", rank: 2, xp: "16,980 XP", streak: "28 days" },
  { name: "Kabir", rank: 3, xp: "14,760 XP", streak: "21 days" },
];

const testimonials = [
  {
    name: "Riya, Class 10",
    text: "Ohm's law finally clicked. It feels like having a cool senior explain physics before the exam.",
  },
  {
    name: "Dev, Class 12",
    text: "The numericals feel less scary because Volt Sensei breaks every step into tiny wins.",
  },
  {
    name: "Anika, Class 9",
    text: "I came for the animations, stayed because the explanations are actually clear.",
  },
];

function SectionHeader({ eyebrow, title, text }) {
  return (
    <motion.div {...reveal} className="mx-auto mb-10 max-w-3xl text-center">
      <p className="text-sm font-black uppercase text-electric">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 dark:text-white md:text-5xl">
        {title}
      </h2>
      {text && (
        <p className="mt-4 text-lg font-medium leading-8 text-slate-700 dark:text-slate-300">
          {text}
        </p>
      )}
    </motion.div>
  );
}

function LiveAIDemo() {
  const answer = "Think of voltage like pressure, current like flowing charge, and resistance like a narrow pipe. Formula: I = V/R.";

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <SectionHeader
        eyebrow="Live AI preview"
        title="A tutor that feels awake, fast, and personal."
        text="A landing-page demo that shows the classroom experience before students even sign in."
      />
      <motion.div {...reveal} className="premium-surface mx-auto max-w-4xl overflow-hidden rounded-[2rem]">
        <div className="flex items-center justify-between border-b border-slate-200/80 p-5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-electric/10 text-electric shadow-glow">
              <Sparkles size={22} />
            </span>
            <div>
              <h3 className="font-black text-slate-950 dark:text-white">Volt Sensei Live</h3>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Streaming explanation preview</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-500">Online</span>
        </div>
        <div className="space-y-4 p-5">
          <div className="ml-auto max-w-xl rounded-3xl bg-gradient-to-br from-primary to-amber-300 p-4 font-bold text-slate-950 shadow-lg">
            Why does current decrease when resistance increases?
          </div>
          <div className="max-w-2xl rounded-3xl border border-electric/25 bg-electric/10 p-5 text-slate-800 shadow-[0_0_35px_rgba(0,245,255,0.16)] dark:text-slate-100">
            <p className="mb-3 text-xs font-black uppercase text-electric">Volt Sensei</p>
            <p className="leading-8">
              {answer.split(" ").map((word, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  initial={{ opacity: 0, y: 4 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.035 }}
                  className="mr-1 inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </p>
            <div className="mt-4 rounded-2xl border border-electric/30 bg-white/70 p-3 font-mono font-black text-electric dark:bg-white/5">
              I = V / R
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function StudentLove() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <SectionHeader
        eyebrow="Why students love it"
        title="Built like a study habit students actually want to keep."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loveFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.article
              key={feature.title}
              {...reveal}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -6 }}
              className="premium-surface rounded-3xl p-6"
            >
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-electric/30 bg-electric/10 text-electric shadow-glow">
                <Icon size={26} />
              </div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-700 dark:text-slate-300">{feature.text}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function StreakAndLeaderboard() {
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-16 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
      <motion.div {...reveal} className="premium-surface rounded-[2rem] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black uppercase text-electric">Daily streak</p>
            <h2 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">21 day voltage run</h2>
          </div>
          <motion.span
            animate={{ scale: [1, 1.12, 1], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/20 text-primary shadow-[0_0_36px_rgba(255,217,61,0.38)]"
          >
            <Flame size={34} />
          </motion.span>
        </div>
        <div className="mt-7 grid grid-cols-3 gap-3">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
              className="rounded-2xl border border-primary/25 bg-primary/15 p-4 text-center"
            >
              <p className="text-xs font-black text-slate-600 dark:text-slate-400">{day}</p>
              <Flame className="mx-auto mt-2 text-primary" size={22} />
            </motion.div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-electric/25 bg-electric/10 p-4">
          <p className="text-sm font-black text-electric">Level 8 · Circuit Samurai</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "78%" }}
              viewport={{ once: true }}
              className="h-full rounded-full bg-gradient-to-r from-electric to-primary shadow-glow"
            />
          </div>
        </div>
      </motion.div>

      <motion.div {...reveal} className="premium-surface rounded-[2rem] p-6">
        <p className="text-sm font-black uppercase text-electric">Top students</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">Leaderboard that sparks friendly competition.</h2>
        <div className="mt-6 space-y-3">
          {leaderboard.map((student, index) => (
            <motion.div
              key={student.name}
              whileHover={{ x: 6 }}
              className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-electric/10 font-black text-electric">
                  #{student.rank}
                </span>
                <div>
                  <p className="font-black text-slate-950 dark:text-white">{student.name}</p>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{student.streak} streak</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-primary">{student.xp}</p>
                <p className="text-xs font-black uppercase text-slate-500">Rank {index + 1}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function BeforeAfter() {
  const columns = [
    { title: "Before Volt Sensei", tone: "text-rose-500", items: ["Confusion", "Boredom", "Low scores", "Random practice"] },
    { title: "After Volt Sensei", tone: "text-electric", items: ["Confidence", "Clarity", "High scores", "Daily consistency"] },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <SectionHeader eyebrow="Before vs after" title="The learning transformation is obvious." />
      <div className="grid gap-5 md:grid-cols-2">
        {columns.map((column) => (
          <motion.div key={column.title} {...reveal} whileHover={{ y: -5 }} className="premium-surface rounded-[2rem] p-6">
            <h3 className={`text-2xl font-black ${column.tone}`}>{column.title}</h3>
            <div className="mt-6 grid gap-3">
              {column.items.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-4 font-black text-slate-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100">
                  <Star className={column.tone} size={18} />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <SectionHeader eyebrow="Student voices" title="Believable wins, one concept at a time." />
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <motion.article
            key={testimonial.name}
            {...reveal}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -6 }}
            className="premium-surface rounded-3xl p-6"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-electric/20 to-primary/20 font-black text-electric shadow-glow">
                {testimonial.name[0]}
              </div>
              <div>
                <p className="font-black text-slate-950 dark:text-white">{testimonial.name}</p>
                <p className="text-xs font-black uppercase text-primary">Verified learner</p>
              </div>
            </div>
            <p className="leading-7 text-slate-700 dark:text-slate-300">"{testimonial.text}"</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function PhysicsShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <SectionHeader
        eyebrow="Physics visualization"
        title="Electricity, fields, and formulas that move."
        text="A futuristic showcase for circuits, magnetic fields, and exam-ready formula memory."
      />
      <motion.div {...reveal} className="premium-surface relative overflow-hidden rounded-[2rem] p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="relative min-h-[320px] rounded-3xl border border-electric/20 bg-slate-950 p-6">
            <div className="absolute inset-0 electric-grid opacity-25" />
            <motion.div
              animate={{ x: ["0%", "72%", "0%"] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-8 top-1/2 h-3 w-3 rounded-full bg-primary shadow-[0_0_22px_rgba(255,217,61,0.9)]"
            />
            <div className="relative flex h-full items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                className="grid h-64 w-64 place-items-center rounded-full border border-dashed border-electric/40"
              >
                <Magnet className="text-electric" size={70} />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 font-mono font-black text-primary"
              >
                F = BIL
              </motion.div>
            </div>
          </div>
          <div className="grid content-center gap-4">
            {[
              ["Current path", "Animated charge flow shows direction and intensity."],
              ["Magnetic field", "Rotating field rings make invisible forces visible."],
              ["Formula memory", "Glowing equation cards help students recall faster."],
            ].map(([title, text], index) => (
              <motion.div
                key={title}
                whileHover={{ x: 5 }}
                className="rounded-2xl border border-slate-200/80 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <p className="font-black text-slate-950 dark:text-white">{index + 1}. {title}</p>
                <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function TrustMethodology() {
  const items = [
    ["Syllabus-focused", "Designed around class 8-12 electricity, circuits, and magnetism outcomes."],
    ["Reasoning first", "Answers emphasize formulas, substitutions, units, and intuition over shortcuts."],
    ["Student-safe AI", "Clear accuracy notes encourage verification while making doubts less intimidating."],
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <SectionHeader
        eyebrow="Learning methodology"
        title="Not a random AI wrapper. A focused physics learning system."
        text="Volt Sensei positions AI as a mentor, practice coach, visualizer, and revision partner for actual students."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {items.map(([title, text], index) => (
          <motion.div
            key={title}
            {...reveal}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -5 }}
            className="premium-surface rounded-3xl p-6"
          >
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-electric/10 text-electric shadow-[0_0_20px_rgba(0,245,255,0.22)]">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-950 dark:text-white">{title}</h3>
            <p className="mt-3 leading-7 text-slate-700 dark:text-slate-300">{text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PremiumFooter() {
  return (
    <footer className="mx-auto max-w-7xl px-4 pb-10 pt-16 md:px-8">
      <div className="premium-surface rounded-[2rem] p-6">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3 text-2xl font-black">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-electric/10 text-electric shadow-glow">
                <Zap fill="currentColor" />
              </span>
              VOLT <span className="text-electric glow-text">SENSEI</span>
            </div>
            <p className="mt-4 max-w-md leading-7 text-slate-700 dark:text-slate-300">
              A premium AI education platform for students who want physics to feel clear, fast, and alive.
            </p>
          </div>
          <div>
            <p className="font-black text-slate-950 dark:text-white">Product</p>
            <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <span>AI Classroom</span>
              <span>Quiz Arena</span>
              <span>Progress Dashboard</span>
            </div>
          </div>
          <div>
            <p className="font-black text-slate-950 dark:text-white">Social</p>
            <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <span>Instagram</span>
              <span>YouTube</span>
              <span>Discord</span>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200/80 pt-5 text-sm font-bold text-slate-500 dark:border-white/10">
          Built for the next generation of physics learners.
        </div>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <>
      <HeroSection />
      <LiveAIDemo />
      <StudentLove />
      <SubjectCards />
      <StreakAndLeaderboard />
      <BeforeAfter />
      <PhysicsShowcase />
      <TrustMethodology />
      <Testimonials />
      <section className="mx-auto max-w-7xl px-4 py-16 text-center md:px-8">
        <motion.div {...reveal} className="premium-surface rounded-[2rem] p-8 md:p-12">
          <Award className="mx-auto text-primary" size={42} />
          <h2 className="mt-4 text-3xl font-black text-slate-950 dark:text-white md:text-5xl">
            Ready to make physics your strongest subject?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium leading-8 text-slate-700 dark:text-slate-300">
            Enter the AI classroom, ask one doubt, and feel the difference in the first 15 seconds.
          </p>
          <div className="mt-7 flex justify-center">
            <ButtonLink to="/learn">Enter Volt Sensei</ButtonLink>
          </div>
        </motion.div>
      </section>
      <PremiumFooter />
    </>
  );
}

export default Home;
