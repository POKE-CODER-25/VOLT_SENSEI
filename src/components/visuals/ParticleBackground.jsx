import { motion } from "framer-motion";

const particles = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 19) % 100}%`,
  delay: (index % 7) * 0.35,
  duration: 4 + (index % 5),
}));

function ParticleBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        animate={{ backgroundPosition: ["0px 0px", "56px 56px"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="electric-grid absolute inset-0 opacity-50 dark:opacity-80"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,245,255,0.14),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(255,217,61,0.1),transparent_28%)] opacity-70 dark:opacity-90" />
      <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-electric/20 to-transparent" />
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute h-1 w-1 rounded-full bg-electric shadow-[0_0_14px_rgba(0,245,255,0.8)]"
          style={{ left: particle.left, top: particle.top }}
          animate={{
            y: [0, -26, 0],
            opacity: [0.08, 0.58, 0.08],
            scale: [1, 1.35, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default ParticleBackground;
